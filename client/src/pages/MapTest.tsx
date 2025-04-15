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

// Use actual data from the OpenAI API response
const TRIP_DATA = {
  "id": "denali-wilderness-explorer",
  "title": "Denali Wilderness Explorer",
  "description": "An adventurous journey into the heart of Denali National Park, featuring cycling on remote roads, hiking on pristine trails, and a thrilling rafting experience on the Nenana River.",
  "whyWeChoseThis": "Based on your interest in biking, hiking, and rafting in a natural setting, this Denali adventure offers all three activities in a less crowded area of Alaska. The trip balances moderate-intensity outdoor activities with incredible wildlife viewing opportunities in one of America's most pristine wilderness areas.",
  "difficultyLevel": "Intermediate",
  "priceEstimate": "$2,800 - $3,500 per person",
  "duration": "7 Days",
  "location": "Denali Backcountry, Alaska",
  "suggestedGuides": [
    "Alaska Wildland Adventures",
    "Denali Backcountry Guides",
    "Alaska Alpine Adventures"
  ],
  "mapCenter": [-149.7804, 63.7203],
  "markers": [
    {
      "name": "Savage River Area",
      "coordinates": [-149.7804, 63.7203]
    },
    {
      "name": "Wonder Lake",
      "coordinates": [-150.8805, 63.4952]
    }
  ],
  "journey": {
    "segments": [
      {
        "mode": "cycling",
        "from": "Savage River",
        "to": "Igloo Mountain Trail",
        "distance": 15000,
        "duration": 5400,
        "geometry": {
          "type": "LineString",
          "coordinates": [
            [-149.7804, 63.7203],
            [-149.8505, 63.6805],
            [-149.9204, 63.6405],
            [-150.005, 63.6005]
          ]
        }
      },
      {
        "mode": "hiking",
        "from": "Igloo Mountain Trail",
        "to": "Sable Pass",
        "distance": 8000,
        "duration": 8400,
        "geometry": {
          "type": "LineString",
          "coordinates": [
            [-150.005, 63.6005],
            [-150.0252, 63.5905],
            [-150.0654, 63.5855],
            [-150.105, 63.5805]
          ]
        }
      },
      {
        "mode": "rafting",
        "from": "Teklanika River",
        "to": "Nenana Canyon",
        "distance": 20000,
        "duration": 10800,
        "geometry": {
          "type": "LineString",
          "coordinates": [
            [-150.105, 63.5805],
            [-150.1505, 63.6205],
            [-150.2254, 63.6805],
            [-150.3, 63.7805]
          ]
        }
      }
    ],
    "totalDistance": 43000,
    "totalDuration": 24600,
    "bounds": [[-150.8805, 63.4952], [-149.7804, 63.7803]]
  },
  "itinerary": [
    {
      "day": 1,
      "title": "Arrival and Orientation",
      "description": "Arrive in Anchorage and transfer to your accommodation near Denali National Park. Meet your guides and review the trip itinerary.",
      "activities": [
        "Anchorage to Denali transfer (3 hours)",
        "Welcome dinner and trip briefing",
        "Equipment check and preparation"
      ],
      "accommodations": "Denali Backcountry Lodge"
    },
    {
      "day": 2,
      "title": "Cycling the Park Road",
      "description": "Begin your adventure cycling along the restricted-access Denali Park Road, with stunning views and wildlife sightings.",
      "activities": [
        "Morning wildlife briefing",
        "Guided cycling tour (15 miles)",
        "Picnic lunch at scenic overlook",
        "Wildlife spotting (caribou, moose, and possibly bears)"
      ],
      "accommodations": "Wilderness Campsite - Savage River"
    },
    {
      "day": 3,
      "title": "Igloo Mountain Hike",
      "description": "Hike the scenic trail around Igloo Mountain, offering panoramic views of the Alaska Range.",
      "activities": [
        "Guided morning hike (5 miles)",
        "Alpine wildflower identification",
        "Packed wilderness lunch",
        "Photography session at Sable Pass"
      ],
      "accommodations": "Wilderness Campsite - Igloo Creek"
    }
  ]
};

// Extract waypoints from the markers in the trip data
const WAYPOINTS = TRIP_DATA.markers;

