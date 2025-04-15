import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

type RouteSegment = {
  start: [number, number]; // [longitude, latitude]
  end: [number, number];    // [longitude, latitude]
  color: string;
  name: string;
  profile: 'driving' | 'walking' | 'cycling';
};

// Define waypoints for our journey
const WAYPOINTS: { name: string; coordinates: [number, number] }[] = [
  { name: "Sedona Airport", coordinates: [-111.79012, 34.84857] },
  { name: "Mystic Trail B&B", coordinates: [-111.76129, 34.86054] },
  { name: "Boynton Canyon Vortex", coordinates: [-111.85056, 34.90868] }
];

// Define route segments
const ROUTE_SEGMENTS: RouteSegment[] = [
  {
    start: WAYPOINTS[0].coordinates,
    end: WAYPOINTS[1].coordinates,
    color: '#3b82f6', // blue
    name: 'Airport to B&B',
    profile: 'driving'
  },
  {
    start: WAYPOINTS[1].coordinates,
    end: WAYPOINTS[2].coordinates,
    color: '#22c55e', // green
    name: 'Hiking Trail',
    profile: 'walking'
  }
];

const MapTest: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [routesLoaded, setRoutesLoaded] = useState(0);

  // Fetch directions from Mapbox API
  const fetchDirections = async (
    start: [number, number],
    end: [number, number],
    profile: 'driving' | 'walking' | 'cycling',
    token: string
  ) => {
    try {
      const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${token}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        return data.routes[0].geometry;
      } else {
        console.error('No routes found:', data);
        return null;
      }
    } catch (err) {
      console.error('Error fetching directions:', err);
      return null;
    }
  };

  // Add a route to the map
  const addRouteToMap = (
    map: mapboxgl.Map,
    geometry: any,
    id: string,
    color: string
  ) => {
    // Add the route source
    map.addSource(id, {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry
      }
    });
    
    // Add the route layer
    map.addLayer({
      id,
      type: 'line',
      source: id,
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': color,
        'line-width': 5,
        'line-opacity': 0.8
      }
    });
  };

  // Fetch the MapBox token and initialize map
  useEffect(() => {
    async function initializeMap() {
      try {
        // Fetch MapBox token
        const response = await fetch('/api/config');
        const data = await response.json();
        
        if (!data.mapboxToken) {
          setError('No MapBox token available');
          setLoading(false);
          return;
        }
        
        // Save token and set Mapbox access token
        const token = data.mapboxToken;
        setMapboxToken(token);
        mapboxgl.accessToken = token;
        
        // Ensure map container exists
        if (!mapContainerRef.current) {
          setError('Map container not found');
          setLoading(false);
          return;
        }
        
        // Calculate center of the map (average of all waypoints)
        const center: [number, number] = [
          WAYPOINTS.reduce((sum, wp) => sum + wp.coordinates[0], 0) / WAYPOINTS.length,
          WAYPOINTS.reduce((sum, wp) => sum + wp.coordinates[1], 0) / WAYPOINTS.length
        ];
        
        // Create the map
        console.log('Initializing map with container');
        const map = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: 'mapbox://styles/mapbox/outdoors-v12', // Outdoors style for hiking trips
          center,
          zoom: 10
        });
        
        mapRef.current = map;
        
        // When map is loaded, add the routes and markers
        map.on('load', async () => {
          console.log('Map loaded successfully!');
          setMapLoaded(true);
          
          // Add all route segments
          for (let i = 0; i < ROUTE_SEGMENTS.length; i++) {
            const segment = ROUTE_SEGMENTS[i];
            
            // Fetch directions from MapBox API
            const geometry = await fetchDirections(
              segment.start,
              segment.end,
              segment.profile,
              token
            );
            
            if (geometry) {
              // Add route to map
              addRouteToMap(map, geometry, `route-${i}`, segment.color);
              setRoutesLoaded(prev => prev + 1);
            } else {
              console.error(`Failed to fetch directions for segment ${i}`);
            }
          }
          
          // Add markers for key locations
          WAYPOINTS.forEach((waypoint, index) => {
            // Determine marker color based on position
            let color = '#3b82f6'; // Default blue
            if (index === 0) color = '#22c55e'; // Start: green
            if (index === WAYPOINTS.length - 1) color = '#ef4444'; // End: red
            
            // Create a popup
            const popup = new mapboxgl.Popup({ offset: 25 })
              .setHTML(`<h3 class="font-bold">${waypoint.name}</h3>`);
            
            // Create and add the marker
            new mapboxgl.Marker({ color })
              .setLngLat(waypoint.coordinates)
              .setPopup(popup)
              .addTo(map);
          });
          
          // Calculate bounds to fit all waypoints
          const bounds = new mapboxgl.LngLatBounds();
          WAYPOINTS.forEach(waypoint => {
            // Explicitly cast to LngLatLike to fix type issue
            bounds.extend(waypoint.coordinates as mapboxgl.LngLatLike);
          });
          
          // Fit map to show all waypoints with padding
          map.fitBounds(bounds, {
            padding: 80,
            duration: 1000
          });
          
          setLoading(false);
        });
        
        // Handle map errors
        map.on('error', (e) => {
          console.error('MapBox error:', e);
          setError(`Error loading map: ${e.error?.message || 'Unknown error'}`);
          setLoading(false);
        });
      } catch (err) {
        console.error('Error in map initialization:', err);
        setError(`Failed to initialize map: ${err instanceof Error ? err.message : String(err)}`);
        setLoading(false);
      }
    }
    
    initializeMap();
    
    // Cleanup on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []);
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Interactive MapBox Journey with Real Directions</h1>
      
      {loading && (
        <div className="mb-4 p-4 bg-blue-100 rounded">
          <p>Loading interactive map and calculating routes...</p>
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          <h3 className="font-bold">Error:</h3>
          <p>{error}</p>
        </div>
      )}
      
      <div 
        ref={mapContainerRef} 
        className="w-full h-[70vh] border rounded shadow-md mb-4"
        style={{ minHeight: '600px' }}
      />
      
      <div className="p-4 bg-gray-100 rounded">
        <h2 className="font-bold mb-2">Map Status:</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div>
            <span className="font-medium">Map Token:</span> 
            <span className="ml-2">{mapboxToken ? '✅' : '❌'}</span>
          </div>
          <div>
            <span className="font-medium">Map Created:</span> 
            <span className="ml-2">{mapRef.current ? '✅' : '❌'}</span>
          </div>
          <div>
            <span className="font-medium">Map Loaded:</span> 
            <span className="ml-2">{mapLoaded ? '✅' : '❌'}</span>
          </div>
          <div>
            <span className="font-medium">Routes Loaded:</span> 
            <span className="ml-2">{routesLoaded}/{ROUTE_SEGMENTS.length}</span>
          </div>
        </div>
        
        <div className="mt-4">
          <h3 className="font-medium mb-2">Route Legend:</h3>
          <div className="flex flex-col space-y-2">
            {ROUTE_SEGMENTS.map((segment, i) => (
              <div key={i} className="flex items-center">
                <div 
                  className="w-4 h-4 mr-2 rounded-full" 
                  style={{ backgroundColor: segment.color }} 
                />
                <span>{segment.name} ({segment.profile})</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapTest;