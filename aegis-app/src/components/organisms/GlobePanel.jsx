import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { GlassPanel } from '../atoms/GlassPanel';
import { Badge } from '../atoms/Badge';
import { Layers, Eye, RefreshCw, ZoomIn, ZoomOut, Compass, Navigation, X, MapPin } from 'lucide-react';
import portsData from '../../data/ports.json';
import routesData from '../../data/routes.json';
import countriesData from '../../data/countries.json';
import worldLandMask from '../../assets/world-land-mask.png';

// Convert lat/lng (degrees) to a position on a sphere of the given radius.
// Matches the UV unwrap of THREE.SphereGeometry so texture + markers line up.
function latLngToVector(lat, lng, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

export function GlobePanel() {
  const containerRef = useRef(null);
  const { theme } = useTheme();
  const { globeLayers, toggleGlobeLayer, focusTarget, focusRequestId, setFocusTarget } = useApp();
  const [autoRotate, setAutoRotate] = useState(true);
  const [selected, setSelected] = useState(null); // { label, sub, status, kind }

  // Refs shared between the setup effect and the "fly to focus target" effect
  const globeGroupRef = useRef(null);
  const cameraRef = useRef(null);
  const targetQuatRef = useRef(null); // THREE.Quaternion | null -> when set, animate loop slerps toward it
  const highlightRef = useRef(null); // pulsing marker mesh shown at the focused location

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Scene, Camera, Renderer Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 240;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // Globe Group
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);
    globeGroupRef.current = globeGroup;

    // Dark vs Light Mode Adaptation
    const isDark = theme === 'dark';
    const sphereBgColor = isDark ? 0x0c141d : 0xe2e8f0;
    const wireframeColor = isDark ? 0x1f2e3d : 0xcbdfeb;
    const atmosphereColor = isDark ? 0x00d9c0 : 0x00a896;
    const landColor = isDark ? 0x123326 : 0x0f766e;

    // 1. Globe Sphere (ocean base)
    const geometry = new THREE.SphereGeometry(70, 64, 64);
    const material = new THREE.MeshPhongMaterial({
      color: sphereBgColor,
      emissive: isDark ? 0x081018 : 0xf1f5f9,
      shininess: 25,
      wireframe: false,
    });
    const earthMesh = new THREE.Mesh(geometry, material);
    globeGroup.add(earthMesh);

    // 1b. Real continent shapes, projected from actual world land-mass data
    // (equirectangular texture, transparent ocean so the base sphere color shows through)
    const textureLoader = new THREE.TextureLoader();
    const landTexture = textureLoader.load(worldLandMask);
    landTexture.colorSpace = THREE.SRGBColorSpace;
    const landGeo = new THREE.SphereGeometry(70.15, 64, 64);
    const landMat = new THREE.MeshPhongMaterial({
      map: landTexture,
      transparent: true,
      color: landColor,
      emissive: landColor,
      emissiveIntensity: isDark ? 0.35 : 0.15,
      shininess: 10,
      depthWrite: false,
    });
    const landMesh = new THREE.Mesh(landGeo, landMat);
    globeGroup.add(landMesh);

    // 2. Grid Wireframe Overlay
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: wireframeColor,
      wireframe: true,
      transparent: true,
      opacity: isDark ? 0.35 : 0.45,
    });
    const wireframeMesh = new THREE.Mesh(geometry, wireframeMat);
    wireframeMesh.scale.set(1.006, 1.006, 1.006);
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

    // 4. Strategic Ports Markers & Pulsing Rings (clickable)
    const portMeshes = [];
    if (globeLayers.strategicPorts) {
      portsData.forEach((port) => {
        const pos = latLngToVector(port.lat, port.lng, 70.8);
        const portGroup = new THREE.Group();
        portGroup.position.copy(pos);

        const dotGeo = new THREE.SphereGeometry(port.riskLevel === 'danger' ? 1.8 : 1.2, 16, 16);
        const dotMat = new THREE.MeshBasicMaterial({
          color: port.riskLevel === 'danger' ? 0xff4757 : port.riskLevel === 'warning' ? 0xffb800 : 0x00d9c0,
        });
        const dotMesh = new THREE.Mesh(dotGeo, dotMat);
        dotMesh.userData = { kind: 'port', ...port };
        portGroup.add(dotMesh);

        // Bigger invisible hit-area sphere so ports are easy to click
        const hitGeo = new THREE.SphereGeometry(3.2, 8, 8);
        const hitMat = new THREE.MeshBasicMaterial({ visible: false });
        const hitMesh = new THREE.Mesh(hitGeo, hitMat);
        hitMesh.userData = { kind: 'port', ...port };
        portGroup.add(hitMesh);

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

        portGroup.userData = { kind: 'port', ...port };
        portMeshes.push(dotMesh, hitMesh);
        globeGroup.add(portGroup);
      });
    }

    // 4b. Country Markers (clickable pins for the countries in the intelligence DB)
    const countryMeshes = [];
    if (globeLayers.countries !== false) {
      countriesData.forEach((country) => {
        if (country.lat == null || country.lng == null) return;
        const pos = latLngToVector(country.lat, country.lng, 70.8);
        const pinGeo = new THREE.ConeGeometry(1.1, 3, 12);
        const color = country.status === 'danger' ? 0xff4757 : country.status === 'warning' ? 0xffb800 : 0x38bdf8;
        const pinMat = new THREE.MeshBasicMaterial({ color });
        const pinMesh = new THREE.Mesh(pinGeo, pinMat);
        pinMesh.position.copy(pos);
        pinMesh.lookAt(0, 0, 0);
        pinMesh.rotateX(Math.PI / 2);
        pinMesh.userData = { kind: 'country', ...country };

        const hitGeo = new THREE.SphereGeometry(3, 8, 8);
        const hitMat = new THREE.MeshBasicMaterial({ visible: false });
        const hitMesh = new THREE.Mesh(hitGeo, hitMat);
        hitMesh.position.copy(pos);
        hitMesh.userData = { kind: 'country', ...country };

        countryMeshes.push(pinMesh, hitMesh);
        globeGroup.add(pinMesh);
        globeGroup.add(hitMesh);
      });
    }

    // 5. Shipping Arcs & Energy Flow
    if (globeLayers.shippingRoutes || globeLayers.energyFlow) {
      routesData.forEach((route) => {
        const start = latLngToVector(route.startLat, route.startLng, 71);
        const end = latLngToVector(route.endLat, route.endLng, 71);

        const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
        const distance = start.distanceTo(end);
        mid.setLength(70 + distance * 0.35);

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

    // 6. Highlight marker shown at whatever location is currently focused (search result / click)
    const highlightGeo = new THREE.RingGeometry(3, 4.2, 32);
    const highlightMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
    });
    const highlightMesh = new THREE.Mesh(highlightGeo, highlightMat);
    highlightMesh.visible = false;
    globeGroup.add(highlightMesh);
    highlightRef.current = highlightMesh;

    // Interactive Dragging, Click-to-select, and Auto Rotate Logic
    let isDragging = false;
    let dragDistance = 0;
    let previousMousePosition = { x: 0, y: 0 };
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const handleMouseDown = (e) => {
      isDragging = true;
      dragDistance = 0;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const deltaMove = {
        x: e.clientX - previousMousePosition.x,
        y: e.clientY - previousMousePosition.y,
      };
      dragDistance += Math.abs(deltaMove.x) + Math.abs(deltaMove.y);

      globeGroup.rotation.y += deltaMove.x * 0.005;
      globeGroup.rotation.x += deltaMove.y * 0.005;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const pickAt = (clientX, clientY) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects([...portMeshes, ...countryMeshes], false);
      return hits.length > 0 ? hits[0].object.userData : null;
    };

    const handleMouseUp = (e) => {
      isDragging = false;
      // Treat as a click (not a drag) if the pointer barely moved
      if (dragDistance < 4 && e && e.target === renderer.domElement) {
        const hit = pickAt(e.clientX, e.clientY);
        if (hit) {
          setAutoRotate(false);
          setFocusTarget({
            id: hit.id || hit.code,
            label: hit.name,
            lat: hit.lat,
            lng: hit.lng,
            kind: hit.kind,
            meta: hit,
          });
        }
      }
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('mousedown', handleMouseDown);
    domElem.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // Animation Loop
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (targetQuatRef.current) {
        globeGroup.quaternion.slerp(targetQuatRef.current, 0.06);
        if (globeGroup.quaternion.angleTo(targetQuatRef.current) < 0.01) {
          globeGroup.quaternion.copy(targetQuatRef.current);
          targetQuatRef.current = null;
        }
      } else if (autoRotate && !isDragging) {
        globeGroup.rotation.y += 0.002;
      }

      // Pulse the highlight ring
      if (highlightMesh.visible) {
        const t = (Date.now() % 1500) / 1500;
        highlightMesh.scale.setScalar(1 + t * 1.2);
        highlightMat.opacity = 0.9 * (1 - t);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, globeLayers]);

  // Fly the globe to whatever focusTarget was set (by search, or by clicking a marker)
  useEffect(() => {
    if (!focusTarget || focusTarget.lat == null || focusTarget.lng == null) return;
    const group = globeGroupRef.current;
    if (!group) return;

    // Direction of the target point on an un-rotated sphere
    const dir = latLngToVector(focusTarget.lat, focusTarget.lng, 1).normalize();
    // We want that point to end up facing the camera, i.e. pointing toward +Z
    const forward = new THREE.Vector3(0, 0, 1);
    const targetQuat = new THREE.Quaternion().setFromUnitVectors(dir, forward);
    targetQuatRef.current = targetQuat;
    setAutoRotate(false);

    if (highlightRef.current) {
      highlightRef.current.position.copy(latLngToVector(focusTarget.lat, focusTarget.lng, 71.2));
      highlightRef.current.lookAt(0, 0, 0);
      highlightRef.current.visible = true;
    }

    setSelected({
      label: focusTarget.label,
      kind: focusTarget.kind,
      meta: focusTarget.meta,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusRequestId]);

  const closeSelection = () => {
    setSelected(null);
    if (highlightRef.current) highlightRef.current.visible = false;
  };

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
            onClick={() => toggleGlobeLayer('countries')}
            className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all ${
              globeLayers.countries !== false
                ? 'bg-[var(--signal)]/20 text-[var(--signal)] border border-[var(--signal)]/40 font-bold'
                : 'text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            Countries
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

      {/* Selected Location Detail Card */}
      {selected && (
        <div className="absolute top-16 right-4 z-20 w-64 bg-[var(--panel)]/95 backdrop-blur-md border border-[var(--border)] rounded-lg shadow-xl p-3">
          <div className="flex items-start justify-between mb-1.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <MapPin className="w-3.5 h-3.5 text-[var(--signal)] shrink-0" />
              <span className="text-sm font-bold text-[var(--text)] truncate">{selected.label}</span>
            </div>
            <button onClick={closeSelection} className="text-[var(--muted)] hover:text-[var(--text)] shrink-0">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          {selected.kind === 'country' ? (
            <div className="space-y-1 text-[11px] font-mono text-[var(--muted)]">
              <div className="flex justify-between">
                <span>Risk Score</span>
                <Badge variant={selected.meta.status}>{selected.meta.riskScore}</Badge>
              </div>
              <div className="flex justify-between"><span>Production</span><span className="text-[var(--text)]">{selected.meta.production}</span></div>
              <div className="flex justify-between"><span>Reserves Cover</span><span className="text-[var(--text)]">{selected.meta.reserves}</span></div>
            </div>
          ) : (
            <div className="space-y-1 text-[11px] font-mono text-[var(--muted)]">
              <div className="flex justify-between">
                <span>Status</span>
                <Badge variant={selected.meta.riskLevel}>{selected.meta.status}</Badge>
              </div>
              <div className="flex justify-between"><span>Throughput</span><span className="text-[var(--text)]">{selected.meta.throughput}</span></div>
              <div className="flex justify-between"><span>Risk Score</span><span className="text-[var(--text)]">{selected.meta.riskScore}</span></div>
              {selected.meta.description && (
                <p className="pt-1 text-[10px] leading-snug text-[var(--muted)] normal-case">{selected.meta.description}</p>
              )}
            </div>
          )}
        </div>
      )}

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