// Create activity points for each day of the itinerary
const ACTIVITY_POINTS: { 
  name: string; 
  coordinates: [number, number]; 
  type: 'viewpoint' | 'rest' | 'meditation' | 'water' | 'photo';
  description: string;
}[] = [
  { 
    name: "Wildlife Viewing Area", 
    coordinates: [-149.8505, 63.6805],
    type: 'viewpoint',
    description: "Excellent spot for viewing caribou and moose"
  },
  { 
    name: "Photography Location", 
    coordinates: [-150.0252, 63.5905],
    type: 'photo',
    description: "Beautiful vantage point for photos of Denali"
  },
  { 
    name: "Alpine Meditation Site", 
    coordinates: [-150.0654, 63.5855],
    type: 'meditation',
    description: "Peaceful location for morning meditation"
  },
  { 
    name: "Mountain Water Source", 
    coordinates: [-150.1505, 63.6205],
    type: 'water',
    description: "Fresh glacier water - safe to drink after filtering"
  },
  { 
    name: "Rest Area", 
    coordinates: [-150.2254, 63.6805],
    type: 'rest',
    description: "Sheltered rest stop with views of the valley"
  }
];

// Map the journey segments to valid MapBox Directions API profiles
const ROUTE_SEGMENTS: RouteSegment[] = TRIP_DATA.journey.segments.map((segment, index) => {
  // Get start and end coordinates from segment geometry
  const startCoords = segment.geometry.coordinates[0] as [number, number];
  const endCoords = segment.geometry.coordinates[segment.geometry.coordinates.length - 1] as [number, number];
  
  // Map custom activity types to valid MapBox profiles
  let profile: 'driving' | 'walking' | 'cycling';
  let color: string;
  
  switch(segment.mode) {
    case 'cycling':
      profile = 'cycling';
      color = '#f59e0b'; // amber
      break;
    case 'hiking':
    case 'walking':
      // Hiking and walking use the walking profile
      profile = 'walking';
      color = '#10b981'; // green 
      break;
    case 'rafting':
      // MapBox doesn't have rafting, so use walking with a different color
      profile = 'walking';
      color = '#3b82f6'; // blue for rafting
      break;
    default:
      profile = 'driving';
      color = '#3b82f6'; // blue
  }
  
  return {
    start: startCoords,
    end: endCoords,
    color,
    name: `${segment.from} to ${segment.to} (${segment.mode})`,
    profile
  };
});

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
            const segmentIndex = i; // Get original segment index from journey data
            
            // First try to fetch directions from our proxy endpoint
            const routeData = await fetchDirections(
              segment.start,
              segment.end,
              segment.profile
            );
            
            if (routeData && routeData.geometry) {
              // Log route details from API
              console.log(`Route ${i} details from API:`, {
                distance: `${(routeData.distance / 1609.34).toFixed(2)} miles`,
                duration: `${Math.floor(routeData.duration / 60)} minutes`,
                mode: segment.profile
              });
              
              // Add API route to map
              addRouteToMap(map, routeData.geometry, `route-${i}`, segment.color);
              setRoutesLoaded(prev => prev + 1);
            } else {
              console.log(`No API route found for segment ${i}, using provided geometry`);
              
              // Fall back to using the geometry data provided in the JSON
              const originalSegment = TRIP_DATA.journey.segments[segmentIndex];
              
              if (originalSegment && originalSegment.geometry) {
                console.log(`Using provided geometry for segment ${i} (${originalSegment.mode})`);
                
                // Calculate rough distance using provided data
                const distanceInMiles = (originalSegment.distance / 1609.34).toFixed(2);
                const durationInMinutes = Math.floor(originalSegment.duration / 60);
                
                console.log(`Segment ${i} (${originalSegment.mode}):`, {
                  from: originalSegment.from,
                  to: originalSegment.to,
                  distance: `${distanceInMiles} miles`,
                  duration: `${durationInMinutes} minutes`
                });
                
                // Add custom route to map using journey segment geometry
                addRouteToMap(map, originalSegment.geometry, `route-${i}`, segment.color);
                setRoutesLoaded(prev => prev + 1);
              } else {
                console.error(`Failed to fetch or create directions for segment ${i}`);
              }
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
              .setLngLat(waypoint.coordinates as [number, number])
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
              .setLngLat(point.coordinates as [number, number])
              .setPopup(popup)
              .addTo(map);
          });
          
          // Calculate bounds to fit all points and routes
          const bounds = new mapboxgl.LngLatBounds();
          
          // Add all waypoints to bounds
          WAYPOINTS.forEach(waypoint => {
            bounds.extend(waypoint.coordinates as mapboxgl.LngLatLike);
          });
          
          // Add all activity points to bounds
          ACTIVITY_POINTS.forEach(point => {
            bounds.extend(point.coordinates as mapboxgl.LngLatLike);
          });
          
          // Add all route coordinates to the bounds
          TRIP_DATA.journey.segments.forEach(segment => {
            if (segment.geometry && segment.geometry.coordinates) {
              segment.geometry.coordinates.forEach(coord => {
                bounds.extend(coord as mapboxgl.LngLatLike);
              });
            }
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
      <h1 className="text-2xl font-bold mb-2">{TRIP_DATA.title}</h1>
      <div className="flex flex-col md:flex-row gap-2 mb-4">
        <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded">
          {TRIP_DATA.location}
        </span>
        <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
          {TRIP_DATA.duration}
        </span>
        <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded">
          {TRIP_DATA.difficultyLevel}
        </span>
        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
          {TRIP_DATA.priceEstimate}
        </span>
      </div>
      
      <p className="text-gray-700 mb-4">
        {TRIP_DATA.description}
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="p-4 bg-gray-50 rounded shadow-sm">
          <h3 className="font-bold mb-2">Trip Highlights</h3>
          <p className="text-gray-600 mb-4">{TRIP_DATA.whyWeChoseThis}</p>
          
          <h4 className="font-medium text-sm mb-2">SUGGESTED GUIDES</h4>
          <ul className="list-disc pl-5 mb-4">
            {TRIP_DATA.suggestedGuides.map((guide, i) => (
              <li key={i} className="text-sm text-gray-700">{guide}</li>
            ))}
          </ul>
          
          <h4 className="font-medium text-sm mb-2">KEY LOCATIONS</h4>
          <div className="space-y-2">
            {WAYPOINTS.map((waypoint, i) => (
              <div key={i} className="flex items-start">
                <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0"></div>
                <div className="ml-2">
                  <p className="text-sm font-medium">{waypoint.name}</p>
                  <p className="text-xs text-gray-500">
                    Coordinates: {waypoint.coordinates[1].toFixed(4)}, {waypoint.coordinates[0].toFixed(4)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-4 bg-gray-50 rounded shadow-sm">
          <h3 className="font-bold mb-2">Itinerary Preview</h3>
          <div className="space-y-4">
            {TRIP_DATA.itinerary.map((day) => (
              <div key={day.day} className="border-l-2 border-primary/30 pl-3">
                <h4 className="font-medium">Day {day.day}: {day.title}</h4>
                <p className="text-sm text-gray-600 mb-2">{day.description}</p>
                <div className="text-xs space-y-1">
                  {day.activities.slice(0, 2).map((activity, i) => (
                    <div key={i} className="flex items-start">
                      <span className="text-primary mt-0.5">•</span>
                      <span className="ml-1 text-gray-700">{activity}</span>
                    </div>
                  ))}
                  {day.activities.length > 2 && (
                    <div className="italic text-gray-500">+ {day.activities.length - 2} more activities</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="p-4 bg-gray-100 rounded">
        <h2 className="font-bold mb-2">Map Elements:</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          <div>
            <span className="font-medium">Routes:</span> 
            <span className="ml-2">{routesLoaded}/{ROUTE_SEGMENTS.length}</span>
          </div>
          <div>
            <span className="font-medium">Waypoints:</span> 
            <span className="ml-2">{WAYPOINTS.length}</span>
          </div>
          <div>
            <span className="font-medium">Activities:</span> 
            <span className="ml-2">{ACTIVITY_POINTS.length}</span>
          </div>
          <div>
            <span className="font-medium">Total Distance:</span> 
            <span className="ml-2">{(TRIP_DATA.journey.totalDistance / 1609.34).toFixed(1)} miles</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Routes legend */}
          <div className="mb-3">
            <h4 className="text-sm font-medium text-gray-600 mb-1">Transportation Modes:</h4>
            <div className="flex flex-col space-y-1">
              {ROUTE_SEGMENTS.map((segment, i) => (
                <div key={i} className="flex items-center">
                  <div 
                    className="w-4 h-4 mr-2 rounded-full" 
                    style={{ backgroundColor: segment.color }} 
                  />
                  <span className="text-sm">{segment.name}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Activity points legend */}
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-1">Activity Types:</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <div className="flex items-center">
                <div className="w-3 h-3 mr-2 rounded-full" style={{ backgroundColor: '#f97316' }} />
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
        </div>
      </div>
    </div>
  );
};

export default MapTest;