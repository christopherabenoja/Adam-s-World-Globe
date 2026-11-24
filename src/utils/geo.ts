import * as THREE from 'three';
import type {
  CountryFeature,
  CountryRawProperties,
  GeoAreaGeometry,
  LonLat,
  MultiLineStringGeometry,
} from '../types/globe';

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;
const TAU = Math.PI * 2;
const HALF_PI = Math.PI / 2;
const QUARTER_PI = Math.PI / 4;
const EPS = 1e-6;
const EPS2 = 1e-12;

export function lonLatToVec3(lon: number, lat: number, radius = 1, target = new THREE.Vector3()): THREE.Vector3 {
  const lonRad = lon * DEG2RAD;
  const latRad = lat * DEG2RAD;
  const cosLat = Math.cos(latRad);
  target.set(
    radius * cosLat * Math.cos(lonRad),
    radius * Math.sin(latRad),
    -radius * cosLat * Math.sin(lonRad),
  );
  return target;
}

export function vec3ToLonLat(v: THREE.Vector3): LonLat {
  const r = Math.hypot(v.x, v.y, v.z) || 1;
  const lat = Math.asin(Math.max(-1, Math.min(1, v.y / r))) * RAD2DEG;
  const lon = Math.atan2(-v.z, v.x) * RAD2DEG;
  return [lon, lat];
}

export function geoDistance(a: LonLat, b: LonLat): number {
  const lam1 = a[0] * DEG2RAD;
  const phi1 = a[1] * DEG2RAD;
  const lam2 = b[0] * DEG2RAD;
  const phi2 = b[1] * DEG2RAD;
  const dLam = Math.abs(lam2 - lam1);
  const cosD = Math.cos(dLam);
  const sinD = Math.sin(dLam);
  const cos1 = Math.cos(phi1);
  const sin1 = Math.sin(phi1);
  const cos2 = Math.cos(phi2);
  const sin2 = Math.sin(phi2);
  const num = Math.hypot(cos2 * sinD, cos1 * sin2 - sin1 * cos2 * cosD);
  const den = sin1 * sin2 + cos1 * cos2 * cosD;
  return Math.atan2(num, den);
}

export function geoInterpolate(a: LonLat, b: LonLat): ((t: number) => LonLat) & { distance: number } {
  const x0 = a[0] * DEG2RAD;
  const y0 = a[1] * DEG2RAD;
  const x1 = b[0] * DEG2RAD;
  const y1 = b[1] * DEG2RAD;
  const cy0 = Math.cos(y0);
  const sy0 = Math.sin(y0);
  const cy1 = Math.cos(y1);
  const sy1 = Math.sin(y1);
  const kx0 = cy0 * Math.cos(x0);
  const ky0 = cy0 * Math.sin(x0);
  const kx1 = cy1 * Math.cos(x1);
  const ky1 = cy1 * Math.sin(x1);
  const h = (v: number) => {
    const s = Math.sin(v / 2);
    return s * s;
  };
  const d = 2 * Math.asin(Math.min(1, Math.sqrt(h(y1 - y0) + cy0 * cy1 * h(x1 - x0))));
  const k = Math.sin(d);

  const fn = (t: number): LonLat => {
    if (!d) return [x0 * RAD2DEG, y0 * RAD2DEG];
    const B = Math.sin((t *= d)) / k;
    const A = Math.sin(d - t) / k;
    const x = A * kx0 + B * kx1;
    const y = A * ky0 + B * ky1;
    const z = A * sy0 + B * sy1;
    return [Math.atan2(y, x) * RAD2DEG, Math.atan2(z, Math.hypot(x, y)) * RAD2DEG];
  };
  return Object.assign(fn, { distance: d });
}

// Accurate spherical point-in-polygon matching d3-geo (handles antimeridian & poles)
function normLonRad(lon: number): number {
  return Math.abs(lon) <= Math.PI ? lon : Math.sign(lon) * (((Math.abs(lon) + Math.PI) % TAU) - Math.PI);
}

function sphToCart(p: LonLat): [number, number, number] {
  const c = Math.cos(p[1]);
  return [c * Math.cos(p[0]), c * Math.sin(p[0]), Math.sin(p[1])];
}

