import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { JourneyMapProps, SegmentOption } from '@/types/trip';

// Environment variable is injected at build time
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

const JourneyMap: React.FC<JourneyMapProps> = ({
  mapId,
  center,
  zoom,
  markers,
  journey,
  selectedSegment,
  onSegmentChange,
  isExpanded,
  toggleExpand
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [segmentOptions, setSegmentOptions] = useState<SegmentOption[]>([]);
  const [activityOptions, setActivityOptions] = useState<{ type: string; duration: string }[]>([]);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    
    // Set Mapbox access token
    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    try {
      // Create map instance
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/outdoors-v11',
        center,
        zoom,
      });
      
      mapRef.current = map;
      
      // Add navigation control
      map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    } catch (error) {
      console.error('Error initializing map:', error);
    }
    
    // Cleanup function
    return () => {
      try {
        // Clear markers
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];
        
        // Remove map
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }
      } catch (error) {
        console.error('Error cleaning up map:', error);
      }
    };
  }, [mapId, center, zoom]);

  // Create segment options
  useEffect(() => {
    try {
      if (!journey || !journey.segments) return;
      
      // Create segment options
      const options = journey.segments.map((segment, index) => ({
        id: `segment${index + 1}`,
        label: `${segment.from} to ${segment.to} (${segment.mode})`,
        mode: segment.mode,
        from: segment.from,
        to: segment.to
      }));
      setSegmentOptions(options);
      
      // Get unique activity types
      const activities: Record<string, number> = {};
      journey.segments.forEach(segment => {
        const type = segment.mode.charAt(0).toUpperCase() + segment.mode.slice(1);
        activities[type] = (activities[type] || 0) + Math.round(segment.duration / 3600);
      });
      
      setActivityOptions(
        Object.entries(activities).map(([type, duration]) => ({
          type,
          duration: `${duration} ${duration === 1 ? 'hour' : 'hours'}`
        }))
      );
    } catch (error) {
      console.error('Error creating segment options:', error);
    }
  }, [journey]);

  // Add route and markers when map is loaded
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    
    const handleMapLoad = () => {
      try {
        // Clear existing markers
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];
        
        // Add markers
        if (markers && markers.length) {
          const newMarkers = markers.map(marker => {
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
            
            return new mapboxgl.Marker({ element: el })
              .setLngLat(marker.coordinates)
              .setPopup(new mapboxgl.Popup().setHTML(`<h3 class="text-sm font-medium">${marker.name}</h3>`))
              .addTo(map);
          });
          
          markersRef.current = newMarkers;
        }
        
        // Add route source and layer
        if (journey && journey.segments && journey.segments.length) {
          const coordinates = journey.segments.flatMap(segment => 
            segment.geometry.coordinates
          );
          
          // If source already exists, update it
          if (map.getSource('route')) {
            (map.getSource('route') as mapboxgl.GeoJSONSource).setData({
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates
              }
            });
          } else {
            // Otherwise create new source and layer
            map.addSource('route', {
              type: 'geojson',
              data: {
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'LineString',
                  coordinates
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
          }
          
          // Fit bounds if journey has bounds
          if (journey.bounds && journey.bounds.length === 2) {
            map.fitBounds(journey.bounds as [[number, number], [number, number]], {
              padding: { top: 50, bottom: 50, left: 50, right: 50 }
            });
          }
        }
      } catch (error) {
        console.error('Error setting up map:', error);
      }
    };
    
    // Check if map is loaded
    if (map.loaded()) {
      handleMapLoad();
    } else {
      map.on('load', handleMapLoad);
    }
    
    // Cleanup for this effect
    return () => {
      map.off('load', handleMapLoad);
    };
  }, [journey, markers]);

  // Highlight selected segment
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.loaded() || !selectedSegment || !journey || !journey.segments) return;
    
    try {
      const segmentIndex = parseInt(selectedSegment.replace('segment', '')) - 1;
      if (segmentIndex < 0 || segmentIndex >= journey.segments.length) return;
      
      const segment = journey.segments[segmentIndex];
      
      // Wait for the map to load
      const highlightSegment = () => {
        // Remove existing layer if it exists
        if (map.getLayer('selected-segment')) {
          map.removeLayer('selected-segment');
        }
        
        // Update or create source
        if (map.getSource('selected-segment')) {
          (map.getSource('selected-segment') as mapboxgl.GeoJSONSource).setData({
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: segment.geometry.coordinates
            }
          });
        } else {
          map.addSource('selected-segment', {
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
        }
        
        // Add the highlight layer
        map.addLayer({
          id: 'selected-segment',
          type: 'line',
          source: 'selected-segment',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#ec4899',
            'line-width': 6,
            'line-opacity': 0.8
          }
        });
      };
      
      if (map.loaded() && map.isStyleLoaded()) {
        highlightSegment();
      } else {
        map.once('load', highlightSegment);
      }
    } catch (error) {
      console.error('Error highlighting segment:', error);
    }
  }, [selectedSegment, journey]);

  // Handle segment change
  const handleSegmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onSegmentChange) {
      onSegmentChange(e.target.value);
    }
  };

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
      
      {/* Journey Dropdown */}
      <div className="mb-4 relative">
        <label htmlFor={`journeySegment-${mapId}`} className="block text-sm font-medium text-gray-700 mb-1">
          Journey Segments
        </label>
        <select 
          id={`journeySegment-${mapId}`} 
          className="w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 pl-3 pr-10 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          value={selectedSegment}
          onChange={handleSegmentChange}
        >
          {segmentOptions.map(option => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      
      {/* Activities Dropdown */}
      <div className="mb-4 relative">
        <label htmlFor={`activityType-${mapId}`} className="block text-sm font-medium text-gray-700 mb-1">
          Activity Types
        </label>
        <select 
          id={`activityType-${mapId}`} 
          className="w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 pl-3 pr-10 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
        >
          {activityOptions.map((option, index) => (
            <option key={index} value={option.type.toLowerCase()}>
              {option.type} ({option.duration})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default JourneyMap;
