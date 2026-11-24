export type ContinentId =
  | 'africa'
  | 'asia'
  | 'europe'
  | 'northamerica'
  | 'southamerica'
  | 'oceania'
  | 'antarctica';

export type MapMode = 'satellite' | 'hybrid' | 'atlas';

export type LonLat = [number, number];

export interface PolygonGeometry {
  type: 'Polygon';
  coordinates: LonLat[][];
}

export interface MultiPolygonGeometry {
  type: 'MultiPolygon';
  coordinates: LonLat[][][];
}

export interface MultiLineStringGeometry {
  type: 'MultiLineString';
  coordinates: LonLat[][];
}

export type GeoAreaGeometry = PolygonGeometry | MultiPolygonGeometry;

export interface ContinentConfig {
  id: ContinentId;
  name: string;
  sub?: string;
  color: string;
  at: LonLat;
  animals: string;
  facts: string[];
  geometry: MultiPolygonGeometry;
}

export interface CountryRawProperties {
  n: string; // Name
  c: string; // Space-separated continent IDs
  f: string; // ISO-2 code
  k: string; // Capital city
  l?: LonLat; // Label [lon, lat]
  a: number; // Relative area
}

export interface CountryFeature {
  id: string;
  properties: CountryRawProperties & {
    flag: string;
  };
  geometry: GeoAreaGeometry;
  bbox: [LonLat, LonLat]; // [[minLon, minLat], [maxLon, maxLat]]
}

export interface OceanLabel {
  name: string;
  at: LonLat;
}
