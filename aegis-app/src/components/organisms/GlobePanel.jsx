import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import ThreeGlobe from 'three-globe';
import { feature } from 'topojson-client';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { GlassPanel } from '../atoms/GlassPanel';
import { Badge } from '../atoms/Badge';
import { RefreshCw, Navigation, X, MapPin } from 'lucide-react';
import portsData from '../../data/ports.json';
import routesData from '../../data/routes.json';
import countriesData from '../../data/countries.json';
import worldCountries from '../../data/Worldcountries.json';
import earthDayTexture from '../../assets/earth-day.jpg';
import earthNightTexture from '../../assets/earth-night.jpg';
import earthBumpTexture from '../../assets/earth-bump.png';

// Full-resolution country boundaries, served statically (not bundled into the
// JS chunk — it's ~740KB, fetched once and cached by the browser) so every
// nation renders with its real shape, not just the ~6 we have curated
// intelligence data for.
const COUNTRY_TOPO_URL = '/geo/countries-50m.json';

// The curated intelligence dataset (countries.json) uses a couple of names
// that don't match Natural Earth's naming exactly — bridge those here.
const NAME_ALIASES = { 'united states': 'united states of america' };
function normalizeName(name) {
  const n = (name || '').toLowerCase().trim();
  return NAME_ALIASES[n] || n;
}

const curatedByName = new Map(countriesData.map((c) => [normalizeName(c.name), c]));
const centroidByName = new Map(worldCountries.map((c) => [normalizeName(c.name), c]));

function statusColor(status) {
  if (status === 'danger') return '#ff4757';
  if (status === 'warning') return '#ffb800';
  if (status === 'signal') return '#00d9c0';
  return '#64748b';
}

