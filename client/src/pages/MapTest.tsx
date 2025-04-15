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

// Define main waypoints for our journey
const WAYPOINTS: { name: string; coordinates: [number, number] }[] = [
  { name: "Sedona Airport", coordinates: [-111.79012, 34.84857] },
  { name: "Mystic Trail B&B", coordinates: [-111.76129, 34.86054] },
  { name: "Boynton Canyon Vortex", coordinates: [-111.85056, 34.90868] }
];

// Define hiking activity points along the trail
const ACTIVITY_POINTS: { 
  name: string; 
  coordinates: [number, number]; 
  type: 'viewpoint' | 'rest' | 'meditation' | 'water' | 'photo';
  description: string;
}[] = [
  { 
    name: "Forest Meditation Spot", 
    coordinates: [-111.78234, 34.87123],
    type: 'meditation',
    description: "Peaceful spot for morning meditation practice"
  },
  { 
    name: "Red Rock Viewpoint", 
    coordinates: [-111.81529, 34.88964],
    type: 'viewpoint',
    description: "Breathtaking views of surrounding red rock formations"
  },
  { 
    name: "Natural Spring", 
    coordinates: [-111.83782, 34.90127],
    type: 'water',
    description: "Fresh natural spring water - safe to drink after filtering"
  },
  { 
    name: "Energy Vortex Spot", 
    coordinates: [-111.84500, 34.90500],
    type: 'meditation',
    description: "Known energy vortex location - perfect for spiritual practice"
  }
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

  // Fetch directions from our proxy to the Mapbox API
  const fetchDirections = async (
    start: [number, number],
    end: [number, number],
    profile: 'driving' | 'walking' | 'cycling'
  ) => {
    try {
      // Use our backend proxy instead of directly calling MapBox API
      const coordinates = `${start[0]},${start[1]};${end[0]},${end[1]}`;
      const url = `/api/directions?profile=${profile}&coordinates=${coordinates}`;
      
      console.log(`Fetching directions from: ${url}`);
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response from directions API:', errorData);
        return null;
      }
      
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        // Return both geometry and additional route details
        return {
          geometry: data.routes[0].geometry,
          distance: data.routes[0].distance, // in meters
          duration: data.routes[0].duration, // in seconds
          legs: data.routes[0].legs
        };
      } else {
        console.error('No routes found in response:', data);
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
            
            // Fetch directions from our proxy endpoint
            const routeData = await fetchDirections(
              segment.start,
              segment.end,
              segment.profile
            );
            
            if (routeData && routeData.geometry) {
              // Log route details
              console.log(`Route ${i} details:`, {
                distance: `${(routeData.distance / 1609.34).toFixed(2)} miles`,
                duration: `${Math.floor(routeData.duration / 60)} minutes`,
                mode: segment.profile
              });
              
              // Add route to map
              addRouteToMap(map, routeData.geometry, `route-${i}`, segment.color);
              setRoutesLoaded(prev => prev + 1);
            } else {
              console.error(`Failed to fetch directions for segment ${i}`);
            }
          }
          
          // Add markers for main waypoints
          WAYPOINTS.forEach((waypoint, index) => {
            // Determine marker color based on position
            let color = '#3b82f6'; // Default blue
            if (index === 0) color = '#22c55e'; // Start: green
            if (index === WAYPOINTS.length - 1) color = '#ef4444'; // End: red
            
            // Create a popup with more info
            const popup = new mapboxgl.Popup({ offset: 25 })
              .setHTML(`
                <div class="p-2">
                  <h3 class="font-bold text-lg">${waypoint.name}</h3>
                  <p class="text-gray-600">${index === 0 ? 'Starting Point' : index === WAYPOINTS.length - 1 ? 'Destination' : 'Waypoint'}</p>
                </div>
              `);
            
            // Create and add the marker
            new mapboxgl.Marker({ color, scale: 1.0 })
              .setLngLat(waypoint.coordinates)
              .setPopup(popup)
              .addTo(map);
          });
          
          // Add activity markers along the hiking trail
          ACTIVITY_POINTS.forEach((point) => {
            // Choose icon color based on activity type
            let color = '#9333ea'; // Default purple
            
            // Set different colors based on activity type
            if (point.type === 'viewpoint') color = '#f97316'; // Orange
            if (point.type === 'meditation') color = '#8b5cf6'; // Purple
            if (point.type === 'water') color = '#0ea5e9'; // Blue
            if (point.type === 'rest') color = '#84cc16'; // Green
            if (point.type === 'photo') color = '#ec4899'; // Pink
            
            // Create a detailed popup
            const popup = new mapboxgl.Popup({ offset: 25, maxWidth: '300px' })
              .setHTML(`
                <div class="p-2">
                  <h3 class="font-bold text-lg">${point.name}</h3>
                  <div class="text-xs uppercase tracking-wide text-gray-500 mt-1 mb-2">
                    ${point.type} location
                  </div>
                  <p class="text-sm text-gray-700">${point.description}</p>
                </div>
              `);
            
            // Create and add specialized marker
            new mapboxgl.Marker({ 
              color, 
              scale: 0.8, // Slightly smaller than main waypoints
              // Use different shapes for different types if we had SVG icons
            })
              .setLngLat(point.coordinates)
              .setPopup(popup)
              .addTo(map);
          });
          
          // Calculate bounds to fit all points
          const bounds = new mapboxgl.LngLatBounds();
          
          // Add all waypoints to bounds
          WAYPOINTS.forEach(waypoint => {
            bounds.extend(waypoint.coordinates as mapboxgl.LngLatLike);
          });
          
          // Add all activity points to bounds
          ACTIVITY_POINTS.forEach(point => {
            bounds.extend(point.coordinates as mapboxgl.LngLatLike);
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
      <h1 className="text-2xl font-bold mb-2">Interactive Trip Map with Activities</h1>
      <p className="text-gray-600 mb-4">
        Sample implementation showing how trip data from OpenAI API responses will be displayed as interactive maps with routes and activities
      </p>
      
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
          <h3 className="font-medium mb-2">Map Legend:</h3>
          
          {/* Routes legend */}
          <div className="mb-3">
            <h4 className="text-sm text-gray-600 mb-1">Route Types:</h4>
            <div className="flex flex-col space-y-1">
              {ROUTE_SEGMENTS.map((segment, i) => (
                <div key={i} className="flex items-center">
                  <div 
                    className="w-4 h-4 mr-2 rounded-full" 
                    style={{ backgroundColor: segment.color }} 
                  />
                  <span className="text-sm">{segment.name} ({segment.profile})</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Activity points legend */}
          <div>
            <h4 className="text-sm text-gray-600 mb-1">Activity Points:</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <div className="flex items-center">
                <div className="w-3 h-3 mr-2 rounded-full bg-f97316" style={{ backgroundColor: '#f97316' }} />
                <span className="text-sm">Viewpoint</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 mr-2 rounded-full" style={{ backgroundColor: '#8b5cf6' }} />
                <span className="text-sm">Meditation</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 mr-2 rounded-full" style={{ backgroundColor: '#0ea5e9' }} />
                <span className="text-sm">Water Source</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 mr-2 rounded-full" style={{ backgroundColor: '#84cc16' }} />
                <span className="text-sm">Rest Stop</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 mr-2 rounded-full" style={{ backgroundColor: '#ec4899' }} />
                <span className="text-sm">Photo Spot</span>
              </div>
            </div>
          </div>
          
          <div className="mt-3 text-xs text-gray-500">
            Click on any marker to view details. Routes are calculated using real MapBox Directions API.
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapTest;