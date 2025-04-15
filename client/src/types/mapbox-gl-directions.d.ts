declare module '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions' {
  interface MapboxDirectionsOptions {
    accessToken: string;
    unit?: 'imperial' | 'metric';
    profile?: 'mapbox/driving' | 'mapbox/walking' | 'mapbox/cycling' | 'mapbox/driving-traffic';
    alternatives?: boolean;
    congestion?: boolean;
    steps?: boolean;
    controls?: {
      inputs?: boolean;
      instructions?: boolean;
      profileSwitcher?: boolean;
    };
    flyTo?: boolean;
    interactive?: boolean;
    placeholderOrigin?: string;
    placeholderDestination?: string;
    geocoder?: object;
    zoom?: number;
  }

  class MapboxDirections {
    constructor(options: MapboxDirectionsOptions);
    setOrigin(query: string | [number, number]): this;
    setDestination(query: string | [number, number]): this;
    on(type: string, fn: Function): this;
    removeRoutes(): this;
  }

  export default MapboxDirections;
}

declare module '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css';