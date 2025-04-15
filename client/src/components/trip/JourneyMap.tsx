import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Journey, Marker } from '@/types/chat';

interface JourneyMapProps {
  mapId: string;
  center: [number, number];
  markers: Marker[];
  journey: Journey;
  isExpanded: boolean;
  toggleExpand: () => void;
}

const JourneyMap: React.FC<JourneyMapProps> = ({
  mapId,
  center,
  markers,
  journey,
  isExpanded,
  toggleExpand
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [routesLoaded, setRoutesLoaded] = useState<number>(0);

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
      for (let i = 0; i < journey.segments.length; i++) {
        const segment = journey.segments[i];
        
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
            
            // Make sure the geometry is properly typed for GeoJSON
            const geoJSONGeometry = {
              type: 'LineString' as const,
              coordinates: segment.geometry.coordinates
            };
            
            initialMap.addSource(`route-${i}`, {
              type: 'geojson',
              data: {
                type: 'Feature',
                properties: {},
                geometry: geoJSONGeometry
              }
            });
            
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

      // Add markers for points of interest
      markers.forEach(marker => {
        new mapboxgl.Marker()
          .setLngLat(marker.coordinates)
          .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`<h3>${marker.name}</h3>`))
          .addTo(initialMap);
      });

      // Fit map to show the entire journey
      if (journey.bounds && journey.bounds.length === 2) {
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
    <div className="relative border rounded-lg overflow-hidden shadow-md">
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
            {routesLoaded > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                Routes loaded: {routesLoaded}/{journey.segments.length}
              </p>
            )}
          </div>
        </div>
      )}
      
      <div 
        ref={mapContainer} 
        className={`w-full transition-all duration-300 ease-in-out ${isExpanded ? 'h-96' : 'h-64'}`}
        style={{ minHeight: isExpanded ? '24rem' : '16rem' }}
      />
      
      <button 
        onClick={toggleExpand}
        className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors"
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
  );
};

export default JourneyMap;