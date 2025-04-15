import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { JourneyMapProps } from '@/types/trip';

// Interactive map implementation using iframe as fallback
const JourneyMap: React.FC<JourneyMapProps> = ({
  mapId,
  center,
  markers,
  journey,
  isExpanded,
  toggleExpand
}) => {
  const [useIframe, setUseIframe] = useState(false);
  const [mapboxToken, setMapboxToken] = useState('');
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  
  // Fetch the MapBox token first
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await fetch('/api/config');
        const data = await response.json();
        const token = data.mapboxToken;
        
        if (token) {
          setMapboxToken(token);
          mapboxgl.accessToken = token;
        } else {
          console.error('MapBox token is not available');
          setUseIframe(true);
        }
      } catch (error) {
        console.error('Error fetching MapBox token:', error);
        setUseIframe(true);
      }
    };
    
    fetchToken();
  }, []);
  
  // Initialize the map when we have the token
  useEffect(() => {
    if (!mapboxToken || !mapContainerRef.current || useIframe) {
      return;
    }
    
    try {
      // Initialize the map - cast the container ref to avoid type issues
      const map = new mapboxgl.Map({
        container: mapContainerRef.current as HTMLElement,
        style: 'mapbox://styles/mapbox/streets-v12', // Use a standard style
        center: center,
        zoom: 9
      });
      
      mapRef.current = map;
      
      // Add controls
      map.addControl(new mapboxgl.NavigationControl());
      
      // Configure the map on load
      map.on('load', () => {
        console.log('Map loaded successfully');
        
        // Add markers
        markers.forEach(marker => {
          const el = document.createElement('div');
          el.className = 'marker';
          el.style.backgroundColor = '#7c3aed';
          el.style.width = '20px';
          el.style.height = '20px';
          el.style.borderRadius = '50%';
          el.style.border = '2px solid white';
          
          new mapboxgl.Marker(el)
            .setLngLat(marker.coordinates)
            .setPopup(new mapboxgl.Popup().setHTML(`<h3>${marker.name}</h3>`))
            .addTo(map);
        });
        
        // Draw route line
        if (markers.length >= 2) {
          try {
            map.addSource('route', {
              type: 'geojson',
              data: {
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'LineString',
                  coordinates: markers.map(marker => marker.coordinates)
                }
              }
            });
            
            map.addLayer({
              id: 'route',
              type: 'line',
              source: 'route',
              layout: {
                'line-join': 'round',
                'line-cap': 'round'
              },
              paint: {
                'line-color': '#7c3aed',
                'line-width': 4
              }
            });
          } catch (error) {
            console.error('Error adding route:', error);
          }
        }
        
        // Fit bounds to show all markers
        if (markers.length > 0) {
          const bounds = new mapboxgl.LngLatBounds();
          markers.forEach(marker => bounds.extend(marker.coordinates));
          map.fitBounds(bounds, { padding: 50 });
        }
      });
      
      map.on('error', (e) => {
        console.error('MapBox error:', e);
        setUseIframe(true);
      });
      
    } catch (error) {
      console.error('Error creating MapBox map:', error);
      setUseIframe(true);
    }
    
    // Clean up
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [mapboxToken, center, markers, useIframe]);
  
  return (
    <div className="border-t border-gray-200 pt-3 pb-1">
      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
        </svg>
        Journey Map
      </h4>
      
      {/* MapBox GL JS container */}
      {!useIframe && (
        <div 
          ref={mapContainerRef}
          className={`map-container mb-3 transition-all duration-300 ease-in-out ${isExpanded ? 'h-[550px]' : 'h-[300px]'}`}
          onClick={toggleExpand}
        />
      )}
      
      {/* Fallback iframe solution */}
      {useIframe && mapboxToken && (
        <iframe 
          width="100%" 
          height={isExpanded ? '550' : '300'} 
          src={`https://api.mapbox.com/styles/v1/mapbox/streets-v12.html?title=false&access_token=${mapboxToken}&zoomwheel=false#9/${center[1]}/${center[0]}`}
          title="Trip Map" 
          className="border-none rounded-md mb-3"
        />
      )}
      
      {/* Loading state */}
      {!mapboxToken && !useIframe && (
        <div className={`flex items-center justify-center bg-gray-100 rounded-md mb-3 ${isExpanded ? 'h-[550px]' : 'h-[300px]'}`}>
          <p>Loading map...</p>
        </div>
      )}
      
      <div className="p-3 bg-gray-50 rounded-lg text-sm">
        <p className="mb-1 font-medium">Map Instructions:</p>
        <p>• Click on the map to expand/collapse it</p>
        <p>• Purple route line shows your journey path</p>
        <p>• Map markers show all your destinations</p>
        <p>• Total distance: {(journey.totalDistance * 0.621371).toFixed(1)} miles</p>
      </div>
      
      {/* Display journey details */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="bg-gray-50 p-2 rounded-lg">
          <div className="text-xs text-gray-500">Trip Duration</div>
          <div className="font-medium">{Math.round(journey.totalDuration / 3600)} hours</div>
        </div>
        <div className="bg-gray-50 p-2 rounded-lg">
          <div className="text-xs text-gray-500">Travel Mode</div>
          <div className="font-medium capitalize">
            {journey.segments[0]?.mode || 'Mixed'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JourneyMap;
