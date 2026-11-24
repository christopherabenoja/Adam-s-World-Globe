import * as THREE from 'three';
import { CONTINENTS } from '../data/worldData';
import type { LonLat } from '../types/globe';

export interface EarthTextureBundle {
  satelliteMap: THREE.CanvasTexture;
  atlasMap: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
  cloudsMap: THREE.CanvasTexture;
  dispose: () => void;
}

// Fast deterministic 3D hash for seamless spherical value noise
function hash3(ix: number, iy: number, iz: number): number {
  let n = ix * 374761393 + iy * 668265263 + iz * 1274126177;
  n = (n ^ (n >> 13)) * 1274126177;
  n = n ^ (n >> 16);
  return (n >>> 0) / 4294967295;
}

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function clamp(v: number, min: number, max: number): number {
  return v < min ? min : v > max ? max : v;
}

function noise3D(x: number, y: number, z: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const iz = Math.floor(z);
  const fx = smoothstep(x - ix);
  const fy = smoothstep(y - iy);
  const fz = smoothstep(z - iz);

  const n000 = hash3(ix, iy, iz);
  const n100 = hash3(ix + 1, iy, iz);
  const n010 = hash3(ix, iy + 1, iz);
  const n110 = hash3(ix + 1, iy + 1, iz);
  const n001 = hash3(ix, iy, iz + 1);
  const n101 = hash3(ix + 1, iy, iz + 1);
  const n011 = hash3(ix, iy + 1, iz + 1);
  const n111 = hash3(ix + 1, iy + 1, iz + 1);

  const nx00 = lerp(n000, n100, fx);
  const nx10 = lerp(n010, n110, fx);
  const nx01 = lerp(n001, n101, fx);
  const nx11 = lerp(n011, n111, fx);

  const nxy0 = lerp(nx00, nx10, fy);
  const nxy1 = lerp(nx01, nx11, fy);

  return lerp(nxy0, nxy1, fz);
}

function fbm3D(x: number, y: number, z: number, octaves = 4): number {
  let value = 0;
  let amp = 0.5;
  let freq = 1;
  let norm = 0;
  for (let i = 0; i < octaves; i++) {
    value += amp * noise3D(x * freq, y * freq, z * freq);
    norm += amp;
    amp *= 0.5;
    freq *= 2.05;
  }
  return value / norm;
}

