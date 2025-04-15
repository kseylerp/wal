import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trip, Activity, KeyLocation } from '@/types/trip-schema';

// This is sample data to demonstrate the UI
// In the final application, this would come from the AI's response
const SAMPLE_TRIP: Trip = {
  id: "san-juans-wild-loop",
  title: "San Juans Wild Loop: Camp, Bike, Hike & Raft",
  description: "Loop journey through Colorado's wildest peaks. Bike the alpine passes, summit remote 13ers, raft the Animas River, and camp beneath the stars.",
  themes: ["mountain biking", "alpine hiking", "whitewater rafting", "remote camping"],
  region: "San Juan Mountains (Durango/Silverton/Ouray/Lake City)",
  duration_days: 10,
  
  intensity: "high",
  price_range: {
    min: 1800,
    max: 2500,
    currency: "USD"
  },
  
  best_seasons: ["summer"],
  recommended_months: [6, 7, 8, 9], 
  weather: {
    historical: {
      avg_high_f: 75,
      avg_low_f: 42,
      avg_precipitation_inches: 1.2,
      typical_conditions: ["Sunny mornings", "Afternoon thunderstorms", "Cool nights"]
    },
    current_forecast: {
      source: "National Weather Service",
      updated_at: "2025-04-15T08:00:00Z",
      daily: [
        {
          date: "2025-04-15",
          high_f: 68,
          low_f: 38,
          conditions: "Partly cloudy",
          precipitation_chance: 20,
          wind_mph: 5
        },
        {
          date: "2025-04-16",
          high_f: 72,
          low_f: 41,
          conditions: "Sunny",
          precipitation_chance: 10,
          wind_mph: 7
        }
      ]
    }
  },
  
  map_center: [-107.8801, 37.2753], // Durango
  bounds: [[-107.8821, 37.2753], [-107.5044, 38.0302]],
  
  key_locations: [
    {
      id: "durango",
      name: "Durango",
      type: "city",
      coordinates: [-107.8801, 37.2753],
      elevation_ft: 6512,
      description: "Historic mountain town and starting point for our adventure"
    },
    {
      id: "silverton",
      name: "Silverton",
      type: "town",
      coordinates: [-107.6653, 37.8119],
      elevation_ft: 9318,
      description: "Former silver mining town surrounded by spectacular mountains"
    },
    {
      id: "engineer_pass",
      name: "Engineer Pass",
      type: "peak",
      coordinates: [-107.6028, 37.9722],
      elevation_ft: 12800,
      description: "High mountain pass along the Alpine Loop 4x4 road"
    },
    {
      id: "handies_peak",
      name: "Handies Peak",
      type: "peak",
      coordinates: [-107.5044, 37.9129],
      elevation_ft: 14048,
      description: "One of Colorado's 14ers with stunning 360-degree views"
    },
    {
      id: "ouray",
      name: "Ouray",
      type: "town",
      coordinates: [-107.6714, 38.0228],
      elevation_ft: 7792,
      description: "Known as the 'Switzerland of America' for its alpine setting"
    },
    {
      id: "animas_river",
      name: "Animas River",
      type: "river",
      coordinates: [-107.8801, 37.3366],
      elevation_ft: 6200,
      description: "Famous rafting destination with exciting rapids"
    }
  ],
  
  itinerary: [
    {
      day: 1,
      title: "Arrive in Durango",
      description: "Gear check, acclimatize, and explore historic town.",
      lodging: {
        type: "hotel",
        name: "Durango Downtown Inn",
        location: "Durango",
        coordinates: [-107.8801, 37.2753],
        booking_link: "https://example.com/booking",
        notes: "Located in the heart of downtown, walking distance to restaurants and shops"
      },
      activities: [
        {
          id: "day1-town-exploration",
          title: "Explore Historic Downtown",
          type: "walking",
          difficulty: "easy",
          duration_hours: 2,
          start_location: "durango",
          end_location: "durango",
          highlights: ["Historic buildings", "Local art galleries", "Craft breweries"],
          hazards: [],
          route_details: {
            distance_miles: 1.5,
            elevation_gain_ft: 50,
            elevation_loss_ft: 50,
            high_point_ft: 6520,
            terrain: "paved sidewalks",
            route_type: "loop"
          },
          route_geometry: {
            type: "LineString",
            coordinates: [
              [-107.8801, 37.2753],
              [-107.8781, 37.2743],
              [-107.8771, 37.2763],
              [-107.8791, 37.2773],
              [-107.8801, 37.2753]
            ]
          }
        }
      ]
    },
    {
      day: 2,
      title: "Warm-up Ride in Durango",
      description: "Get acclimated with warm-up mountain bike rides on local trails.",
      lodging: {
        type: "hotel",
        name: "Durango Downtown Inn",
        location: "Durango",
        coordinates: [-107.8801, 37.2753],
        booking_link: "https://example.com/booking",
        notes: "Same accommodation as previous night"
      },
      activities: [
        {
          id: "day2-horse-gulch-ride",
          title: "Horse Gulch Trail System Ride",
          type: "biking",
          difficulty: "moderate",
          duration_hours: 3,
          start_location: "durango",
          end_location: "durango",
          highlights: ["Flowing singletrack", "Desert views", "Technical options available"],
          hazards: ["Some exposure", "Rocky sections"],
          route_details: {
            distance_miles: 8.5,
            elevation_gain_ft: 750,
            elevation_loss_ft: 750,
            high_point_ft: 7200,
            terrain: "dirt singletrack, some rocks",
            route_type: "loop"
          },
          route_geometry: {
            type: "LineString",
            coordinates: [
              [-107.8801, 37.2753],
              [-107.8654, 37.2698],
              [-107.8554, 37.2748],
              [-107.8654, 37.2798],
              [-107.8801, 37.2753]
            ]
          }
        }
      ]
    },
    {
      day: 3,
      title: "Journey to Silverton",
      description: "Epic bike ride or shuttle to Silverton via the Million Dollar Highway.",
      lodging: {
        type: "camping",
        name: "Silverton Backcountry",
        location: "Near Silverton",
        coordinates: [-107.6653, 37.8119],
        booking_link: "https://campflare.com/silverton",
        notes: "Remote camping, no facilities"
      },
      activities: [
        {
          id: "day3-durango-to-silverton",
          title: "Durango to Silverton Bike Ride",
          type: "biking",
          difficulty: "difficult",
          duration_hours: 6,
          start_location: "durango",
          end_location: "silverton",
          highlights: ["Million Dollar Highway views", "Alpine terrain", "Historic mining sites"],
          hazards: ["Traffic", "Steep drop-offs", "High altitude"],
          route_details: {
            distance_miles: 50,
            elevation_gain_ft: 5800,
            elevation_loss_ft: 3200,
            high_point_ft: 10910,
            terrain: "paved road with shoulder",
            route_type: "point_to_point"
          },
          route_geometry: {
            type: "LineString",
            coordinates: [
              [-107.8801, 37.2753], // Durango
              [-107.8007, 37.4416], // Intermediate point
              [-107.7559, 37.5683], // Million Dollar Highway
              [-107.6974, 37.6788], // Intermediate point
              [-107.6653, 37.8119]  // Silverton
            ]
          }
        }
      ]
    }
  ],
  
  whyWeChoseThis: [
    "Perfect blend of biking, hiking, and rafting in one of Colorado's most dramatic mountain settings",
    "Opportunity to experience remote wilderness while having access to historic mountain towns",
    "Diverse terrain from high alpine peaks to river canyons",
    "Flexibility to adjust activities based on weather and energy levels"
  ],
  
  recommended_outfitters: [
    {
      name: "San Juan Expeditions",
      specialty: "Mountain biking and hiking guides",
      location: "Durango",
      website: "https://sanjuanexpeditions.com",
      phone: "970-555-1234",
      description: "Experienced local guides specializing in backcountry trips"
    },
    {
      name: "Mountain Waters Rafting",
      specialty: "Whitewater rafting",
      location: "Durango",
      website: "https://mountainwatersrafting.com",
      phone: "970-555-5678",
      description: "Offers trips on the Animas River for all experience levels"
    },
    {
      name: "San Juan Backcountry",
      specialty: "Bike shuttles and 4x4 support",
      location: "Silverton",
      website: "https://sanjuanbackcountry.com",
      phone: "970-555-9012",
      description: "Provides transportation and logistics for remote adventures"
    }
  ],
  
  notes: [
    "Trip can be adjusted based on weather conditions",
    "All camping needs to be at least 200 ft from water sources",
    "Bear-proof food storage required for camping"
  ],
  warnings: [
    "Weather can change rapidly at high elevations",
    "Cell service is limited outside of towns",
    "Some sections require 4-wheel drive vehicles"
  ]
};

