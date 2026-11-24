import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  CONTINENT_BY_ID,
  CONTINENTS,
  COUNTRIES,
  COUNTRY_BORDERS,
  OCEANS,
} from '../data/worldData';
import type {
  ContinentConfig,
  CountryFeature,
  LonLat,
  MapMode,
} from '../types/globe';
import {
  geoContains,
  geoDistance,
  geoInterpolate,
  lonLatToVec3,
  vec3ToLonLat,
} from '../utils/geo';
import { generateEarthTextures } from './earthTextures';
import {
  buildAreaOutlineGeometry,
  buildBordersGeometry,
  buildGraticuleGeometry,
  buildStarfield,
  createAtmosphereMaterial,
} from './globeMeshes';

export interface GlobeHandle {
  flyTo: (target: LonLat, zoom?: number, durationMs?: number) => void;
  zoomBy: (factor: number) => void;
  resetView: () => void;
}

interface GlobeCanvasProps {
  mapMode: MapMode;
  showClouds: boolean;
  isPlayingGame: boolean;
  selectedContinent: ContinentConfig | null;
  selectedCountry: CountryFeature | null;
  hintContinent: ContinentConfig | null;
  onSelectContinent: (continent: ContinentConfig) => void;
  onSelectCountry: (country: CountryFeature) => void;
  onGameGuess: (continent: ContinentConfig) => void;
  onZoomChange?: (zoom: number) => void;
}

interface FlyAnim {
  startMs: number;
  durMs: number;
  interp: (t: number) => LonLat;
  z0: number;
  z1: number;
}

const MIN_ZOOM = 0.78;
const MAX_ZOOM = 12;