function gaussian2D(lon: number, lat: number, cLon: number, cLat: number, rLon: number, rLat: number): number {
  let dl = lon - cLon;
  if (dl > 180) dl -= 360;
  if (dl < -180) dl += 360;
  const dx = dl / rLon;
  const dy = (lat - cLat) / rLat;
  const d2 = dx * dx + dy * dy;
  return d2 > 6 ? 0 : Math.exp(-d2);
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const n = parseInt(clean, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function traceRing(ctx: CanvasRenderingContext2D, ring: LonLat[], w: number, h: number) {
  if (ring.length === 0) return;
  for (let i = 0; i < ring.length; i++) {
    const x = ((ring[i][0] + 180) / 360) * w;
    const y = ((90 - ring[i][1]) / 180) * h;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

export function generateEarthTextures(isLowSpec: boolean): EarthTextureBundle {
  const width = isLowSpec ? 1024 : 1536;
  const height = isLowSpec ? 512 : 768;

  // 1. Rasterize continent IDs onto an offscreen canvas (R channel stores continent index 1..7)
  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = width;
  maskCanvas.height = height;
  const maskCtx = maskCanvas.getContext('2d')!;
  maskCtx.fillStyle = '#000000';
  maskCtx.fillRect(0, 0, width, height);

  const continentRgbs: [number, number, number][] = [[0, 0, 0]];
  CONTINENTS.forEach((cont, idx) => {
    continentRgbs.push(hexToRgb(cont.color));
    maskCtx.fillStyle = `rgb(${idx + 1}, 0, 0)`;
    maskCtx.beginPath();
    for (const polygon of cont.geometry.coordinates) {
      for (const ring of polygon) {
        traceRing(maskCtx, ring, width, height);
      }
    }
    maskCtx.fill('evenodd');
  });

  // 2. Create blurred coastal shelf field on a downscaled canvas for instant turquoise continental shelves
  const shelfW = Math.floor(width / 4);
  const shelfH = Math.floor(height / 4);
  const shelfCanvas = document.createElement('canvas');
  shelfCanvas.width = shelfW;
  shelfCanvas.height = shelfH;
  const shelfCtx = shelfCanvas.getContext('2d')!;
  shelfCtx.fillStyle = '#000';
  shelfCtx.fillRect(0, 0, shelfW, shelfH);
  shelfCtx.fillStyle = '#fff';
  shelfCtx.beginPath();
  for (const cont of CONTINENTS) {
    for (const polygon of cont.geometry.coordinates) {
      for (const ring of polygon) {
        traceRing(shelfCtx, ring, shelfW, shelfH);
      }
    }
  }
  shelfCtx.fill('evenodd');

  // Blurred pass for coastal shelf + deep ocean falloff
  const blurCanvas = document.createElement('canvas');
  blurCanvas.width = shelfW;
  blurCanvas.height = shelfH;
  const blurCtx = blurCanvas.getContext('2d')!;
  blurCtx.filter = isLowSpec ? 'blur(5px)' : 'blur(7px)';
  blurCtx.drawImage(shelfCanvas, 0, 0);
  blurCtx.filter = 'none';

  const maskData = maskCtx.getImageData(0, 0, width, height).data;
  const shelfData = blurCtx.getImageData(0, 0, shelfW, shelfH).data;

  // 3. Allocate output canvases
  const satCanvas = document.createElement('canvas');
  satCanvas.width = width;
  satCanvas.height = height;
  const satCtx = satCanvas.getContext('2d')!;
  const satImg = satCtx.createImageData(width, height);

  const atlasCanvas = document.createElement('canvas');
  atlasCanvas.width = width;
  atlasCanvas.height = height;
  const atlasCtx = atlasCanvas.getContext('2d')!;
  const atlasImg = atlasCtx.createImageData(width, height);

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = width;
  bumpCanvas.height = height;
  const bumpCtx = bumpCanvas.getContext('2d')!;
  const bumpImg = bumpCtx.createImageData(width, height);

  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = width;
  roughCanvas.height = height;
  const roughCtx = roughCanvas.getContext('2d')!;
  const roughImg = roughCtx.createImageData(width, height);

  const satD = satImg.data;
  const atlasD = atlasImg.data;
  const bumpD = bumpImg.data;
  const roughD = roughImg.data;

  const DEG2RAD = Math.PI / 180;

  for (let py = 0; py < height; py++) {
    const lat = 90 - ((py + 0.5) / height) * 180;
    const absLat = Math.abs(lat);
    const latRad = lat * DEG2RAD;
    const cosLat = Math.cos(latRad);
    const sinLat = Math.sin(latRad);
    const sy = Math.min(shelfH - 1, Math.floor((py / height) * shelfH));

    for (let px = 0; px < width; px++) {
      const idx = (py * width + px) * 4;
      const lon = ((px + 0.5) / width) * 360 - 180;
      const lonRad = lon * DEG2RAD;
      const sx = Math.min(shelfW - 1, Math.floor((px / width) * shelfW));
      const coastBlur = shelfData[(sy * shelfW + sx) * 4] / 255;

      const contId = maskData[idx]; // 0 = ocean, 1..7 = continent

      // 3D unit sphere coordinates for completely seamless noise
      const nx = cosLat * Math.cos(lonRad);
      const ny = sinLat;
      const nz = -cosLat * Math.sin(lonRad);

      const nLarge = fbm3D(nx * 4.5 + 3.1, ny * 4.5 - 1.7, nz * 4.5 + 2.4, 4);
      const nDetail = fbm3D(nx * 16.0 - 5.2, ny * 16.0 + 2.8, nz * 16.0 - 0.9, 3);

      if (contId === 0) {
        // --- OCEAN BATHYMETRY ---
        const ridge = fbm3D(nx * 7.0 + 11.2, ny * 7.0 + 4.1, nz * 7.0 - 6.3, 3);
        const shelf = Math.pow(coastBlur, 0.72);
        const polarSea = clamp((absLat - 75) / 14 + (nLarge - 0.5) * 0.25, 0, 1);

        // Deep abyssal navy -> mid cerulean -> vibrant turquoise coastal shelf
        let r = lerp(7, 17, ridge) + shelf * 28;
        let g = lerp(26, 62, ridge) + shelf * 102;
        let b = lerp(66, 118, ridge) + shelf * 92;

        // Subtle polar sea ice / pack ice tint near high Arctic/Antarctic waters
        if (polarSea > 0.35) {
          const iceMix = clamp((polarSea - 0.35) * 1.4, 0, 0.85);
          r = lerp(r, 208, iceMix);
          g = lerp(g, 228, iceMix);
          b = lerp(b, 244, iceMix);
        }

        satD[idx] = clamp(r, 0, 255);
        satD[idx + 1] = clamp(g, 0, 255);
        satD[idx + 2] = clamp(b, 0, 255);
        satD[idx + 3] = 255;

        // Atlas Ocean (slightly brighter Google Maps marine blue)
        atlasD[idx] = clamp(lerp(18, 42, ridge) + shelf * 38, 0, 255);
        atlasD[idx + 1] = clamp(lerp(66, 112, ridge) + shelf * 90, 0, 255);
        atlasD[idx + 2] = clamp(lerp(138, 186, ridge) + shelf * 62, 0, 255);
        atlasD[idx + 3] = 255;

        // Ocean floor subtle bump & smooth specular roughness
        const seaBump = Math.floor(24 + ridge * 18 + shelf * 16);
        bumpD[idx] = bumpD[idx + 1] = bumpD[idx + 2] = seaBump;
        bumpD[idx + 3] = 255;

        const seaRough = Math.floor(lerp(64, 150, polarSea > 0.45 ? 0.7 : 0));
        roughD[idx] = roughD[idx + 1] = roughD[idx + 2] = seaRough;
        roughD[idx + 3] = 255;
      } else {
        // --- LAND BIOMES & TOPOGRAPHY ---
        const interior = clamp((coastBlur - 0.35) / 0.65, 0, 1);

        // Major mountain chains (Himalayas/Tibet, Andes, Rockies, Alps/Caucasus, East African Highlands)
        const himalayas = gaussian2D(lon, lat, 86, 32, 22, 8);
        const andes = gaussian2D(lon, lat, -68, -18, 5.5, 28);
        const rockies = gaussian2D(lon, lat, -112, 46, 9, 18);
        const alps = gaussian2D(lon, lat, 12, 46.5, 9, 3.5);
        const ethiopia = gaussian2D(lon, lat, 39, 9, 6, 7);
        const mountainMask = clamp(himalayas * 1.15 + andes * 0.95 + rockies * 0.8 + alps * 0.85 + ethiopia * 0.7, 0, 1);

        const elevation = clamp(
          interior * 0.25 + nLarge * 0.35 + nDetail * 0.25 + mountainMask * 0.65 - 0.12,
          0,
          1,
        );

        // Major desert & arid regions
        const sahara = gaussian2D(lon, lat, 13, 23, 28, 10);
        const arabia = gaussian2D(lon, lat, 46, 22, 13, 9);
        const gobi = gaussian2D(lon, lat, 92, 42, 20, 7);
        const outback = gaussian2D(lon, lat, 132, -24, 15, 8);
        const swUsa = gaussian2D(lon, lat, -112, 32, 9, 7);
        const namib = gaussian2D(lon, lat, 16, -23, 5, 7);
        const aridity = clamp(
          (sahara + arabia + gobi * 0.85 + outback + swUsa * 0.8 + namib * 0.8) * (0.75 + nLarge * 0.45),
          0,
          1,
        );

        // Lush tropical rainforest zones
        const amazon = gaussian2D(lon, lat, -61, -4, 15, 11);
        const congo = gaussian2D(lon, lat, 21, 0, 11, 8);
        const seAsia = gaussian2D(lon, lat, 112, 1, 22, 11);
        const tropicalBelt = clamp((1 - absLat / 24) * 0.5 + amazon + congo + seAsia, 0, 1);

        // Snow & Ice (Antarctica, Greenland, high Arctic, extreme elevation)
        const greenland = gaussian2D(lon, lat, -42, 73, 16, 10);
        const polarSnow = clamp((absLat - 64) / 14 + greenland * 1.2 + (nLarge - 0.5) * 0.22, 0, 1);
        const alpineSnow = clamp((elevation - 0.73) * 3.8 + mountainMask * 0.35 - 0.15, 0, 1);
        const snowFactor = contId === 7 ? 1 : clamp(Math.max(polarSnow, alpineSnow), 0, 1);

        // Base vegetated terrain by latitude + moisture
        const latNorm = clamp(absLat / 66, 0, 1);
        // Tropical deep green -> temperate olive green -> boreal pine
        let r = lerp(28, 52, latNorm) + (nDetail - 0.5) * 28;
        let g = lerp(96, 82, latNorm) + (nDetail - 0.5) * 30;
        let b = lerp(40, 46, latNorm) + (nDetail - 0.5) * 18;

        // Rainforest boost
        if (tropicalBelt > 0.2) {
          const tf = clamp((tropicalBelt - 0.2) * 1.1, 0, 1);
          r = lerp(r, 24 + nDetail * 14, tf);
          g = lerp(g, 82 + nDetail * 24, tf);
          b = lerp(b, 32 + nDetail * 12, tf);
        }

        // Savanna / steppe grass variation
        const savanna = clamp((nLarge - 0.42) * 2.2 * (1 - tropicalBelt * 0.4), 0, 1);
        r = lerp(r, 114 + nDetail * 26, savanna * 0.55);
        g = lerp(g, 118 + nDetail * 22, savanna * 0.55);
        b = lerp(b, 62 + nDetail * 16, savanna * 0.55);

        // Desert blend
        if (aridity > 0.12) {
          const df = clamp((aridity - 0.12) * 1.35, 0, 1);
          const sandR = lerp(188, 224, nDetail);
          const sandG = lerp(144, 188, nDetail);
          const sandB = lerp(96, 134, nDetail);
          r = lerp(r, sandR, df);
          g = lerp(g, sandG, df);
          b = lerp(b, sandB, df);
        }

        // Rocky mountain slopes before snowcap
        if (elevation > 0.52) {
          const rockF = clamp((elevation - 0.52) * 2.4, 0, 0.85);
          r = lerp(r, 118 + nDetail * 35, rockF);
          g = lerp(g, 110 + nDetail * 32, rockF);
          b = lerp(b, 102 + nDetail * 30, rockF);
        }

        // Snow & Polar Ice cap
        if (snowFactor > 0.15) {
          const sf = clamp((snowFactor - 0.15) * 1.35, 0, 1);
          const iceR = lerp(224, 248, nDetail);
          const iceG = lerp(234, 252, nDetail);
          const iceB = lerp(244, 255, nDetail);
          r = lerp(r, iceR, sf);
          g = lerp(g, iceG, sf);
          b = lerp(b, iceB, sf);
        }

        satD[idx] = clamp(r, 0, 255);
        satD[idx + 1] = clamp(g, 0, 255);
        satD[idx + 2] = clamp(b, 0, 255);
        satD[idx + 3] = 255;

        // Explorer Atlas: Continent color blended with subtle relief shading for vivid clarity
        const [cr, cg, cb] = continentRgbs[contId] || [160, 190, 140];
        const hillShade = 0.84 + elevation * 0.28 + (nDetail - 0.5) * 0.14;
        atlasD[idx] = clamp(lerp(cr, r, 0.22) * hillShade, 0, 255);
        atlasD[idx + 1] = clamp(lerp(cg, g, 0.22) * hillShade, 0, 255);
        atlasD[idx + 2] = clamp(lerp(cb, b, 0.22) * hillShade, 0, 255);
        atlasD[idx + 3] = 255;

        // Land bump & matte roughness
        const landBump = Math.floor(clamp(75 + elevation * 180, 65, 255));
        bumpD[idx] = bumpD[idx + 1] = bumpD[idx + 2] = landBump;
        bumpD[idx + 3] = 255;

        const landRough = Math.floor(lerp(225, 195, snowFactor));
        roughD[idx] = roughD[idx + 1] = roughD[idx + 2] = landRough;
        roughD[idx + 3] = 255;
      }
    }
  }

  satCtx.putImageData(satImg, 0, 0);
  atlasCtx.putImageData(atlasImg, 0, 0);
  bumpCtx.putImageData(bumpImg, 0, 0);
  roughCtx.putImageData(roughImg, 0, 0);

  // 4. Procedural seamless swirling clouds texture (1024x512)
  const cw = isLowSpec ? 512 : 1024;
  const ch = isLowSpec ? 256 : 512;
  const cloudCanvas = document.createElement('canvas');
  cloudCanvas.width = cw;
  cloudCanvas.height = ch;
  const cloudCtx = cloudCanvas.getContext('2d')!;
  const cloudImg = cloudCtx.createImageData(cw, ch);
  const cD = cloudImg.data;

  for (let py = 0; py < ch; py++) {
    const lat = 90 - ((py + 0.5) / ch) * 180;
    const latRad = lat * DEG2RAD;
    const cosLat = Math.cos(latRad);
    const sinLat = Math.sin(latRad);

    for (let px = 0; px < cw; px++) {
      const idx = (py * cw + px) * 4;
      const lon = ((px + 0.5) / cw) * 360 - 180;
      const lonRad = lon * DEG2RAD;
      const nx = cosLat * Math.cos(lonRad);
      const ny = sinLat;
      const nz = -cosLat * Math.sin(lonRad);

      // Domain-warped FBM for atmospheric swirl streaks
      const warp = fbm3D(nx * 3.0 + 7.2, ny * 4.2, nz * 3.0 - 3.4, 3);
      const density = fbm3D(
        nx * 5.2 + warp * 1.4,
        ny * 6.8 + warp * 0.6,
        nz * 5.2 - warp * 1.2,
        4,
      );
      const alpha = clamp((density - 0.52) * 3.6, 0, 1);

      cD[idx] = 248;
      cD[idx + 1] = 251;
      cD[idx + 2] = 255;
      cD[idx + 3] = Math.floor(alpha * 185);
    }
  }
  cloudCtx.putImageData(cloudImg, 0, 0);

  const configureMap = (canvas: HTMLCanvasElement, isColor: boolean) => {
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.anisotropy = isLowSpec ? 1 : 4;
    if (isColor) tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
  };

  const satelliteMap = configureMap(satCanvas, true);
  const atlasMap = configureMap(atlasCanvas, true);
  const bumpMap = configureMap(bumpCanvas, false);
  const roughnessMap = configureMap(roughCanvas, false);
  const cloudsMap = configureMap(cloudCanvas, true);

  return {
    satelliteMap,
    atlasMap,
    bumpMap,
    roughnessMap,
    cloudsMap,
    dispose: () => {
      satelliteMap.dispose();
      atlasMap.dispose();
      bumpMap.dispose();
      roughnessMap.dispose();
      cloudsMap.dispose();
    },
  };
}
