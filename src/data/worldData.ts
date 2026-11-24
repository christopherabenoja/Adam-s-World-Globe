import continentsRaw from './continentsGeo.json';
import countriesTopoRaw from './countriesTopo.json';
import type {
  ContinentConfig,
  ContinentId,
  MultiPolygonGeometry,
  OceanLabel,
} from '../types/globe';
import { decodeCountries, decodeCountryBorders, type TopoJSONTopology } from '../utils/geo';

const continentsGeo = continentsRaw as Record<ContinentId, MultiPolygonGeometry>;
const countriesTopology = countriesTopoRaw as unknown as TopoJSONTopology;

export const CONTINENTS: ContinentConfig[] = [
  {
    id: 'africa',
    name: 'Africa',
    color: '#FFB627',
    at: [20, 4],
    animals: '🦁🐘🦒🦓',
    facts: [
      'Lions, elephants and giraffes live here.',
      'The Sahara is the biggest hot desert in the world.',
    ],
    geometry: continentsGeo.africa,
  },
  {
    id: 'asia',
    name: 'Asia',
    color: '#FF5964',
    at: [92, 45],
    animals: '🐼🐅🐪🐘',
    facts: [
      'Asia is the BIGGEST continent!',
      'Mount Everest, the tallest mountain, is here.',
    ],
    geometry: continentsGeo.asia,
  },
  {
    id: 'europe',
    name: 'Europe',
    color: '#8E6CEF',
    at: [18, 53],
    animals: '🦔🐻🦌🦊',
    facts: [
      'Europe has lots of countries close together.',
      'Hedgehogs and foxes live here.',
    ],
    geometry: continentsGeo.europe,
  },
  {
    id: 'northamerica',
    name: 'North America',
    color: '#35C26B',
    at: [-100, 46],
    animals: '🦅🦬🐻🦝',
    facts: [
      'Bald eagles and bison live here.',
      'The Grand Canyon is here.',
    ],
    geometry: continentsGeo.northamerica,
  },
  {
    id: 'southamerica',
    name: 'South America',
    color: '#2EC4F1',
    at: [-60, -14],
    animals: '🦥🦜🦙🐆',
    facts: [
      'The Amazon is the biggest rainforest.',
      'Sloths, toucans and llamas live here.',
    ],
    geometry: continentsGeo.southamerica,
  },
  {
    id: 'oceania',
    name: 'Australia',
    sub: 'and Oceania',
    color: '#FF8BD0',
    at: [134, -25],
    animals: '🦘🐨🐠🦈',
    facts: [
      'Kangaroos and koalas live here.',
      'Australia is the smallest continent.',
    ],
    geometry: continentsGeo.oceania,
  },
  {
    id: 'antarctica',
    name: 'Antarctica',
    color: '#E8F4FF',
    at: [0, -82],
    animals: '🐧🦭🐋❄️',
    facts: [
      'The coldest place on Earth!',
      'It is covered in ice. Penguins live here.',
    ],
    geometry: continentsGeo.antarctica,
  },
];

export const CONTINENT_BY_ID: Record<ContinentId, ContinentConfig> = Object.fromEntries(
  CONTINENTS.map((c) => [c.id, c]),
) as Record<ContinentId, ContinentConfig>;

export const COUNTRIES = decodeCountries(countriesTopology, 'countries').sort(
  (a, b) => b.properties.a - a.properties.a,
);

export const COUNTRY_BORDERS = decodeCountryBorders(countriesTopology, 'countries');

export const OCEANS: OceanLabel[] = [
  { name: 'Pacific Ocean', at: [-150, 5] },
  { name: 'Pacific Ocean', at: [170, 15] },
  { name: 'Atlantic Ocean', at: [-35, 20] },
  { name: 'Atlantic Ocean', at: [-20, -25] },
  { name: 'Indian Ocean', at: [78, -22] },
  { name: 'Arctic Ocean', at: [0, 86] },
  { name: 'Southern Ocean', at: [60, -62] },
];