export const GlobeCanvas = forwardRef<GlobeHandle, GlobeCanvasProps>(function GlobeCanvas(
  {
    mapMode,
    showClouds,
    isPlayingGame,
    selectedContinent,
    selectedCountry,
    hintContinent,
    onSelectContinent,
    onSelectCountry,
    onGameGuess,
    onZoomChange,
  },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const webglCanvasRef = useRef<HTMLCanvasElement>(null);
  const labelCanvasRef = useRef<HTMLCanvasElement>(null);
  const [webglFailed, setWebglFailed] = useState(false);

  // Keep latest props in refs so the RAF loop never restarts on UI state changes
  const propsRef = useRef({
    mapMode,
    showClouds,
    isPlayingGame,
    selectedContinent,
    selectedCountry,
    hintContinent,
    onSelectContinent,
    onSelectCountry,
    onGameGuess,
    onZoomChange,
  });
  propsRef.current = {
    mapMode,
    showClouds,
    isPlayingGame,
    selectedContinent,
    selectedCountry,
    hintContinent,
    onSelectContinent,
    onSelectCountry,
    onGameGuess,
    onZoomChange,
  };

  // Mutable camera & animation state shared with imperative handle
  const stateRef = useRef({
    lon: 28,
    lat: 16,
    targetLon: 28,
    targetLat: 16,
    zoom: 1,
    targetZoom: 1,
    lastInteractMs: 0,
    flyAnim: null as FlyAnim | null,
    isDragging: false,
  });

  // Outline rebuild triggers
  const outlineUpdaterRef = useRef<() => void>(() => {});

  useImperativeHandle(ref, () => ({
    flyTo: (target: LonLat, zoom?: number, durationMs?: number) => {
      const st = stateRef.current;
      const from: LonLat = [st.lon, st.lat];
      const dist = geoDistance(from, target);
      const dur = durationMs ?? 600 + dist * 480;
      st.flyAnim = {
        startMs: performance.now(),
        durMs: dur,
        interp: geoInterpolate(from, target),
        z0: st.zoom,
        z1: zoom ?? st.zoom,
      };
      st.lastInteractMs = performance.now();
    },
    zoomBy: (factor: number) => {
      const st = stateRef.current;
      st.flyAnim = null;
      st.targetZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, st.targetZoom * factor));
      st.lastInteractMs = performance.now();
    },
    resetView: () => {
      const st = stateRef.current;
      const from: LonLat = [st.lon, st.lat];
      st.flyAnim = {
        startMs: performance.now(),
        durMs: 560,
        interp: geoInterpolate(from, [st.lon, 15]),
        z0: st.zoom,
        z1: 1,
      };
      st.lastInteractMs = performance.now();
    },
  }));

  // Trigger 3D outline updates when selection/hint changes
  useEffect(() => {
    outlineUpdaterRef.current();
  }, [selectedContinent, selectedCountry, hintContinent]);

  useEffect(() => {
    if (webglFailed) return;
    const container = containerRef.current;
    const glCanvas = webglCanvasRef.current;
    const labelCanvas = labelCanvasRef.current;
    if (!container || !glCanvas || !labelCanvas) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas: glCanvas,
        antialias: true,
        powerPreference: 'high-performance',
        alpha: false,
      });
    } catch {
      setWebglFailed(true);
      return;
    }

    const glCtx = renderer.getContext();
    if (!glCtx) {
      renderer.dispose();
      setWebglFailed(true);
      return;
    }

    // Detect software GL (e.g. SwiftShader) vs hardware tablet GPUs
    let rendererStr = '';
    try {
      const dbg = glCtx.getExtension('WEBGL_debug_renderer_info');
      rendererStr = dbg ? String(glCtx.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || '') : '';
    } catch {
      rendererStr = '';
    }
    const isSoftwareGl = /swiftshader|llvmpipe|software|angle.*swiftshader|mesa/i.test(rendererStr);
    const maxTex = renderer.capabilities.maxTextureSize || 2048;
    const isLowSpec = isSoftwareGl || maxTex < 4096;

    const getPixelRatio = () =>
      isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2);

    renderer.setPixelRatio(getPixelRatio());
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#040916');

    const camera = new THREE.PerspectiveCamera(38, 1, 0.04, 120);

    // Subtle PMREM environment for realistic ocean reflections without external HDR
    const pmrem = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envRT = pmrem.fromScene(roomEnv, 0.04);
    scene.environment = envRT.texture;
    scene.environmentIntensity = 0.22;
    roomEnv.dispose();
    pmrem.dispose();

    // Lighting rig: Sun key light + cool fill hemisphere
    const hemiLight = new THREE.HemisphereLight('#a8d0ff', '#102040', 0.55);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight('#fff6e5', 2.45);
    scene.add(sunLight);

    // Procedural offline Earth textures
    const textures = generateEarthTextures(isLowSpec);

    const earthGroup = new THREE.Group();
    scene.add(earthGroup);

    // Earth Sphere
    const sphereSegs = isLowSpec ? 56 : 80;
    const earthGeo = new THREE.SphereGeometry(1, sphereSegs, Math.floor(sphereSegs * 0.75));
    const earthMat = new THREE.MeshStandardMaterial({
      map: textures.satelliteMap,
      bumpMap: textures.bumpMap,
      bumpScale: 0.022,
      roughnessMap: textures.roughnessMap,
      roughness: 0.9,
      metalness: 0.04,
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthGroup.add(earthMesh);

    // Swirling Cloud Layer
    const cloudGeo = new THREE.SphereGeometry(1.0075, sphereSegs, Math.floor(sphereSegs * 0.75));
    const cloudMat = new THREE.MeshStandardMaterial({
      map: textures.cloudsMap,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      roughness: 0.95,
      metalness: 0,
    });
    const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
    earthGroup.add(cloudMesh);

    // Atmospheric Rayleigh Horizon Halo
    const atmoGeo = new THREE.SphereGeometry(1.068, 56, 40);
    const sunDirWorld = new THREE.Vector3(1, 0.5, 1).normalize();
    const atmoMat = createAtmosphereMaterial(sunDirWorld);
    const atmoMesh = new THREE.Mesh(atmoGeo, atmoMat);
    scene.add(atmoMesh);

    // 3D Starfield
    const stars = buildStarfield(isLowSpec ? 700 : 1400);
    const starPoints = new THREE.Points(stars.geometry, stars.material);
    scene.add(starPoints);

    // Graticule Grid
    const graticuleGeo = buildGraticuleGeometry(1.0012);
    const graticuleMat = new THREE.LineBasicMaterial({
      color: '#9fd0ff',
      transparent: true,
      opacity: 0.08,
    });
    const graticuleLines = new THREE.LineSegments(graticuleGeo, graticuleMat);
    earthGroup.add(graticuleLines);

    // Country Borders
    const bordersGeo = buildBordersGeometry(COUNTRY_BORDERS, 1.0022);
    const bordersMat = new THREE.LineBasicMaterial({
      color: '#e2f1ff',
      transparent: true,
      opacity: 0.35,
    });
    const borderLines = new THREE.LineSegments(bordersGeo, bordersMat);
    earthGroup.add(borderLines);

    // Dynamic Selection Outlines (Continent, Hint, Country)
    const contOutlineMat = new THREE.LineBasicMaterial({
      color: '#ffffff',
      transparent: true,
      opacity: 0.95,
    });
    let contOutlineMesh: THREE.LineSegments | null = null;

    const hintOutlineMat = new THREE.LineBasicMaterial({
      color: '#ffffff',
      transparent: true,
      opacity: 0.9,
    });
    let hintOutlineMesh: THREE.LineSegments | null = null;

    const countryOutlineMat = new THREE.LineBasicMaterial({
      color: '#FFE66D',
      transparent: true,
      opacity: 1,
    });
    let countryOutlineMesh: THREE.LineSegments | null = null;

    const rebuildOutlines = () => {
      const { selectedContinent: selC, selectedCountry: selCountry, hintContinent: hintC } =
        propsRef.current;

      if (contOutlineMesh) {
        earthGroup.remove(contOutlineMesh);
        contOutlineMesh.geometry.dispose();
        contOutlineMesh = null;
      }
      if (selC) {
        contOutlineMat.color.set(selC.color);
        contOutlineMesh = new THREE.LineSegments(
          buildAreaOutlineGeometry(selC.geometry, 1.0036),
          contOutlineMat,
        );
        earthGroup.add(contOutlineMesh);
      }

      if (hintOutlineMesh) {
        earthGroup.remove(hintOutlineMesh);
        hintOutlineMesh.geometry.dispose();
        hintOutlineMesh = null;
      }
      if (hintC) {
        hintOutlineMat.color.set(hintC.color);
        hintOutlineMesh = new THREE.LineSegments(
          buildAreaOutlineGeometry(hintC.geometry, 1.004),
          hintOutlineMat,
        );
        earthGroup.add(hintOutlineMesh);
      }

      if (countryOutlineMesh) {
        earthGroup.remove(countryOutlineMesh);
        countryOutlineMesh.geometry.dispose();
        countryOutlineMesh = null;
      }
      if (selCountry) {
        countryOutlineMesh = new THREE.LineSegments(
          buildAreaOutlineGeometry(selCountry.geometry, 1.0046),
          countryOutlineMat,
        );
        earthGroup.add(countryOutlineMesh);
      }
    };

    outlineUpdaterRef.current = rebuildOutlines;
    rebuildOutlines();

    // Viewport sizing
    let width = 1;
    let height = 1;
    let baseDistance = 3.45;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      const dpr = getPixelRatio();

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(dpr);
      renderer.setSize(width, height, false);

      labelCanvas.width = Math.floor(width * dpr);
      labelCanvas.height = Math.floor(height * dpr);

      const aspectScale = Math.min(1, width / height);
      baseDistance = 3.42 / Math.max(0.58, aspectScale);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    // Context loss safety
    let contextLost = false;
    const onContextLost = (e: Event) => {
      e.preventDefault();
      contextLost = true;
    };
    const onContextRestored = () => {
      contextLost = false;
    };
    glCanvas.addEventListener('webglcontextlost', onContextLost);
    glCanvas.addEventListener('webglcontextrestored', onContextRestored);

    // --- Pointer / Touch / Wheel Interaction ---
    const activePointers = new Map<number, [number, number]>();
    let dragOrigin: { x: number; y: number; lon: number; lat: number } | null = null;
    let maxPointerMove = 0;
    let pinchStart: { dist: number; zoom: number } | null = null;
    const raycaster = new THREE.Raycaster();
    const pointerNdc = new THREE.Vector2();

    const handleTap = (clientX: number, clientY: number) => {
      const rect = glCanvas.getBoundingClientRect();
      pointerNdc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointerNdc.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointerNdc, camera);
      const hits = raycaster.intersectObject(earthMesh, false);
      if (hits.length === 0) return;

      const lonLat = vec3ToLonLat(hits[0].point);
      const {
        isPlayingGame: playing,
        selectedContinent: selCont,
        onSelectContinent: pickCont,
        onSelectCountry: pickCountry,
        onGameGuess: guessCont,
      } = propsRef.current;

      const st = stateRef.current;
      const tappedCountry = COUNTRIES.find((c) => geoContains(c.geometry, lonLat));
      let tappedContinent = CONTINENTS.find((c) => geoContains(c.geometry, lonLat));
      if (!tappedContinent && tappedCountry) {
        const firstCid = (tappedCountry.properties.c || '').split(' ')[0] as keyof typeof CONTINENT_BY_ID;
        tappedContinent = CONTINENT_BY_ID[firstCid];
      }

      if (playing) {
        if (tappedContinent) guessCont(tappedContinent);
        return;
      }

      if (
        tappedCountry &&
        (st.zoom >= 1.85 || (selCont && (tappedCountry.properties.c || '').includes(selCont.id)))
      ) {
        pickCountry(tappedCountry);
      } else if (tappedContinent) {
        pickCont(tappedContinent);
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      glCanvas.setPointerCapture(e.pointerId);
      activePointers.set(e.pointerId, [e.clientX, e.clientY]);
      const st = stateRef.current;
      st.lastInteractMs = performance.now();
      st.flyAnim = null;

      if (activePointers.size === 1) {
        st.isDragging = true;
        maxPointerMove = 0;
        dragOrigin = { x: e.clientX, y: e.clientY, lon: st.lon, lat: st.lat };
        st.targetLon = st.lon;
        st.targetLat = st.lat;
      } else if (activePointers.size === 2) {
        const pts = [...activePointers.values()];
        pinchStart = {
          dist: Math.hypot(pts[0][0] - pts[1][0], pts[0][1] - pts[1][1]),
          zoom: st.zoom,
        };
        maxPointerMove = 999;
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!activePointers.has(e.pointerId)) return;
      activePointers.set(e.pointerId, [e.clientX, e.clientY]);
      const st = stateRef.current;
      st.lastInteractMs = performance.now();

      if (activePointers.size === 2 && pinchStart) {
        const pts = [...activePointers.values()];
        const d = Math.hypot(pts[0][0] - pts[1][0], pts[0][1] - pts[1][1]);
        if (pinchStart.dist > 4) {
          st.targetZoom = Math.max(
            MIN_ZOOM,
            Math.min(MAX_ZOOM, (pinchStart.zoom * d) / pinchStart.dist),
          );
          st.zoom = st.targetZoom;
        }
      } else if (st.isDragging && dragOrigin) {
        const dx = e.clientX - dragOrigin.x;
        const dy = e.clientY - dragOrigin.y;
        maxPointerMove = Math.max(maxPointerMove, Math.hypot(dx, dy));

        const minDim = Math.min(width, height);
        const degPerPx = 105 / (minDim * st.zoom);
        st.targetLon = dragOrigin.lon - dx * degPerPx;
        st.targetLat = Math.max(-85, Math.min(85, dragOrigin.lat + dy * degPerPx));
      }
    };

    const onPointerUpOrCancel = (e: PointerEvent) => {
      const wasTap = activePointers.size === 1 && maxPointerMove < 10 && e.type === 'pointerup';
      activePointers.delete(e.pointerId);
      if (activePointers.size < 2) pinchStart = null;

      const st = stateRef.current;
      if (activePointers.size === 0) {
        st.isDragging = false;
        dragOrigin = null;
        if (wasTap) {
          handleTap(e.clientX, e.clientY);
        }
      } else if (activePointers.size === 1) {
        const [pt] = [...activePointers.values()];
        dragOrigin = { x: pt[0], y: pt[1], lon: st.lon, lat: st.lat };
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const st = stateRef.current;
      st.lastInteractMs = performance.now();
      st.flyAnim = null;
      const factor = e.deltaY < 0 ? 1.12 : 0.89;
      st.targetZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, st.targetZoom * factor));
    };

    glCanvas.addEventListener('pointerdown', onPointerDown);
    glCanvas.addEventListener('pointermove', onPointerMove);
    glCanvas.addEventListener('pointerup', onPointerUpOrCancel);
    glCanvas.addEventListener('pointercancel', onPointerUpOrCancel);
    glCanvas.addEventListener('wheel', onWheel, { passive: false });

    // Pre-allocated math objects for zero-GC animation loop
    const camDir = new THREE.Vector3();
    const camRight = new THREE.Vector3();
    const camUp = new THREE.Vector3();
    const worldUp = new THREE.Vector3(0, 1, 0);
    const labelPos = new THREE.Vector3();
    const labelNormal = new THREE.Vector3();
    const boxCornerA = new THREE.Vector3();
    const boxCornerB = new THREE.Vector3();
    const labelCtx = labelCanvas.getContext('2d');

    let lastReportedZoom = 1;
    let lastFrameTime = performance.now();
    let rafId = 0;

    // Precompile shaders to prevent first-frame hitch on tablets
    try {
      renderer.compile(scene, camera);
    } catch {
      // Safe fallback
    }

    const drawLabelsOverlay = (zoom: number, selectedCont: ContinentConfig | null, selectedCtry: CountryFeature | null, playing: boolean, mode: MapMode) => {
      if (!labelCtx) return;
      const dpr = getPixelRatio();
      labelCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      labelCtx.clearRect(0, 0, width, height);

      // Camera unit direction from globe center
      camDir.copy(camera.position).normalize();
      const radiusOnScreen =
        (Math.min(width, height) * 0.43) * zoom;

      // 1. Ocean Labels
      labelCtx.textAlign = 'center';
      labelCtx.textBaseline = 'middle';
      const oceanFontPx = Math.max(11, Math.min(18, radiusOnScreen * 0.044));
      labelCtx.font = `italic 600 ${oceanFontPx}px "Trebuchet MS", system-ui, sans-serif`;
      labelCtx.fillStyle = mode === 'atlas' ? 'rgba(215, 240, 255, 0.72)' : 'rgba(175, 218, 255, 0.62)';

      for (const ocean of OCEANS) {
        lonLatToVec3(ocean.at[0], ocean.at[1], 1.004, labelPos);
        labelNormal.copy(labelPos).normalize();
        if (labelNormal.dot(camDir) < 0.25) continue;

        labelPos.project(camera);
        const sx = ((labelPos.x + 1) / 2) * width;
        const sy = ((-labelPos.y + 1) / 2) * height;
        labelCtx.fillText(ocean.name, sx, sy);
      }

      const showCountries =
        !playing && (selectedCont !== null || zoom >= (mode === 'hybrid' ? 1.45 : 1.85));

      // 2. Continent Labels
      const contFontPx = Math.max(13, Math.min(26, radiusOnScreen * 0.072));
      for (const cont of CONTINENTS) {
        if (playing && !selectedCont) continue;
        if (showCountries && (selectedCont === cont || zoom >= 2.2)) continue;

        lonLatToVec3(cont.at[0], cont.at[1], 1.006, labelPos);
        labelNormal.copy(labelPos).normalize();
        if (labelNormal.dot(camDir) < 0.22) continue;

        labelPos.project(camera);
        const sx = ((labelPos.x + 1) / 2) * width;
        const sy = ((-labelPos.y + 1) / 2) * height;
        const isSelected = selectedCont === cont;
        const fs = isSelected ? contFontPx * 1.22 : contFontPx;

        labelCtx.font = `800 ${fs}px "Trebuchet MS", system-ui, sans-serif`;
        labelCtx.lineWidth = isSelected ? 5.5 : 4;
        labelCtx.strokeStyle = 'rgba(5, 12, 28, 0.88)';
        labelCtx.fillStyle = isSelected ? cont.color : '#f8fafc';
        labelCtx.strokeText(cont.name, sx, sy);
        labelCtx.fillText(cont.name, sx, sy);
      }

      // 3. Country Labels & Capital Pins (with collision avoidance)
      if (showCountries) {
        const placed: [number, number, number, number][] = [];
        const baseFont = Math.max(11, Math.min(18, radiusOnScreen * 0.026));
        const ordered = selectedCtry
          ? [selectedCtry, ...COUNTRIES.filter((c) => c !== selectedCtry)]
          : COUNTRIES;

        for (const country of ordered) {
          const p = country.properties;
          if (!p.l) continue;
          if (
            mode !== 'hybrid' &&
            zoom < 2.2 &&
            selectedCont &&
            !(p.c || '').includes(selectedCont.id) &&
            country !== selectedCtry
          ) {
            continue;
          }

          lonLatToVec3(p.l[0], p.l[1], 1.006, labelPos);
          labelNormal.copy(labelPos).normalize();
          if (labelNormal.dot(camDir) < 0.24) continue;

          const isSel = country === selectedCtry;
          const fontSize = isSel ? baseFont * 1.38 : baseFont;
          labelCtx.font = `800 ${fontSize}px "Trebuchet MS", system-ui, sans-serif`;
          const textW = labelCtx.measureText(p.n).width;

          if (!isSel) {
            // Check approximate screen footprint of the country's bounding box
            lonLatToVec3(country.bbox[0][0], country.bbox[0][1], 1.0, boxCornerA);
            lonLatToVec3(country.bbox[1][0], country.bbox[1][1], 1.0, boxCornerB);
            boxCornerA.project(camera);
            boxCornerB.project(camera);
            const approxW = Math.abs(boxCornerB.x - boxCornerA.x) * (width * 0.5);
            if (approxW < textW * 0.52 && zoom < 4.5) continue;
          }

          labelPos.project(camera);
          const sx = ((labelPos.x + 1) / 2) * width;
          const sy = ((-labelPos.y + 1) / 2) * height;
          const box: [number, number, number, number] = [
            sx - textW / 2 - 6,
            sy - fontSize / 2 - 4,
            sx + textW / 2 + 6,
            sy + fontSize / 2 + (isSel && p.k ? 18 : 4),
          ];

          if (!isSel && placed.some((b) => box[0] < b[2] && box[2] > b[0] && box[1] < b[3] && box[3] > b[1])) {
            continue;
          }
          placed.push(box);

          // Capital / location pin dot in Hybrid or selected country
          if (isSel || (mode === 'hybrid' && zoom >= 2.3)) {
            labelCtx.beginPath();
            labelCtx.arc(sx, sy - fontSize * 0.72, isSel ? 4.2 : 2.6, 0, Math.PI * 2);
            labelCtx.fillStyle = isSel ? '#FFE66D' : '#38bdf8';
            labelCtx.fill();
            labelCtx.lineWidth = 1.5;
            labelCtx.strokeStyle = '#050b18';
            labelCtx.stroke();
          }

          labelCtx.lineWidth = isSel ? 5.5 : 3.8;
          labelCtx.strokeStyle = 'rgba(5, 12, 28, 0.9)';
          labelCtx.fillStyle = isSel ? '#FFE66D' : '#f1f5f9';
          labelCtx.strokeText(p.n, sx, sy);
          labelCtx.fillText(p.n, sx, sy);

          if ((isSel || (mode === 'hybrid' && zoom >= 3.2)) && p.k) {
            const capFont = Math.max(10, fontSize * 0.72);
            labelCtx.font = `600 ${capFont}px "Trebuchet MS", system-ui, sans-serif`;
            labelCtx.lineWidth = 3.2;
            labelCtx.strokeStyle = 'rgba(5, 12, 28, 0.9)';
            labelCtx.fillStyle = isSel ? '#ffffff' : 'rgba(203, 213, 225, 0.92)';
            labelCtx.strokeText(`★ ${p.k}`, sx, sy + fontSize * 0.85);
            labelCtx.fillText(`★ ${p.k}`, sx, sy + fontSize * 0.85);
          }
        }
      }
    };

    const animate = (now: number) => {
      rafId = requestAnimationFrame(animate);
      if (contextLost) return;

      const dt = Math.min(0.05, Math.max(0.001, (now - lastFrameTime) / 1000));
      lastFrameTime = now;

      const st = stateRef.current;
      const {
        mapMode: mode,
        showClouds: cloudsOn,
        isPlayingGame: playing,
        selectedContinent: selCont,
        selectedCountry: selCtry,
        hintContinent: hintC,
      } = propsRef.current;

      // 1. Update camera flight / damping / idle rotation
      if (st.flyAnim) {
        const rawT = Math.min(1, (now - st.flyAnim.startMs) / st.flyAnim.durMs);
        const eased = rawT < 0.5 ? 2 * rawT * rawT : 1 - Math.pow(-2 * rawT + 2, 2) / 2;
        const pos = st.flyAnim.interp(eased);
        st.lon = pos[0];
        st.lat = pos[1];
        st.targetLon = pos[0];
        st.targetLat = pos[1];
        st.zoom = st.flyAnim.z0 + (st.flyAnim.z1 - st.flyAnim.z0) * eased;
        st.targetZoom = st.zoom;
        if (rawT >= 1) st.flyAnim = null;
      } else {
        // Gentle idle earth rotation (West-to-East spin) when not inspecting a place
        if (!st.isDragging && !selCont && !selCtry && now - st.lastInteractMs > 3800) {
          st.targetLon -= dt * 4.2;
        }
        const damp = 1 - Math.exp(-dt * 12);
        st.lon += (st.targetLon - st.lon) * damp;
        st.lat += (st.targetLat - st.lat) * damp;
        st.zoom += (st.targetZoom - st.zoom) * damp;
      }

      if (Math.abs(st.zoom - lastReportedZoom) > 0.05) {
        lastReportedZoom = st.zoom;
        propsRef.current.onZoomChange?.(st.zoom);
      }

      // Position camera on sphere
      const dist = 1 + (baseDistance - 1) / st.zoom;
      lonLatToVec3(st.lon, st.lat, dist, camera.position);
      camera.lookAt(0, 0, 0);
      camera.updateMatrixWorld();

      // Sun anchored slightly upper-right-front of camera for crisp Google Earth relief & ocean glint
      camDir.copy(camera.position).normalize();
      camRight.crossVectors(worldUp, camDir).normalize();
      camUp.crossVectors(camDir, camRight).normalize();

      sunDirWorld
        .copy(camDir)
        .multiplyScalar(1.35)
        .addScaledVector(camRight, 0.95)
        .addScaledVector(camUp, 0.65)
        .normalize();
      sunLight.position.copy(sunDirWorld).multiplyScalar(10);
      atmoMat.uniforms.uSunDir.value.copy(sunDirWorld);

      // Update mode-dependent materials
      const targetMap = mode === 'atlas' ? textures.atlasMap : textures.satelliteMap;
      if (earthMat.map !== targetMap) {
        earthMat.map = targetMap;
        earthMat.needsUpdate = true;
      }

      // Slowly drift clouds when enabled
      cloudMesh.visible = cloudsOn && mode !== 'atlas' && st.zoom < 6.5;
      if (cloudMesh.visible) {
        cloudMesh.rotation.y += dt * 0.012;
        cloudMat.opacity = Math.max(0.08, 0.55 - (st.zoom - 1) * 0.08);
      }

      // Adaptive border & graticule visibility
      graticuleMat.opacity = mode === 'atlas' ? 0.16 : 0.08;
      if (mode === 'hybrid' || mode === 'atlas') {
        bordersMat.opacity = st.zoom > 2.5 ? 0.68 : 0.45;
      } else {
        bordersMat.opacity = selCont || st.zoom > 1.2 ? Math.min(0.6, 0.22 + (st.zoom - 1) * 0.1) : 0.14;
      }

      // Gentle highlight breathing on hint continent during Find It!
      if (hintC && hintOutlineMesh) {
        hintOutlineMat.opacity = 0.55 + 0.45 * Math.sin(now * 0.008);
      }

      renderer.render(scene, camera);
      drawLabelsOverlay(st.zoom, selCont, selCtry, playing, mode);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      glCanvas.removeEventListener('webglcontextlost', onContextLost);
      glCanvas.removeEventListener('webglcontextrestored', onContextRestored);
      glCanvas.removeEventListener('pointerdown', onPointerDown);
      glCanvas.removeEventListener('pointermove', onPointerMove);
      glCanvas.removeEventListener('pointerup', onPointerUpOrCancel);
      glCanvas.removeEventListener('pointercancel', onPointerUpOrCancel);
      glCanvas.removeEventListener('wheel', onWheel);

      earthGeo.dispose();
      earthMat.dispose();
      cloudGeo.dispose();
      cloudMat.dispose();
      atmoGeo.dispose();
      atmoMat.dispose();
      stars.geometry.dispose();
      stars.material.dispose();
      graticuleGeo.dispose();
      graticuleMat.dispose();
      bordersGeo.dispose();
      bordersMat.dispose();
      contOutlineMat.dispose();
      hintOutlineMat.dispose();
      countryOutlineMat.dispose();
      if (contOutlineMesh) contOutlineMesh.geometry.dispose();
      if (hintOutlineMesh) hintOutlineMesh.geometry.dispose();
      if (countryOutlineMesh) countryOutlineMesh.geometry.dispose();
      textures.dispose();
      envRT.dispose();
      renderer.dispose();
    };
  }, [webglFailed]);

  if (webglFailed) {
    return (
      <Fallback2DGlobe
        selectedContinent={selectedContinent}
        selectedCountry={selectedCountry}
        isPlayingGame={isPlayingGame}
        onSelectContinent={onSelectContinent}
        onSelectCountry={onSelectCountry}
        onGameGuess={onGameGuess}
      />
    );
  }

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden touch-none">
      <canvas ref={webglCanvasRef} className="block w-full h-full touch-none" />
      <canvas
        ref={labelCanvasRef}
        className="pointer-events-none absolute inset-0 w-full h-full"
      />
    </div>
  );
});

