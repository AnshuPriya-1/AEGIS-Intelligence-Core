import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { GlassPanel } from '../atoms/GlassPanel';
import { Badge } from '../atoms/Badge';
import { Layers, Eye, RefreshCw, ZoomIn, ZoomOut, Compass, Navigation } from 'lucide-react';
import portsData from '../../data/ports.json';
import routesData from '../../data/routes.json';

export function GlobePanel() {
  const containerRef = useRef(null);
  const { theme } = useTheme();
  const { globeLayers, toggleGlobeLayer } = useApp();
  const [hoveredPort, setHoveredPort] = useState(null);
  const [selectedPort, setSelectedPort] = useState(null);
  const [autoRotate, setAutoRotate] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Scene, Camera, Renderer Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 240;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // Globe Group
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // Dark vs Light Mode Adaptation
    const isDark = theme === 'dark';
    const sphereBgColor = isDark ? 0x0c141d : 0xe2e8f0;
    const wireframeColor = isDark ? 0x1f2e3d : 0xcbdfeb;
    const atmosphereColor = isDark ? 0x00d9c0 : 0x00a896;

    // 1. Globe Sphere
    const geometry = new THREE.SphereGeometry(70, 64, 64);
    const material = new THREE.MeshPhongMaterial({
      color: sphereBgColor,
      emissive: isDark ? 0x081018 : 0xf1f5f9,
      shininess: 25,
      wireframe: false,
    });
    const earthMesh = new THREE.Mesh(geometry, material);
    globeGroup.add(earthMesh);

    // 2. Grid Wireframe Overlay
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: wireframeColor,
      wireframe: true,
      transparent: true,
      opacity: isDark ? 0.35 : 0.45,
    });
    const wireframeMesh = new THREE.Mesh(geometry, wireframeMat);
    wireframeMesh.scale.set(1.002, 1.002, 1.002);
    globeGroup.add(wireframeMesh);

    // 3. Atmosphere Glow Outer Ring
    const atmosphereGeo = new THREE.SphereGeometry(74, 32, 32);
    const atmosphereMat = new THREE.MeshBasicMaterial({
      color: atmosphereColor,
      transparent: true,
      opacity: isDark ? 0.12 : 0.08,
      side: THREE.BackSide,
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    scene.add(atmosphereMesh);

    // Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, isDark ? 0.8 : 1.2);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, isDark ? 1.5 : 1.0);
    dirLight1.position.set(200, 100, 200);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x00d9c0, isDark ? 0.8 : 0.4);
    dirLight2.position.set(-200, -100, -100);
    scene.add(dirLight2);

    // Helper Lat/Lng to Vector3
    const latLngToVector = (lat, lng, radius) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lng + 180) * (Math.PI / 180);
      const x = -(radius * Math.sin(phi) * Math.cos(theta));
      const z = radius * Math.sin(phi) * Math.sin(theta);
      const y = radius * Math.cos(phi);
      return new THREE.Vector3(x, y, z);
    };

    // 4. Strategic Ports Markers & Pulsing Rings
    const portMeshes = [];
    if (globeLayers.strategicPorts) {
      portsData.forEach((port) => {
        const pos = latLngToVector(port.lat, port.lng, 70.8);
        const portGroup = new THREE.Group();
        portGroup.position.copy(pos);

        // Core Dot
        const dotGeo = new THREE.SphereGeometry(port.riskLevel === 'danger' ? 1.8 : 1.2, 16, 16);
        const dotMat = new THREE.MeshBasicMaterial({
          color: port.riskLevel === 'danger' ? 0xff4757 : port.riskLevel === 'warning' ? 0xffb800 : 0x00d9c0,
        });
        const dotMesh = new THREE.Mesh(dotGeo, dotMat);
        portGroup.add(dotMesh);

        // Outer Ring
        const ringGeo = new THREE.RingGeometry(2, 2.6, 32);
        const ringMat = new THREE.MeshBasicMaterial({
          color: port.riskLevel === 'danger' ? 0xff4757 : 0x00d9c0,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.7,
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.lookAt(new THREE.Vector3(0, 0, 0));
        portGroup.add(ringMesh);

        portGroup.userData = port;
        portMeshes.push(portGroup);
        globeGroup.add(portGroup);
      });
    }

    // 5. Shipping Arcs & Energy Flow
    if (globeLayers.shippingRoutes || globeLayers.energyFlow) {
      routesData.forEach((route) => {
        const start = latLngToVector(route.startLat, route.startLng, 71);
        const end = latLngToVector(route.endLat, route.endLng, 71);

        // Calculate 3D Arc Curve
        const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
        const distance = start.distanceTo(end);
        mid.setLength(70 + distance * 0.35); // arc height

        const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
        const points = curve.getPoints(50);
        const curveGeometry = new THREE.BufferGeometry().setFromPoints(points);

        const curveMaterial = new THREE.LineBasicMaterial({
          color: route.status === 'danger' ? 0xff4757 : route.status === 'warning' ? 0xffb800 : 0x00d9c0,
          linewidth: route.stroke || 2,
          transparent: true,
          opacity: isDark ? 0.8 : 0.9,
        });

        const line = new THREE.Line(curveGeometry, curveMaterial);
        globeGroup.add(line);
      });
    }

    // Interactive Dragging & Auto Rotate Logic
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const handleMouseDown = (e) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const deltaMove = {
        x: e.clientX - previousMousePosition.x,
        y: e.clientY - previousMousePosition.y,
      };

      globeGroup.rotation.y += deltaMove.x * 0.005;
      globeGroup.rotation.x += deltaMove.y * 0.005;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('mousedown', handleMouseDown);
    domElem.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // Animation Loop
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (autoRotate && !isDragging) {
        globeGroup.rotation.y += 0.002;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (domElem) {
        domElem.removeEventListener('mousedown', handleMouseDown);
        domElem.removeEventListener('mousemove', handleMouseMove);
      }
      window.removeEventListener('mouseup', handleMouseUp);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [theme, globeLayers, autoRotate]);

  return (
    <GlassPanel className="relative h-[560px] flex flex-col justify-between overflow-hidden p-0">
      {/* Globe Controls & Layer Toggles Header */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center space-x-2 bg-[var(--panel)]/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[var(--border)] pointer-events-auto">
          <Navigation className="w-4 h-4 text-[var(--signal)] animate-spin-slow" />
          <span className="text-xs font-bold font-display tracking-wider uppercase text-[var(--text)]">
            Global Digital Twin
          </span>
          <span className="w-2 h-2 rounded-full bg-[var(--signal)] animate-ping" />
        </div>

        {/* Layer Controls */}
        <div className="flex items-center space-x-1.5 bg-[var(--panel)]/90 backdrop-blur-md p-1 rounded-lg border border-[var(--border)] pointer-events-auto">
          <button
            onClick={() => toggleGlobeLayer('shippingRoutes')}
            className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all ${
              globeLayers.shippingRoutes
                ? 'bg-[var(--signal)]/20 text-[var(--signal)] border border-[var(--signal)]/40 font-bold'
                : 'text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            Routes
          </button>
          <button
            onClick={() => toggleGlobeLayer('strategicPorts')}
            className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all ${
              globeLayers.strategicPorts
                ? 'bg-[var(--signal)]/20 text-[var(--signal)] border border-[var(--signal)]/40 font-bold'
                : 'text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            Ports
          </button>
          <button
            onClick={() => toggleGlobeLayer('riskZones')}
            className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all ${
              globeLayers.riskZones
                ? 'bg-[var(--danger)]/20 text-[var(--danger)] border border-[var(--danger)]/40 font-bold'
                : 'text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            Risk Zones
          </button>
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-1.5 rounded text-[11px] transition-all ${
              autoRotate ? 'text-[var(--signal)]' : 'text-[var(--muted)]'
            }`}
            title="Toggle Auto Rotate"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin-slow' : ''}`} />
          </button>
        </div>
      </div>

      {/* Three.js Canvas Container */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating Ports Quick Legend Bar */}
      <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="bg-[var(--panel)]/90 backdrop-blur-md px-3 py-2 rounded-lg border border-[var(--border)] pointer-events-auto flex items-center space-x-4 text-[11px] font-mono">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-[var(--danger)] shadow-[0_0_6px_var(--danger)]" />
            <span className="text-[var(--text)]">Threat Chokepoint (Hormuz)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-[var(--warning)] shadow-[0_0_6px_var(--warning)]" />
            <span className="text-[var(--text)]">Caution Zone (Malacca / Suez)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-[var(--signal)] shadow-[0_0_6px_var(--signal)]" />
            <span className="text-[var(--text)]">Secure Transit (Cushing / Rotterdam)</span>
          </div>
        </div>

        <div className="bg-[var(--panel)]/90 backdrop-blur-md px-3 py-2 rounded-lg border border-[var(--border)] pointer-events-auto text-[11px] font-mono text-[var(--muted)]">
          Telemetry: <span className="text-[var(--signal)] font-bold">100% Sync</span>
        </div>
      </div>
    </GlassPanel>
  );
}