export function GlobePanel() {
  const containerRef = useRef(null);
  const { theme } = useTheme();
  const { globeLayers, toggleGlobeLayer, focusTarget, focusRequestId, setFocusTarget } = useApp();
  const [autoRotate, setAutoRotate] = useState(true);
  const [selected, setSelected] = useState(null); // { label, kind, meta }
  const [countryFeatures, setCountryFeatures] = useState(null);

  const globeGroupRef = useRef(null);
  const globeInstanceRef = useRef(null);
  const cameraRef = useRef(null);
  const targetQuatRef = useRef(null);
  const selectedNameRef = useRef(null);

  // Load real country boundary shapes once (shared across theme/layer re-renders)
  useEffect(() => {
    let cancelled = false;
    fetch(COUNTRY_TOPO_URL)
      .then((res) => res.json())
      .then((topo) => {
        if (cancelled) return;
        const geo = feature(topo, topo.objects.countries);
        setCountryFeatures(geo.features.filter((f) => f.properties?.name && f.properties.name !== 'Antarctica'));
      })
      .catch((err) => console.error('[GlobePanel] failed to load country boundaries:', err));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current || !countryFeatures) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
    camera.position.z = 300;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);
    globeGroupRef.current = globeGroup;

    const isDark = theme === 'dark';
    const atmosphereColor = isDark ? '#00d9c0' : '#0f766e';

    // Real, photorealistic globe (day/night texture + terrain bump + atmosphere),
    // replacing the old hand-rolled sphere. This is the same `three-globe`
    // package that was already listed in package.json but never actually used.
    const globeInstance = new ThreeGlobe()
      .globeImageUrl(isDark ? earthNightTexture : earthDayTexture)
      .bumpImageUrl(earthBumpTexture)
      .showAtmosphere(true)
      .atmosphereColor(atmosphereColor)
      .atmosphereAltitude(0.16)
      .showGraticules(true);

    // Real country boundary shapes (accurate geography, not a texture guess)
    if (globeLayers.countries !== false) {
      globeInstance
        .polygonsData(countryFeatures)
        .polygonCapColor((feat) => {
          const meta = curatedByName.get(normalizeName(feat.properties.name));
          return meta ? `${statusColor(meta.status)}cc` : 'rgba(148,163,184,0.35)';
        })
        .polygonSideColor(() => 'rgba(0,0,0,0.18)')
        .polygonStrokeColor(() => (isDark ? '#1f2e3d' : '#94a3b8'))
        .polygonAltitude((feat) => (feat.properties.name === selectedNameRef.current ? 0.02 : 0.006))
        .polygonsTransitionDuration(300);
    }

    // Strategic chokepoint/port markers
    if (globeLayers.strategicPorts) {
      globeInstance
        .pointsData(portsData)
        .pointLat('lat')
        .pointLng('lng')
        .pointColor((p) => statusColor(p.riskLevel === 'danger' ? 'danger' : p.riskLevel === 'warning' ? 'warning' : 'signal'))
        .pointAltitude(0.015)
        .pointRadius((p) => (p.riskLevel === 'danger' ? 0.6 : 0.4));
    }

    // Shipping / energy flow arcs
    if (globeLayers.shippingRoutes || globeLayers.energyFlow) {
      globeInstance
        .arcsData(routesData)
        .arcColor((r) => r.color || statusColor(r.status))
        .arcStroke((r) => r.stroke || 1.5)
        .arcDashLength(0.4)
        .arcDashGap(0.2)
        .arcDashAnimateTime(4000)
        .arcAltitudeAutoScale(0.4);
    }

    globeGroup.add(globeInstance);
    globeInstanceRef.current = globeInstance;

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, isDark ? 0.9 : 1.3));
    const dirLight = new THREE.DirectionalLight(0xffffff, isDark ? 1.2 : 1.0);
    dirLight.position.set(200, 150, 200);
    scene.add(dirLight);
    const rimLight = new THREE.DirectionalLight(0x00d9c0, isDark ? 0.6 : 0.3);
    rimLight.position.set(-200, -100, -150);
    scene.add(rimLight);

    // Interaction: drag-to-rotate + click-to-select (same proven approach as before,
    // now raycasting against the ThreeGlobe instance's own generated meshes)
    let isDragging = false;
    let dragDistance = 0;
    let previousMousePosition = { x: 0, y: 0 };
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const findData = (object) => {
      let obj = object;
      for (let i = 0; i < 8 && obj; i++) {
        if (obj.__data) return obj.__data;
        obj = obj.parent;
      }
      return null;
    };

    const handleMouseDown = (e) => {
      isDragging = true;
      dragDistance = 0;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const deltaMove = { x: e.clientX - previousMousePosition.x, y: e.clientY - previousMousePosition.y };
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
      const hits = raycaster.intersectObjects(globeInstance.children, true);
      for (const hit of hits) {
        const data = findData(hit.object);
        if (data) return data;
      }
      return null;
    };

    const handleMouseUp = (e) => {
      isDragging = false;
      if (dragDistance < 4 && e && e.target === renderer.domElement) {
        const data = pickAt(e.clientX, e.clientY);
        if (!data) return;
        setAutoRotate(false);

        if (data.type === 'Feature') {
          // A country polygon
          const name = data.properties.name;
          const curated = curatedByName.get(normalizeName(name));
          const centroid = centroidByName.get(normalizeName(name));
          if (!centroid) return;
          setFocusTarget({
            id: data.id || name,
            label: name,
            lat: centroid.lat,
            lng: centroid.lng,
            kind: 'country',
            meta: curated || { name, noProfile: true },
          });
        } else if (data.lat != null && data.lng != null) {
          // A port marker
          setFocusTarget({ id: data.id, label: data.name, lat: data.lat, lng: data.lng, kind: 'port', meta: data });
        }
      }
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('mousedown', handleMouseDown);
    domElem.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

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
        globeGroup.rotation.y += 0.0015;
      }

      renderer.render(scene, camera);
    };
    animate();

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
      domElem.removeEventListener('mousedown', handleMouseDown);
      domElem.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, globeLayers, countryFeatures]);

  // Fly to whatever focusTarget was set (search result or a click)
  useEffect(() => {
    if (!focusTarget || focusTarget.lat == null || focusTarget.lng == null) return;
    const group = globeGroupRef.current;
    const globeInstance = globeInstanceRef.current;
    if (!group || !globeInstance) return;

    const raw = globeInstance.getCoords(focusTarget.lat, focusTarget.lng, 0);
    const dir = new THREE.Vector3(raw.x, raw.y, raw.z).normalize();
    const forward = new THREE.Vector3(0, 0, 1);
    targetQuatRef.current = new THREE.Quaternion().setFromUnitVectors(dir, forward);
    setAutoRotate(false);

    // Pulse a ring at the exact focused coordinate
    globeInstance.ringsData([
      { lat: focusTarget.lat, lng: focusTarget.lng, color: '#ffffff', maxR: 6, propagationSpeed: 4, repeatPeriod: 1100 },
    ]);

    // Raise the selected country's polygon slightly so its shape stands out
    selectedNameRef.current = focusTarget.kind === 'country' ? focusTarget.label : null;
    globeInstance.polygonAltitude((feat) => (feat.properties.name === selectedNameRef.current ? 0.025 : 0.006));

    setSelected({ label: focusTarget.label, kind: focusTarget.kind, meta: focusTarget.meta });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusRequestId]);

  const closeSelection = () => {
    setSelected(null);
    selectedNameRef.current = null;
    if (globeInstanceRef.current) {
      globeInstanceRef.current.ringsData([]);
      globeInstanceRef.current.polygonAltitude(() => 0.006);
    }
  };

  return (
    <GlassPanel className="relative h-[560px] flex flex-col justify-between overflow-hidden p-0">
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center space-x-2 bg-[var(--panel)]/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[var(--border)] pointer-events-auto">
          <Navigation className="w-4 h-4 text-[var(--signal)] animate-spin-slow" />
          <span className="text-xs font-bold font-display tracking-wider uppercase text-[var(--text)]">
            Global Digital Twin
          </span>
          <span className="w-2 h-2 rounded-full bg-[var(--signal)] animate-ping" />
        </div>

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
            className={`p-1.5 rounded text-[11px] transition-all ${autoRotate ? 'text-[var(--signal)]' : 'text-[var(--muted)]'}`}
            title="Toggle Auto Rotate"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin-slow' : ''}`} />
          </button>
        </div>
      </div>

      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {!countryFeatures && (
        <div className="absolute inset-0 flex items-center justify-center text-xs font-mono text-[var(--muted)]">
          Loading world geography...
        </div>
      )}

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
            selected.meta?.noProfile ? (
              <p className="text-[11px] leading-snug text-[var(--muted)] normal-case">
                Geographic reference only — no curated intelligence profile is modeled for this country yet.
              </p>
            ) : (
              <div className="space-y-1 text-[11px] font-mono text-[var(--muted)]">
                <div className="flex justify-between">
                  <span>Risk Score</span>
                  <Badge variant={selected.meta.status}>{selected.meta.riskScore}</Badge>
                </div>
                <div className="flex justify-between"><span>Production</span><span className="text-[var(--text)]">{selected.meta.production}</span></div>
                <div className="flex justify-between"><span>Reserves Cover</span><span className="text-[var(--text)]">{selected.meta.reserves}</span></div>
              </div>
            )
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