function cross(a: [number, number, number], b: [number, number, number]): [number, number, number] {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

function normalizeVec(v: [number, number, number]): void {
  const m = Math.hypot(v[0], v[1], v[2]) || 1;
  v[0] /= m;
  v[1] /= m;
  v[2] /= m;
}

function ringContains(polygonRings: LonLat[][], pointRad: LonLat): boolean {
  const lambda = normLonRad(pointRad[0]);
  let phi = pointRad[1];
  const sinPhi = Math.sin(phi);
  const normal: [number, number, number] = [Math.sin(lambda), -Math.cos(lambda), 0];
  let angle = 0;
  let winding = 0;
  let sum = 0;

  if (sinPhi === 1) phi = HALF_PI + EPS;
  else if (sinPhi === -1) phi = -HALF_PI - EPS;

  for (let i = 0; i < polygonRings.length; ++i) {
    const ring = polygonRings[i];
    const m = ring.length;
    if (!m) continue;

    let point0 = ring[m - 1];
    let lambda0 = normLonRad(point0[0]);
    let phi0 = point0[1] / 2 + QUARTER_PI;
    let sinPhi0 = Math.sin(phi0);
    let cosPhi0 = Math.cos(phi0);

    for (let j = 0; j < m; ++j) {
      const point1 = ring[j];
      const lambda1 = normLonRad(point1[0]);
      const phi1 = point1[1] / 2 + QUARTER_PI;
      const sinPhi1 = Math.sin(phi1);
      const cosPhi1 = Math.cos(phi1);
      const delta = lambda1 - lambda0;
      const sign = delta >= 0 ? 1 : -1;
      const absDelta = sign * delta;
      const antimeridian = absDelta > Math.PI;
      const k = sinPhi0 * sinPhi1;

      sum += Math.atan2(k * sign * Math.sin(absDelta), cosPhi0 * cosPhi1 + k * Math.cos(absDelta));
      angle += antimeridian ? delta + sign * TAU : delta;

      if (antimeridian !== (lambda0 >= lambda) !== (lambda1 >= lambda)) {
        const arc = cross(sphToCart(point0), sphToCart(point1));
        normalizeVec(arc);
        const intersection = cross(normal, arc);
        normalizeVec(intersection);
        const phiArc = (antimeridian !== delta >= 0 ? -1 : 1) * Math.asin(Math.max(-1, Math.min(1, intersection[2])));
        if (phi > phiArc || (phi === phiArc && (arc[0] !== 0 || arc[1] !== 0))) {
          winding += antimeridian !== delta >= 0 ? 1 : -1;
        }
      }

      lambda0 = lambda1;
      sinPhi0 = sinPhi1;
      cosPhi0 = cosPhi1;
      point0 = point1;
    }
  }

  return (angle < -EPS || (angle < EPS && sum < -EPS2)) !== Boolean(winding & 1);
}

function toRadRing(ring: LonLat[]): LonLat[] {
  const out = new Array<LonLat>(ring.length > 0 ? ring.length - 1 : 0);
  for (let i = 0; i < out.length; i++) {
    out[i] = [ring[i][0] * DEG2RAD, ring[i][1] * DEG2RAD];
  }
  return out;
}

export function geoContains(geometry: GeoAreaGeometry, pointDeg: LonLat): boolean {
  const ptRad: LonLat = [pointDeg[0] * DEG2RAD, pointDeg[1] * DEG2RAD];
  if (geometry.type === 'Polygon') {
    return ringContains(geometry.coordinates.map(toRadRing), ptRad);
  }
  for (let i = 0; i < geometry.coordinates.length; i++) {
    if (ringContains(geometry.coordinates[i].map(toRadRing), ptRad)) {
      return true;
    }
  }
  return false;
}

export function computeBBox(geometry: GeoAreaGeometry): [LonLat, LonLat] {
  let minLon = Infinity;
  let minLat = Infinity;
  let maxLon = -Infinity;
  let maxLat = -Infinity;

  const visitRing = (ring: LonLat[]) => {
    for (let i = 0; i < ring.length; i++) {
      const [lon, lat] = ring[i];
      if (lon < minLon) minLon = lon;
      if (lon > maxLon) maxLon = lon;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    }
  };

  if (geometry.type === 'Polygon') {
    geometry.coordinates.forEach(visitRing);
  } else {
    geometry.coordinates.forEach((poly) => poly.forEach(visitRing));
  }

  return [
    [minLon, minLat],
    [maxLon, maxLat],
  ];
}

// --- Lightweight TopoJSON Decoder ---
interface TopoArcPoint extends Array<number> {
  0: number;
  1: number;
}

export interface TopoJSONTopology {
  type: 'Topology';
  transform?: {
    scale: [number, number];
    translate: [number, number];
  };
  arcs: TopoArcPoint[][];
  objects: Record<string, TopoObject>;
}

interface TopoObject {
  type: string;
  id?: string | number;
  properties?: CountryRawProperties;
  geometries?: TopoObject[];
  arcs?: unknown;
}

function createPointTransform(transform?: TopoJSONTopology['transform']) {
  if (!transform) return (pt: number[]) => [pt[0], pt[1]] as LonLat;
  const [sx, sy] = transform.scale;
  const [tx, ty] = transform.translate;
  let x = 0;
  let y = 0;
  return (pt: number[], i = 0): LonLat => {
    if (i === 0) {
      x = 0;
      y = 0;
    }
    x += pt[0];
    y += pt[1];
    return [x * sx + tx, y * sy + ty];
  };
}

function reverseRange<T>(arr: T[], start: number) {
  let i = start;
  let j = arr.length - 1;
  while (i < j) {
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
    i++;
    j--;
  }
}

function decodeGeometry(topology: TopoJSONTopology, obj: TopoObject): GeoAreaGeometry | MultiLineStringGeometry | null {
  const transformPoint = createPointTransform(topology.transform);
  const arcs = topology.arcs;

  const stitchArc = (arcIndex: number, coords: LonLat[]) => {
    if (coords.length > 0) coords.pop();
    const arc = arcs[arcIndex < 0 ? ~arcIndex : arcIndex];
    const start = coords.length;
    for (let i = 0; i < arc.length; i++) {
      coords.push(transformPoint(arc[i], i));
    }
    if (arcIndex < 0) reverseRange(coords, start);
  };

  const decodeLine = (arcIndices: number[]): LonLat[] => {
    const coords: LonLat[] = [];
    for (let i = 0; i < arcIndices.length; i++) {
      stitchArc(arcIndices[i], coords);
    }
    if (coords.length < 2 && coords.length > 0) coords.push(coords[0]);
    return coords;
  };

  const decodeRing = (arcIndices: number[]): LonLat[] => {
    const coords = decodeLine(arcIndices);
    while (coords.length > 0 && coords.length < 4) coords.push(coords[0]);
    return coords;
  };

  if (obj.type === 'Polygon') {
    const rings = (obj.arcs as number[][]).map(decodeRing);
    return { type: 'Polygon', coordinates: rings };
  }
  if (obj.type === 'MultiPolygon') {
    const polys = (obj.arcs as number[][][]).map((p) => p.map(decodeRing));
    return { type: 'MultiPolygon', coordinates: polys };
  }
  if (obj.type === 'MultiLineString') {
    const lines = (obj.arcs as number[][]).map(decodeLine);
    return { type: 'MultiLineString', coordinates: lines };
  }
  return null;
}

export function decodeCountries(topology: TopoJSONTopology, objectKey: string): CountryFeature[] {
  const collection = topology.objects[objectKey];
  if (!collection || !collection.geometries) return [];

  const features: CountryFeature[] = [];
  for (const geomObj of collection.geometries) {
    const geometry = decodeGeometry(topology, geomObj);
    if (!geometry || (geometry.type !== 'Polygon' && geometry.type !== 'MultiPolygon')) continue;

    const rawProps: CountryRawProperties = geomObj.properties ?? {
      n: 'Unknown',
      c: '',
      f: '',
      k: '',
      a: 0,
    };
    const iso = rawProps.f || '';
    const flag = iso
      ? String.fromCodePoint(...[...iso].map((ch) => 127397 + ch.charCodeAt(0)))
      : '🏳️';

    features.push({
      id: String(geomObj.id ?? rawProps.n),
      properties: {
        ...rawProps,
        flag,
      },
      geometry,
      bbox: computeBBox(geometry),
    });
  }
  return features;
}

export function decodeCountryBorders(topology: TopoJSONTopology, objectKey: string): MultiLineStringGeometry {
  const collection = topology.objects[objectKey];
  const seen = new Set<number>();
  const arcsToDraw: number[][] = [];

  const visitArc = (idx: number) => {
    const key = idx < 0 ? ~idx : idx;
    if (seen.has(key)) return;
    seen.add(key);
    arcsToDraw.push([key]);
  };

  const visitObj = (obj: TopoObject) => {
    if (obj.type === 'GeometryCollection' && obj.geometries) {
      obj.geometries.forEach(visitObj);
    } else if (obj.type === 'Polygon' && Array.isArray(obj.arcs)) {
      (obj.arcs as number[][]).forEach((ring) => ring.forEach(visitArc));
    } else if (obj.type === 'MultiPolygon' && Array.isArray(obj.arcs)) {
      (obj.arcs as number[][][]).forEach((poly) => poly.forEach((ring) => ring.forEach(visitArc)));
    }
  };

  if (collection) visitObj(collection);
  const decoded = decodeGeometry(topology, { type: 'MultiLineString', arcs: arcsToDraw });
  if (decoded && decoded.type === 'MultiLineString') {
    return decoded;
  }
  return { type: 'MultiLineString', coordinates: [] };
}
