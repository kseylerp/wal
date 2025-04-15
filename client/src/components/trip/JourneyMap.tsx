import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { JourneyMapProps, SegmentOption } from '@/types/trip';

// Will be configured by the initialization
let MAPBOX_TOKEN = '';

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
  const [segmentOptions, setSegmentOptions] = useState<SegmentOption[]>([]);
  const [activityOptions, setActivityOptions] = useState<{ type: string; duration: string }[]>([]);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    
    // Create a flag for cleanup
    let mapCreated = false;
    
    // Initialize map when token is available
    const initMap = async () => {
      try {
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
        
        // Create map with error handling
        const map = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: 'mapbox://styles/mapbox/outdoors-v11',
          center,
          zoom,
        });
        
        // Wait for map to load before assigning to ref
        map.on('load', () => {
          mapRef.current = map;
          mapCreated = true;
          
          // Add navigation control
          map.addControl(new mapboxgl.NavigationControl(), 'top-right');
          
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
            activities[type] = (activities[type] || 0) + Math.round(segment.duration / 3600); // Convert seconds to hours
          });
          
          setActivityOptions(
            Object.entries(activities).map(([type, duration]) => ({
              type,
              duration: `${duration} ${duration === 1 ? 'hour' : 'hours'}`
            }))
          );
        
          // Add route source and layer
          map.addSource('route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: journey.segments.flatMap(segment => 
                  segment.geometry.coordinates
                )
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
              'line-color': '#7c3aed', // Primary color
              'line-width': 4
            }
          });
          
          // Add markers
          markers.forEach(marker => {
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
    
          // Fit bounds if journey has bounds
          if (journey.bounds && journey.bounds.length === 2) {
            map.fitBounds(journey.bounds as [[number, number], [number, number]], {
              padding: { top: 50, bottom: 50, left: 50, right: 50 }
            });
          }
        });
        
        // Add error handling
        map.on('error', (e) => {
          console.error('MapBox error:', e.error);
        });
        
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };
    
    initMap();
    
    return () => {
      try {
        if (mapCreated && mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }
      } catch (e) {
        console.error('Error cleaning up map:', e);
      }
    };
  }, [mapId, journey, markers]);



  // Highlight selected segment
  useEffect(() => {
    if (!mapRef.current || !selectedSegment) return;

    const segmentIndex = parseInt(selectedSegment.replace('segment', '')) - 1;
    if (segmentIndex < 0 || segmentIndex >= journey.segments.length) return;

    const segment = journey.segments[segmentIndex];
    
    if (mapRef.current.getLayer('selected-segment')) {
      mapRef.current.removeLayer('selected-segment');
    }
    
    if (mapRef.current.getSource('selected-segment')) {
      (mapRef.current.getSource('selected-segment') as mapboxgl.GeoJSONSource).setData({
        type: 'Feature',
        properties: {},
        geometry: segment.geometry as any
      });
    } else {
      mapRef.current.addSource('selected-segment', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: segment.geometry as any
        }
      });
    }

    mapRef.current.addLayer({
      id: 'selected-segment',
      type: 'line',
      source: 'selected-segment',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#ec4899', // Highlight color
        'line-width': 6,
        'line-opacity': 0.8
      }
    });

    // Fly to the segment
    const coordinates = segment.geometry.coordinates;
    if (coordinates.length > 0) {
      mapRef.current.flyTo({
        center: coordinates[Math.floor(coordinates.length / 2)],
        zoom: 12,
        essential: true
      });
    }

  }, [selectedSegment, journey]);
  
  // Handle selected location
  useEffect(() => {
    if (!mapRef.current || !selectedLocation) return;
    
    // Remove existing highlighted location if any
    if (mapRef.current.getLayer('selected-location-point')) {
      mapRef.current.removeLayer('selected-location-point');
    }
    
    if (mapRef.current.getLayer('selected-location-pulse')) {
      mapRef.current.removeLayer('selected-location-pulse');
    }
    
    if (mapRef.current.getSource('selected-location')) {
      (mapRef.current.getSource('selected-location') as mapboxgl.GeoJSONSource).setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Point',
          coordinates: selectedLocation.coordinates
        }
      });
    } else {
      mapRef.current.addSource('selected-location', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Point',
            coordinates: selectedLocation.coordinates
          }
        }
      });
    }
    
    // Add pulse animation layer
    mapRef.current.addLayer({
      id: 'selected-location-pulse',
      type: 'circle',
      source: 'selected-location',
      paint: {
        'circle-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          7, 10,
          16, 30
        ],
        'circle-color': '#4287f5',
        'circle-opacity': 0.4,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#4287f5',
      }
    });
    
    // Add point layer
    mapRef.current.addLayer({
      id: 'selected-location-point',
      type: 'circle',
      source: 'selected-location',
      paint: {
        'circle-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          7, 5,
          16, 10
        ],
        'circle-color': '#4287f5',
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff',
      }
    });
    
    // Add popup for the location
    new mapboxgl.Popup()
      .setLngLat(selectedLocation.coordinates)
      .setHTML(`<h3 class="text-sm font-medium">${selectedLocation.name}</h3>`)
      .addTo(mapRef.current);
      
    // Fly to location
    mapRef.current.flyTo({
      center: selectedLocation.coordinates,
      zoom: 12,
      essential: true
    });
    
  }, [selectedLocation]);

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
