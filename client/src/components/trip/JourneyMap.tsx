import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Journey, Marker } from '@/types/chat';
import { useIsMobile } from '@/hooks/use-mobile';

interface JourneyMapProps {
  mapId: string; // This is actually the trip ID prefixed with "map-"
  center: [number, number];
  markers: Marker[];
  journey: Journey;
  isExpanded: boolean;
  toggleExpand: () => void;
  focusedActivity?: string;
  highlightedActivity?: string;
}

const JourneyMap: React.FC<JourneyMapProps> = ({
  mapId,
  center,
  markers,
  journey,
  isExpanded,
  toggleExpand,
  focusedActivity,
  highlightedActivity
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [routesLoaded, setRoutesLoaded] = useState<number>(0);

  // Calculate distance from segment data
  const calculateTotalDistance = (): string => {
    if (!journey?.segments || journey.segments.length === 0) {
      return '0.0';
    }

    let totalMeters = 0;
    journey.segments.forEach(segment => {
      if (segment.distance) {
        totalMeters += segment.distance;
      }
    });

    // Convert to miles (1 meter = 0.000621371 miles)
    return totalMeters > 0 ? (totalMeters * 0.000621371).toFixed(1) : '0.0';
  };
  
  // Function to fly to a specific coordinate with animation
  const flyToLocation = (coords: [number, number] | [number, number][], zoom = 12) => {
    if (!map.current) return;
    
    // If it's an array of coordinates, use the first one
    const targetCoords = Array.isArray(coords[0]) 
      ? (coords as [number, number][])[0] 
      : coords as [number, number];
    
    map.current.flyTo({
      center: targetCoords,
      zoom: zoom,
      pitch: 60, // Tilt view for better perspective
      bearing: 0,
      essential: true,
      duration: 2000 // Animation duration in milliseconds
    });
  };
  
  // Extract coordinates from an activity name if it corresponds to a segment
  const getCoordinatesForActivity = (activityName: string): [number, number][] | null => {
    if (!journey?.segments || !activityName) return null;
    
    // Try to match the activity name with a segment's from or to location
    const matchedSegment = journey.segments.find(segment => {
      const activityLower = activityName.toLowerCase();
      return (
        segment.from.toLowerCase().includes(activityLower) || 
        segment.to.toLowerCase().includes(activityLower) ||
        activityLower.includes(segment.from.toLowerCase()) || 
        activityLower.includes(segment.to.toLowerCase())
      );
    });
    
    if (matchedSegment && matchedSegment.geometry && matchedSegment.geometry.coordinates) {
      return matchedSegment.geometry.coordinates as [number, number][];
    }
    
    return null;
  };

  // Fetch MapBox token on component mount
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await fetch('/api/config');
        const data = await response.json();
        if (data.mapboxToken) {
          setMapboxToken(data.mapboxToken);
        } else {
          setError('No MapBox token available');
          setLoading(false);
        }
      } catch (err) {
        setError('Failed to fetch MapBox token');
        setLoading(false);
        console.error('Error fetching token:', err);
      }
    };

    fetchToken();
  }, []);

  // Fetch directions data from API for a segment
  const fetchDirections = async (
    start: [number, number],
    end: [number, number],
    profile: 'driving' | 'walking' | 'cycling'
  ) => {
    try {
      // Use our backend proxy to fetch directions
      const coordinates = `${start[0]},${start[1]};${end[0]},${end[1]}`;
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

  // Add a source and layer for a route to the map
  const addRouteToMap = (
    mapInstance: mapboxgl.Map,
    routeData: any,
    segmentId: string,
    mode: string
  ) => {
    // Choose color based on mode of transport
    const color = 
      mode === 'walking' ? '#10b981' : // green
      mode === 'driving' ? '#3b82f6' : // blue
      mode === 'cycling' ? '#f59e0b' : // amber
      '#6366f1'; // indigo (default)
    
    // Add a source for the route
    mapInstance.addSource(segmentId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: routeData.geometry
      }
    });
    
    // Add a layer to display the route
    mapInstance.addLayer({
      id: segmentId,
      type: 'line',
      source: segmentId,
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': color,
        'line-width': 5,
        'line-opacity': 0.75
      }
    });
    
    console.log(`Route ${segmentId} added to map (${mode})`);
  };

  // Initialize map when token is available and component is mounted
  useEffect(() => {
    if (!mapboxToken || !mapContainer.current) return;

    mapboxgl.accessToken = mapboxToken;
    setLoading(true);

    const initialMap = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/outdoors-v12',
      center: center,
      zoom: 9
    });

    map.current = initialMap;

    initialMap.on('load', async () => {
      console.log('Map loaded successfully!');
      
      // Process each journey segment to get real route data
      if (journey && journey.segments && journey.segments.length > 0) {
        for (let i = 0; i < journey.segments.length; i++) {
          const segment = journey.segments[i];
          
          // Skip if segment or geometry is missing
          if (!segment || !segment.geometry || !segment.geometry.coordinates || segment.geometry.coordinates.length < 2) {
            console.warn(`Skipping segment ${i} due to missing geometry data`);
            continue;
          }
          
          try {
            // Extract start and end points
            const segmentStartCoords = segment.geometry.coordinates[0] as [number, number];
            const segmentEndCoords = segment.geometry.coordinates[segment.geometry.coordinates.length - 1] as [number, number];
            
            // For each segment, fetch directions data from MapBox API via our proxy
            const routeData = await fetchDirections(
              segmentStartCoords,
              segmentEndCoords,
              segment.mode as 'driving' | 'walking' | 'cycling'
            );
            
            if (routeData) {
              // Add the route to the map
              addRouteToMap(initialMap, routeData, `route-${i}`, segment.mode);
              setRoutesLoaded(prev => prev + 1);
              
              // Log the route info
              console.log(`Segment ${i} (${segment.mode}):`, {
                from: segment.from,
                to: segment.to,
                distance: `${(routeData.distance / 1609.34).toFixed(2)} miles`,
                duration: `${Math.floor(routeData.duration / 60)} minutes`
              });
            } else {
              // If directions API fails, fall back to using the provided geometry
              console.warn(`Using provided geometry for segment ${i} (${segment.mode})`);
              
              // Add source with the geometry from the segment
              initialMap.addSource(`route-${i}`, {
                type: 'geojson',
                data: {
                  type: 'Feature',
                  properties: {},
                  geometry: {
                    type: 'LineString',
                    coordinates: segment.geometry.coordinates
                  }
                }
              });
              
              // Add layer for this source
              initialMap.addLayer({
                id: `route-${i}`,
                type: 'line',
                source: `route-${i}`,
                layout: {
                  'line-join': 'round',
                  'line-cap': 'round'
                },
                paint: {
                  'line-color': segment.mode === 'walking' ? '#10b981' : 
                                segment.mode === 'driving' ? '#3b82f6' : 
                                segment.mode === 'cycling' ? '#f59e0b' : 
                                '#6366f1',
                  'line-width': 5,
                  'line-opacity': 0.75
                }
              });
              
              setRoutesLoaded(prev => prev + 1);
            }
          } catch (err) {
            console.error(`Error processing segment ${i}:`, err);
          }
        }
      }

      // Add markers for points of interest with different colors
      markers.forEach((marker, index) => {
        // Determine marker color based on its position in the array
        let color = '#3b82f6'; // Default blue for waypoints
        
        // Starting point is green, ending point is red, others are blue or custom
        if (index === 0) color = '#22c55e'; // Green for starting point
        else if (index === markers.length - 1) color = '#ef4444'; // Red for final destination
        
        // Create a detailed popup with information
        const popup = new mapboxgl.Popup({ offset: 25 })
          .setHTML(`
            <div class="p-2">
              <h3 class="font-bold">${marker.name}</h3>
              <p class="text-gray-600 text-sm">${index === 0 ? 'Starting Point' : 
                index === markers.length - 1 ? 'Final Destination' : 'Waypoint'}</p>
            </div>
          `);
        
        // Create and add the marker to the map
        new mapboxgl.Marker({ color })
          .setLngLat(marker.coordinates)
          .setPopup(popup)
          .addTo(initialMap);
      });

      // Fit map to show the entire journey
      if (journey?.bounds && journey.bounds.length === 2) {
        initialMap.fitBounds(journey.bounds as mapboxgl.LngLatBoundsLike, {
          padding: 50
        });
      }
      
      setLoading(false);
    });

    // Clean up on unmount
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [mapboxToken, center, markers, journey]);

  return (
    <div className="relative border rounded-lg overflow-hidden shadow-md h-full">
      {error && (
        <div className="p-4 bg-red-100 text-red-700">
          <p>{error}</p>
        </div>
      )}
      
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-gray-700">Loading map data...</p>
            {routesLoaded > 0 && journey?.segments && (
              <p className="text-xs text-gray-500 mt-1">
                Routes loaded: {routesLoaded}/{journey.segments.length}
              </p>
            )}
          </div>
        </div>
      )}
      
      <div 
        ref={mapContainer} 
        className="w-full aspect-square md:aspect-auto md:h-full min-h-[300px]"
      />
      
      {/* Map controls in the bottom right corner */}
      <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
        <button 
          onClick={toggleExpand}
          className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors"
          aria-label={isExpanded ? "Collapse map" : "Expand map"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {isExpanded ? (
              <>
                <polyline points="4 14 10 14 10 20"></polyline>
                <polyline points="20 10 14 10 14 4"></polyline>
                <line x1="14" y1="10" x2="21" y2="3"></line>
                <line x1="3" y1="21" x2="10" y2="14"></line>
              </>
            ) : (
              <>
                <polyline points="15 3 21 3 21 9"></polyline>
                <polyline points="9 21 3 21 3 15"></polyline>
                <line x1="21" y1="3" x2="14" y2="10"></line>
                <line x1="3" y1="21" x2="10" y2="14"></line>
              </>
            )}
          </svg>
        </button>
      </div>
      
      {/* Full map view button in top left */}
      <div className="absolute top-4 left-4 z-10">
        <a 
          href={`/map?id=${mapId.replace('map-', '')}`}
          className="bg-white px-3 py-2 rounded shadow-md hover:bg-gray-100 transition-colors text-xs font-medium text-blue-700 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6-3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          Full Map
        </a>
      </div>
      
      {/* Map info on bottom left */}
      {!loading && journey && journey.segments && (
        <div className="absolute bottom-4 left-4 bg-white px-3 py-2 rounded shadow-md text-xs z-10">
          <div className="font-medium text-sm mb-1">{journey.segments.length} Route Segment{journey.segments.length !== 1 ? 's' : ''}</div>
          <div className="text-gray-600">
            {calculateTotalDistance()} miles
          </div>
        </div>
      )}
    </div>
  );
};

export default JourneyMap;