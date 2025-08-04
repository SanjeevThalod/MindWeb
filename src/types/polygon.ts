export type LatLng = {
  lat: number;
  lng: number;
};

export type ColorRule = {
  operator: '<' | '>' | '<=' | '>=' | '=';
  value: number;
  color: string;
};

export type PolygonData = {
  id: string;
  coordinates: LatLng[];         // Polygon points
  centroid: LatLng;              // Used to fetch data
  dataSource: 'open-meteo';      // Could be extended later
  variable: string;              // e.g. 'temperature_2m'
  rules: ColorRule[];            // Coloring logic
  currentValue?: number;         // Temp at current time
  currentColor?: string;         // Assigned by rules
};