// Lightweight orthographic Canvas2D fallback if WebGL context is blocked by a viewer
function Fallback2DGlobe({
  selectedContinent,
  selectedCountry,
  isPlayingGame,
  onSelectContinent,
  onSelectCountry,
  onGameGuess,
}: {
  selectedContinent: ContinentConfig | null;
  selectedCountry: CountryFeature | null;
  isPlayingGame: boolean;
  onSelectContinent: (c: ContinentConfig) => void;
  onSelectCountry: (c: CountryFeature) => void;
  onGameGuess: (c: ContinentConfig) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const centerRef = useRef<LonLat>([20, 15]);
  const zoomRef = useRef(1);
  const dragRef = useRef<{ x: number; y: number; center: LonLat; moved: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, rect.width * dpr);
      canvas.height = Math.max(1, rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const w = rect.width;
      const h = rect.height;
      const cx = w / 2;
      const cy = h / 2;
      const r = Math.min(w, h) * 0.43 * zoomRef.current;

      ctx.clearRect(0, 0, w, h);
      const oceanGrad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.35, r * 0.1, cx, cy, r);
      oceanGrad.addColorStop(0, '#3898e8');
      oceanGrad.addColorStop(1, '#082c66');
      ctx.fillStyle = oceanGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      const [cLon, cLat] = centerRef.current;
      const lam0 = (cLon * Math.PI) / 180;
      const phi0 = (cLat * Math.PI) / 180;

      const project = (pt: LonLat): [number, number] | null => {
        const lam = (pt[0] * Math.PI) / 180;
        const phi = (pt[1] * Math.PI) / 180;
        const cosPhi = Math.cos(phi);
        const sinPhi = Math.sin(phi);
        const dLam = lam - lam0;
        const cosC = Math.sin(phi0) * sinPhi + Math.cos(phi0) * cosPhi * Math.cos(dLam);
        if (cosC < 0) return null;
        const x = cx + r * cosPhi * Math.sin(dLam);
        const y = cy - r * (Math.cos(phi0) * sinPhi - Math.sin(phi0) * cosPhi * Math.cos(dLam));
        return [x, y];
      };

      for (const cont of CONTINENTS) {
        ctx.fillStyle = cont.color;
        ctx.strokeStyle = selectedContinent === cont ? '#fff' : 'rgba(0,0,0,0.25)';
        ctx.lineWidth = selectedContinent === cont ? 2.5 : 1;
        ctx.beginPath();
        for (const poly of cont.geometry.coordinates) {
          for (const ring of poly) {
            let started = false;
            for (const pt of ring) {
              const p = project(pt);
              if (!p) {
                started = false;
                continue;
              }
              if (!started) {
                ctx.moveTo(p[0], p[1]);
                started = true;
              } else {
                ctx.lineTo(p[0], p[1]);
              }
            }
          }
        }
        ctx.fill();
        ctx.stroke();
      }
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [selectedContinent, selectedCountry]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full touch-none"
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        dragRef.current = {
          x: e.clientX,
          y: e.clientY,
          center: [...centerRef.current] as LonLat,
          moved: 0,
        };
      }}
      onPointerMove={(e) => {
        const d = dragRef.current;
        if (!d) return;
        const dx = e.clientX - d.x;
        const dy = e.clientY - d.y;
        d.moved = Math.max(d.moved, Math.hypot(dx, dy));
        const scale = 0.25 / zoomRef.current;
        centerRef.current = [
          d.center[0] - dx * scale,
          Math.max(-85, Math.min(85, d.center[1] + dy * scale)),
        ];
      }}
      onPointerUp={(e) => {
        const d = dragRef.current;
        dragRef.current = null;
        if (!d || d.moved >= 10) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = -(e.clientY - rect.top - rect.height / 2);
        const r = Math.min(rect.width, rect.height) * 0.43 * zoomRef.current;
        const rho = Math.hypot(x, y);
        if (rho > r || rho === 0) return;
        const c = Math.asin(rho / r);
        const lam0 = (centerRef.current[0] * Math.PI) / 180;
        const phi0 = (centerRef.current[1] * Math.PI) / 180;
        const lat = (Math.asin(Math.cos(c) * Math.sin(phi0) + (y * Math.sin(c) * Math.cos(phi0)) / rho) * 180) / Math.PI;
        const lon = ((lam0 + Math.atan2(x * Math.sin(c), rho * Math.cos(phi0) * Math.cos(c) - y * Math.sin(phi0) * Math.sin(c))) * 180) / Math.PI;
        const pt: LonLat = [lon, lat];
        const country = COUNTRIES.find((ct) => geoContains(ct.geometry, pt));
        const cont = CONTINENTS.find((ct) => geoContains(ct.geometry, pt));
        if (isPlayingGame && cont) onGameGuess(cont);
        else if (country && zoomRef.current >= 1.8) onSelectCountry(country);
        else if (cont) onSelectContinent(cont);
      }}
      onWheel={(e) => {
        zoomRef.current = Math.max(0.78, Math.min(12, zoomRef.current * (e.deltaY < 0 ? 1.12 : 0.89)));
      }}
    />
  );
}
