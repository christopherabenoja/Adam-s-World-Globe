import * as THREE from 'three';
import type { GeoAreaGeometry, LonLat, MultiLineStringGeometry } from '../types/globe';
import { lonLatToVec3 } from '../utils/geo';

function pushSphericalSegment(
  out: number[],
  a: LonLat,
  b: LonLat,
  radius: number,
  maxStepDeg = 4,
) {
  let dLon = b[0] - a[0];
  // Avoid wrapping across antimeridian
  if (Math.abs(dLon) > 180) return;

  const dLat = b[1] - a[1];
  const distDeg = Math.hypot(dLon, dLat);
  const steps = Math.max(1, Math.ceil(distDeg / maxStepDeg));
  const v = new THREE.Vector3();

  let prevLon = a[0];
  let prevLat = a[1];
  for (let s = 1; s <= steps; s++) {
    const t = s / steps;
    const nextLon = a[0] + dLon * t;
    const nextLat = a[1] + dLat * t;

    lonLatToVec3(prevLon, prevLat, radius, v);
    out.push(v.x, v.y, v.z);
    lonLatToVec3(nextLon, nextLat, radius, v);
    out.push(v.x, v.y, v.z);

    prevLon = nextLon;
    prevLat = nextLat;
  }
}

export function buildBordersGeometry(
  borders: MultiLineStringGeometry,
  radius = 1.0022,
): THREE.BufferGeometry {
  const positions: number[] = [];
  for (const line of borders.coordinates) {
    for (let i = 1; i < line.length; i++) {
      pushSphericalSegment(positions, line[i - 1], line[i], radius, 4);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  return geometry;
}

export function buildAreaOutlineGeometry(
  area: GeoAreaGeometry,
  radius = 1.004,
): THREE.BufferGeometry {
  const positions: number[] = [];
  const polygons = area.type === 'Polygon' ? [area.coordinates] : area.coordinates;
  for (const poly of polygons) {
    for (const ring of poly) {
      for (let i = 1; i < ring.length; i++) {
        pushSphericalSegment(positions, ring[i - 1], ring[i], radius, 3);
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  return geometry;
}

export function buildGraticuleGeometry(radius = 1.0012): THREE.BufferGeometry {
  const positions: number[] = [];
  const v = new THREE.Vector3();

  // Parallels every 30 deg
  for (let lat = -60; lat <= 60; lat += 30) {
    for (let lon = -180; lon < 180; lon += 4) {
      lonLatToVec3(lon, lat, radius, v);
      positions.push(v.x, v.y, v.z);
      lonLatToVec3(lon + 4, lat, radius, v);
      positions.push(v.x, v.y, v.z);
    }
  }

  // Meridians every 30 deg
  for (let lon = -180; lon < 180; lon += 30) {
    for (let lat = -84; lat < 84; lat += 4) {
      lonLatToVec3(lon, lat, radius, v);
      positions.push(v.x, v.y, v.z);
      lonLatToVec3(lon, lat + 4, radius, v);
      positions.push(v.x, v.y, v.z);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  return geometry;
}

export function buildStarfield(count = 1400): {
  geometry: THREE.BufferGeometry;
  material: THREE.PointsMaterial;
} {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  // Deterministic pseudo-random stars
  let seed = 42197;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967295;
  };

  for (let i = 0; i < count; i++) {
    const u = rand();
    const v = rand();
    const theta = u * 2 * Math.PI;
    const phi = Math.acos(2 * v - 1);
    const radius = 32 + rand() * 30;

    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.cos(phi);
    positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

    const tint = rand();
    const brightness = 0.45 + rand() * 0.55;
    if (tint < 0.15) {
      // Warm star
      colors[i * 3] = brightness;
      colors[i * 3 + 1] = brightness * 0.88;
      colors[i * 3 + 2] = brightness * 0.72;
    } else if (tint < 0.35) {
      // Blue-white star
      colors[i * 3] = brightness * 0.8;
      colors[i * 3 + 1] = brightness * 0.9;
      colors[i * 3 + 2] = brightness;
    } else {
      colors[i * 3] = brightness;
      colors[i * 3 + 1] = brightness;
      colors[i * 3 + 2] = brightness;
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.16,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    sizeAttenuation: true,
    depthWrite: false,
  });

  return { geometry, material };
}

export function createAtmosphereMaterial(sunDir: THREE.Vector3): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uSunDir: { value: sunDir.clone().normalize() },
    },
    vertexShader: `
      varying vec3 vNormalWorld;
      varying vec3 vPosWorld;
      void main() {
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vPosWorld = worldPos.xyz;
        vNormalWorld = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,
    fragmentShader: `
      uniform vec3 uSunDir;
      varying vec3 vNormalWorld;
      varying vec3 vPosWorld;
      void main() {
        vec3 viewDir = normalize(cameraPosition - vPosWorld);
        float d = clamp(dot(-viewDir, vNormalWorld), 0.0, 1.0);
        float outerFade = smoothstep(0.0, 0.38, d);
        float rimGlow = pow(1.0 - d, 3.8) * outerFade * 3.2;
        float sunTerm = smoothstep(-0.35, 0.75, dot(vNormalWorld, uSunDir));
        vec3 dayColor = vec3(0.32, 0.74, 1.0);
        vec3 twilightColor = vec3(0.07, 0.22, 0.58);
        vec3 col = mix(twilightColor, dayColor, sunTerm);
        gl_FragColor = vec4(col, clamp(rimGlow, 0.0, 0.9) * (0.38 + 0.62 * sunTerm));
      }
    `,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
  });
}
