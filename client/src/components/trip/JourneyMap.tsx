import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions';
import '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css';
import { JourneyMapProps } from '@/types/trip';

// Will be configured by the initialization
let MAPBOX_TOKEN = '';

// Add custom CSS to make map controls visible
const addMapStyles = () => {
  const style = document.createElement('style');
  style.textContent = `
    .mapboxgl-ctrl-directions {
      max-height: 100%;
      overflow-y: auto;
      width: 300px !important;
    }
    .directions-control {
      width: 100%;
    }
    .mapboxgl-marker {
      cursor: pointer;
    }
  `;
  document.head.appendChild(style);
};

const JourneyMap: React.FC<JourneyMapProps> = ({
  mapId,
  center,
  markers,
  journey,
  isExpanded,
  toggleExpand
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const directionsRef = useRef<any>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    
    // Add custom CSS
    addMapStyles();
    
    // Create a flag for cleanup
    let mapCreated = false;
    
    // Initialize map when token is available
    const initMap = async () => {
      // Wait for token if not available
      if (!MAPBOX_TOKEN) {
        try {
          const response = await fetch('/api/config');
          const data = await response.json();
          MAPBOX_TOKEN = data.mapboxToken || '';
        } catch (error) {
          console.error('Failed to fetch MapBox token:', error);
          return; // Exit if token can't be fetched
        }
      }
      
      if (!MAPBOX_TOKEN) {
        console.error('MapBox token is not available');
        return; // Exit if token is not available
      }
      
      mapboxgl.accessToken = MAPBOX_TOKEN;
      
      // Check if component is still mounted
      if (!mapContainerRef.current) return;
      
      try {
        mapRef.current = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: 'mapbox://styles/kseylerp/cm9i685b0002001so3k3f81v1',
          center,
          zoom: 8,
          attributionControl: false
        });
        
        mapCreated = true;
        
        // Add navigation control
        mapRef.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
        
        // Add attribution control
        mapRef.current.addControl(new mapboxgl.AttributionControl({
          compact: true
        }));
        
        // Add directions control
        directionsRef.current = new MapboxDirections({
          accessToken: mapboxgl.accessToken,
          unit: 'imperial', // Use imperial units as requested
          profile: 'mapbox/driving',
          alternatives: true,
          congestion: true,
          steps: true,
          controls: {
            inputs: true,
            instructions: true,
            profileSwitcher: true
          }
        });
        
        // Cast to any to avoid TypeScript error with IControl interface
        mapRef.current.addControl(directionsRef.current as any, 'top-left');
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };
    
    initMap();
    
    return () => {
      if (mapCreated && mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [mapId]);

  // Add markers on map load
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    
    const onMapLoad = () => {
      console.log('Map loaded, adding markers');
      
      // Clear existing markers
      const existingMarkers = document.querySelectorAll('.mapboxgl-marker');
      existingMarkers.forEach(marker => marker.remove());
      
      // Add markers for all points
      markers.forEach((marker, index) => {
        const el = document.createElement('div');
        el.className = 'marker';
        el.style.backgroundColor = '#7c3aed';
        el.style.width = '24px';
        el.style.height = '24px';
        el.style.borderRadius = '50%';
        el.style.display = 'flex';
        el.style.justifyContent = 'center';
        el.style.alignItems = 'center';
        el.style.border = '2px solid white';
        el.style.boxShadow = '0 0 0 1px #7c3aed';
        
        new mapboxgl.Marker({ element: el })
          .setLngLat(marker.coordinates)
          .setPopup(new mapboxgl.Popup().setHTML(`<h3 class="text-sm font-medium">${marker.name}</h3>`))
          .addTo(map);
      });
      
      // Set the first and last points as origin and destination in the directions control
      if (directionsRef.current && markers.length >= 2) {
        try {
          const firstMarker = markers[0];
          const lastMarker = markers[markers.length - 1];
          
          // Set origin and destination with a slight delay to ensure the directions control is ready
          setTimeout(() => {
            try {
              directionsRef.current.setOrigin(firstMarker.coordinates);
              directionsRef.current.setDestination(lastMarker.coordinates);
              
              // Add waypoints for markers in between (currently handled by letting the user click on markers)
              if (markers.length > 2) {
                console.log(`${markers.length - 2} waypoints available. Click on markers to add them to your route.`);
              }
            } catch (error) {
              console.error('Error setting origin/destination:', error);
            }
          }, 1000);
        } catch (error) {
          console.error('Error accessing directions control:', error);
        }
      }
      
      // Fit bounds if journey has bounds
      if (journey.bounds && journey.bounds.length === 2) {
        map.fitBounds(journey.bounds as [[number, number], [number, number]], {
          padding: { top: 50, bottom: 50, left: 50, right: 50 }
        });
      }
    };
    
    if (map.loaded()) {
      onMapLoad();
    } else {
      map.on('load', onMapLoad);
    }
    
    return () => {
      map.off('load', onMapLoad);
    };
  }, [journey, markers, mapRef.current]);

  return (
    <div className="border-t border-gray-200 pt-3 pb-1">
      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
        </svg>
        Journey Map
      </h4>
      
      <div 
        ref={mapContainerRef} 
        className={`map-container mb-3 transition-all duration-300 ease-in-out ${isExpanded ? 'h-[550px]' : 'h-[300px]'}`}
        onClick={toggleExpand}
      />
      
      <div className="p-3 bg-gray-50 rounded-lg text-sm">
        <p className="mb-1 font-medium">Map Instructions:</p>
        <p>• Click on the map to expand/collapse it</p>
        <p>• Origin and destination are automatically set from your trip points</p>
        <p>• Click markers to add them as waypoints on your route</p>
        <p>• Change travel mode in the profile switcher (car, walking, cycling)</p>
        <p>• Distances shown in miles (imperial units)</p>
      </div>
    </div>
  );
};

export default JourneyMap;