const MapTest: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeRoute, setActiveRoute] = useState<string | null>(null);
  const routeLayersRef = useRef<Record<string, boolean>>({});

  // Map activity types to Mapbox directions profile
  const getMapboxProfile = (type: string): 'driving' | 'walking' | 'cycling' => {
    switch (type) {
      case 'biking':
      case 'cycling':
        return 'cycling';
      case 'hiking':
      case 'walking':
        return 'walking';
      default:
        return 'driving';
    }
  };

  // Get color for route based on activity type
  const getRouteColor = (type: string): string => {
    switch (type) {
      case 'biking':
      case 'cycling':
        return '#f59e0b'; // amber
      case 'hiking':
      case 'walking':
        return '#10b981'; // green
      case 'rafting':
      case 'kayaking':
        return '#3b82f6'; // blue
      case 'climbing':
        return '#ef4444'; // red
      default:
        return '#6366f1'; // indigo
    }
  };

  // Fetch directions data from API for an activity
  const fetchDirections = async (
    activity: Activity,
    profile: 'driving' | 'walking' | 'cycling'
  ) => {
    try {
      // Get start and end coordinates from the activity's route geometry
      const startCoords = activity.route_geometry.coordinates[0] as [number, number];
      const endCoords = activity.route_geometry.coordinates[activity.route_geometry.coordinates.length - 1] as [number, number];
      
      // Use our backend proxy to fetch directions
      const coordinates = `${startCoords[0]},${startCoords[1]};${endCoords[0]},${endCoords[1]}`;
      const url = `/api/directions?profile=${profile}&coordinates=${coordinates}`;
      
      console.log(`Fetching directions from: ${url}`);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        return {
          geometry: data.routes[0].geometry,
          distance: data.routes[0].distance, // in meters
          duration: data.routes[0].duration, // in seconds
          legs: data.routes[0].legs
        };
      } else {
        return null;
      }
    } catch (err) {
      console.error('Error fetching directions:', err);
      return null;
    }
  };

  // Add a route to the map
  const addRouteToMap = async (
    map: mapboxgl.Map,
    activityId: string,
    activity: Activity
  ) => {
    // First check if the route already exists - if so, just make it visible
    if (map.getSource(activityId)) {
      if (!map.getLayer(activityId)) {
        map.addLayer({
          id: activityId,
          type: 'line',
          source: activityId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
            'visibility': 'visible'
          },
          paint: {
            'line-color': getRouteColor(activity.type),
            'line-width': 5,
            'line-opacity': 0.8
          }
        });
      } else {
        map.setLayoutProperty(activityId, 'visibility', 'visible');
      }
      
      routeLayersRef.current[activityId] = true;
      return;
    }
    
    // Try to get directions from the MapBox API
    try {
      const profile = getMapboxProfile(activity.type);
      const routeData = await fetchDirections(activity, profile);
      
      if (routeData) {
        // Add the route source using the directions API data
        map.addSource(activityId, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: routeData.geometry
          }
        });
        
        // Log directions info
        console.log(`Route from ${activity.start_location} to ${activity.end_location}:`, {
          distance: `${(routeData.distance / 1609.34).toFixed(2)} miles`,
          duration: `${Math.floor(routeData.duration / 60)} minutes`
        });
      } else {
        // Fallback to using the provided route geometry
        console.log('Using provided route geometry (directions API failed)');
        map.addSource(activityId, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: activity.route_geometry
          }
        });
      }
    } catch (error) {
      console.error('Error getting directions:', error);
      // Fallback to using the provided route geometry
      map.addSource(activityId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: activity.route_geometry
        }
      });
    }
    
    // Add the route layer
    map.addLayer({
      id: activityId,
      type: 'line',
      source: activityId,
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': getRouteColor(activity.type),
        'line-width': 5,
        'line-opacity': 0.8
      }
    });
    
    routeLayersRef.current[activityId] = true;
  };
  
  // Hide a route on the map
  const hideRouteOnMap = (map: mapboxgl.Map, activityId: string) => {
    if (map.getLayer(activityId)) {
      map.setLayoutProperty(activityId, 'visibility', 'none');
      routeLayersRef.current[activityId] = false;
    }
  };
  
  // Toggle a route's visibility
  const toggleRoute = async (activityId: string, activity: Activity) => {
    const map = mapRef.current;
    if (!map) return;
    
    if (activeRoute === activityId) {
      // Hide the current active route
      hideRouteOnMap(map, activityId);
      setActiveRoute(null);
    } else {
      // If there's an active route already, hide it
      if (activeRoute && routeLayersRef.current[activeRoute]) {
        hideRouteOnMap(map, activeRoute);
      }
      
      // Show the new active route
      await addRouteToMap(map, activityId, activity);
      setActiveRoute(activityId);
      
      // If location references exist, fly to the route
      const startLocation = SAMPLE_TRIP.key_locations.find(loc => loc.id === activity.start_location);
      const endLocation = SAMPLE_TRIP.key_locations.find(loc => loc.id === activity.end_location);
      
      if (startLocation && endLocation) {
        const bounds = new mapboxgl.LngLatBounds()
          .extend(startLocation.coordinates)
          .extend(endLocation.coordinates);
        
        // Add all route coordinates to the bounds
        activity.route_geometry.coordinates.forEach(coord => {
          bounds.extend(coord as mapboxgl.LngLatLike);
        });
        
        map.fitBounds(bounds, {
          padding: 80,
          duration: 1000
        });
      }
      
      // Add a message to show what activity was selected
      console.log(`Route activated: ${activity.title} (${activity.type}) - ${activityId}`);
    }
  };

  // Initialize map when component mounts
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
        
        // Create the map
        console.log('Initializing map with container');
        const map = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: 'mapbox://styles/mapbox/outdoors-v12', // Outdoors style for hiking trips
          center: SAMPLE_TRIP.map_center,
          zoom: 8
        });
        
        mapRef.current = map;
        
        // When map is loaded, add the key location markers
        map.on('load', async () => {
          console.log('Map loaded successfully!');
          
          // Add markers for each key location
          SAMPLE_TRIP.key_locations.forEach((location) => {
            // Determine marker color based on location type
            let color: string;
            switch (location.type) {
              case 'city':
              case 'town':
                color = '#ef4444'; // red
                break;
              case 'peak':
                color = '#6366f1'; // indigo
                break;
              case 'lake':
                color = '#0ea5e9'; // blue
                break;
              case 'river':
                color = '#3b82f6'; // light blue
                break;
              case 'campsite':
                color = '#65a30d'; // lime
                break;
              case 'trailhead':
                color = '#84cc16'; // green
                break;
              case 'viewpoint':
                color = '#f59e0b'; // amber
                break;
              default:
                color = '#9333ea'; // purple
            }
            
            // Create a popup with more info
            const popup = new mapboxgl.Popup({ offset: 25 })
              .setHTML(`
                <div class="p-2">
                  <h3 class="font-bold text-lg">${location.name}</h3>
                  <div class="text-xs uppercase tracking-wide text-gray-500 mt-1 mb-2">
                    ${location.type} (${location.elevation_ft.toLocaleString()} ft)
                  </div>
                  <p class="text-sm text-gray-700">${location.description}</p>
                </div>
              `);
            
            // Create and add the marker
            new mapboxgl.Marker({ color, scale: 1.0 })
              .setLngLat(location.coordinates as [number, number])
              .setPopup(popup)
              .addTo(map);
          });
          
          // Add lodging locations
          SAMPLE_TRIP.itinerary.forEach((day) => {
            if (day.lodging) {
              const popup = new mapboxgl.Popup({ offset: 25 })
                .setHTML(`
                  <div class="p-2">
                    <h3 class="font-bold text-lg">${day.lodging.name}</h3>
                    <div class="text-xs uppercase tracking-wide text-gray-500 mt-1 mb-2">
                      Day ${day.day} Lodging (${day.lodging.type})
                    </div>
                    <p class="text-sm text-gray-700">${day.lodging.notes}</p>
                    ${day.lodging.booking_link ? `<a href="${day.lodging.booking_link}" target="_blank" class="text-xs text-blue-600 hover:underline">Booking information</a>` : ''}
                  </div>
                `);
              
              new mapboxgl.Marker({ color: '#ec4899', scale: 0.8 }) // pink for lodging
                .setLngLat(day.lodging.coordinates as [number, number])
                .setPopup(popup)
                .addTo(map);
            }
          });
          
          // Fit map to show all locations
          const bounds = new mapboxgl.LngLatBounds();
          
          // Add all key locations to bounds
          SAMPLE_TRIP.key_locations.forEach(location => {
            bounds.extend(location.coordinates as mapboxgl.LngLatLike);
          });
          
          // Add lodging locations to bounds
          SAMPLE_TRIP.itinerary.forEach(day => {
            if (day.lodging) {
              bounds.extend(day.lodging.coordinates as mapboxgl.LngLatLike);
            }
          });
          
          // Fit map to show all points with padding
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
  
  // Render the trip details and interactive elements
  return (
    <div className="container mx-auto p-4">
      {/* Trip header with basic details */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{SAMPLE_TRIP.title}</h1>
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="outline" className="bg-primary/10 text-primary">
            {SAMPLE_TRIP.region}
          </Badge>
          <Badge variant="outline" className="bg-orange-100 text-orange-700">
            {SAMPLE_TRIP.duration_days} Days
          </Badge>
          <Badge variant="outline" className="bg-blue-100 text-blue-700">
            ${SAMPLE_TRIP.price_range.min}-{SAMPLE_TRIP.price_range.max}
          </Badge>
          <Badge variant="outline" className="bg-red-100 text-red-700">
            {SAMPLE_TRIP.intensity.charAt(0).toUpperCase() + SAMPLE_TRIP.intensity.slice(1)} Intensity
          </Badge>
          <Badge variant="outline" className="bg-green-100 text-green-700">
            Best: {SAMPLE_TRIP.best_seasons.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ')}
          </Badge>
        </div>
        <p className="text-gray-700 mb-4">{SAMPLE_TRIP.description}</p>
      </div>
      
      {/* Map and sidebar layout */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        {/* Left sidebar with trip details */}
        <div className="w-full md:w-1/3 space-y-6">
          {/* Why we chose this */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Why We Chose This</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {SAMPLE_TRIP.whyWeChoseThis.map((reason, i) => (
                  <li key={i} className="flex items-start">
                    <span className="mr-2 text-primary mt-1">•</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          
          {/* Weather information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Weather</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-3">
                <h4 className="font-medium text-sm mb-1">HISTORICAL AVERAGES</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-sky-50 p-2 rounded">
                    <div className="text-xs text-gray-500">High</div>
                    <div className="font-medium">{SAMPLE_TRIP.weather.historical.avg_high_f}°F</div>
                  </div>
                  <div className="bg-blue-50 p-2 rounded">
                    <div className="text-xs text-gray-500">Low</div>
                    <div className="font-medium">{SAMPLE_TRIP.weather.historical.avg_low_f}°F</div>
                  </div>
                  <div className="bg-blue-50 p-2 rounded">
                    <div className="text-xs text-gray-500">Precipitation</div>
                    <div className="font-medium">{SAMPLE_TRIP.weather.historical.avg_precipitation_inches}" avg</div>
                  </div>
                  <div className="bg-sky-50 p-2 rounded">
                    <div className="text-xs text-gray-500">Conditions</div>
                    <div className="font-medium text-xs">{SAMPLE_TRIP.weather.historical.typical_conditions[0]}</div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-sm mb-1">CURRENT FORECAST</h4>
                <div className="text-xs text-gray-500 mb-2">From {SAMPLE_TRIP.weather.current_forecast.source}</div>
                <div className="space-y-2">
                  {SAMPLE_TRIP.weather.current_forecast.daily.map((day, i) => (
                    <div key={i} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                      <div>
                        <div className="font-medium">{new Date(day.date).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}</div>
                        <div className="text-xs">{day.conditions}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{day.high_f}°F / {day.low_f}°F</div>
                        <div className="text-xs">{day.precipitation_chance}% precip.</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Recommended outfitters */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Recommended Outfitters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {SAMPLE_TRIP.recommended_outfitters.map((outfitter, i) => (
                  <div key={i} className="border-b pb-3 last:border-0">
                    <div className="font-medium">{outfitter.name}</div>
                    <div className="text-sm text-gray-600 mb-1">{outfitter.specialty} - {outfitter.location}</div>
                    <div className="text-xs text-blue-600 mb-1">
                      <a href={outfitter.website} target="_blank" rel="noopener noreferrer">{outfitter.website.replace('https://', '')}</a>
                    </div>
                    <div className="text-xs">{outfitter.phone}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Center map container */}
        <div className="w-full md:w-2/3 order-first md:order-none">
          {loading && (
            <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p>Loading map and trip data...</p>
              </div>
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
            className="w-full h-[60vh] border rounded shadow-md mb-4"
            style={{ minHeight: '500px' }}
          />
          
          {/* Itinerary with clickable activities */}
          <h2 className="font-bold text-xl mb-3 mt-6">Day-by-Day Itinerary</h2>
          <p className="text-sm text-gray-500 mb-4">Click on any activity to see its route on the map</p>
          
          <div className="space-y-6">
            {SAMPLE_TRIP.itinerary.map((day) => (
              <Card key={day.day} className={activeRoute && activeRoute.startsWith(`day${day.day}`) ? 'border-primary' : ''}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex justify-between">
                    <span>Day {day.day}: {day.title}</span>
                    <Badge variant="outline" className="ml-2">
                      {day.lodging.type.charAt(0).toUpperCase() + day.lodging.type.slice(1)}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-gray-700">{day.description}</p>
                  
                  <div className="space-y-3">
                    {day.activities.map((activity) => (
                      <div 
                        key={activity.id} 
                        className={`border rounded p-3 cursor-pointer transition-colors ${activeRoute === activity.id ? 'bg-primary/10 border-primary' : 'hover:bg-gray-50'}`}
                        onClick={() => toggleRoute(activity.id, activity)}
                      >
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium">{activity.title}</h4>
                          <Badge className="ml-2" variant={activeRoute === activity.id ? "default" : "outline"}>
                            {activity.difficulty.charAt(0).toUpperCase() + activity.difficulty.slice(1)}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
                          <div>
                            <div className="text-xs text-gray-500">Distance</div>
                            <div>{activity.route_details.distance_miles} miles</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Elevation Gain</div>
                            <div>{activity.route_details.elevation_gain_ft.toLocaleString()} ft</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Duration</div>
                            <div>{activity.duration_hours} hrs</div>
                          </div>
                        </div>
                        
                        {/* Only show expanded details when active */}
                        {activeRoute === activity.id && (
                          <div className="mt-3 pt-3 border-t">
                            {activity.highlights.length > 0 && (
                              <div className="mb-2">
                                <div className="text-xs text-green-600 font-medium mb-1">HIGHLIGHTS</div>
                                <div className="flex flex-wrap gap-1">
                                  {activity.highlights.map((h, i) => (
                                    <span key={i} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">{h}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {activity.hazards.length > 0 && (
                              <div className="mb-2">
                                <div className="text-xs text-red-600 font-medium mb-1">HAZARDS</div>
                                <div className="flex flex-wrap gap-1">
                                  {activity.hazards.map((h, i) => (
                                    <span key={i} className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded-full">{h}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            <div className="text-xs text-gray-600 mt-2">
                              <div><span className="font-medium">Type:</span> {activity.route_details.route_type.replace(/_/g, ' ')}</div>
                              <div><span className="font-medium">Terrain:</span> {activity.route_details.terrain}</div>
                              <div><span className="font-medium">High Point:</span> {activity.route_details.high_point_ft.toLocaleString()} ft</div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex items-start">
                      <div className="bg-pink-100 p-1 rounded mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-pink-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium text-sm">{day.lodging.name}</div>
                        <div className="text-xs text-gray-600">{day.lodging.location}</div>
                        {day.lodging.booking_link && (
                          <a href={day.lodging.booking_link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                            View booking information
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
      
      {/* Notes and warnings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Important Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {SAMPLE_TRIP.notes.map((note, i) => (
                <li key={i} className="flex items-start">
                  <span className="mr-2 text-primary mt-1">•</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-red-600">Warnings</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {SAMPLE_TRIP.warnings.map((warning, i) => (
                <li key={i} className="flex items-start">
                  <span className="mr-2 text-red-600 mt-1">⚠</span>
                  <span>{warning}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MapTest;