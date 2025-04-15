import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';

// A simple test page to get the map working
const MapTest: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initializeMap() {
      try {
        setLoading(true);
        // Fetch MapBox token
        const response = await fetch('/api/config');
        const data = await response.json();
        const token = data.mapboxToken;
        
        if (!token) {
          setError('No MapBox token available');
          setLoading(false);
          return;
        }
        
        setMapboxToken(token);
        mapboxgl.accessToken = token;
        
        // Double check that the container exists
        if (!mapContainerRef.current) {
          setError('Map container not found');
          setLoading(false);
          return;
        }
        
        // Create the map
        console.log('Initializing map with container:', mapContainerRef.current);
        const map = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [-122.486052, 37.830348],
          zoom: 14
        });
        
        mapRef.current = map;
        
        map.on('load', () => {
          console.log('Map loaded successfully!');
          
          // Add a route
          map.addSource('route', {
            'type': 'geojson',
            'data': {
              'type': 'Feature',
              'properties': {},
              'geometry': {
                'type': 'LineString',
                'coordinates': [
                  [-122.483696, 37.833818],
                  [-122.483482, 37.833174],
                  [-122.483396, 37.8327],
                  [-122.483568, 37.832056],
                  [-122.48404, 37.831141],
                  [-122.48404, 37.830497],
                  [-122.483482, 37.82992],
                  [-122.483568, 37.829548],
                  [-122.48507, 37.829446],
                  [-122.4861, 37.828802],
                ]
              }
            }
          });
          
          map.addLayer({
            'id': 'route',
            'type': 'line',
            'source': 'route',
            'layout': {
              'line-join': 'round',
              'line-cap': 'round'
            },
            'paint': {
              'line-color': '#7c3aed',
              'line-width': 8
            }
          });
          
          // Add a marker
          new mapboxgl.Marker()
            .setLngLat([-122.486052, 37.830348])
            .setPopup(new mapboxgl.Popup().setHTML("<h3>Golden Gate Bridge</h3>"))
            .addTo(map);
          
          setLoading(false);
        });
        
        map.on('error', (e) => {
          console.error('MapBox error:', e);
          setError('Error loading map: ' + e.error?.message || 'Unknown error');
          setLoading(false);
        });
      } catch (err) {
        console.error('Error in map initialization:', err);
        setError('Failed to initialize map: ' + (err instanceof Error ? err.message : String(err)));
        setLoading(false);
      }
    }
    
    initializeMap();
    
    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []);
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">MapBox Test Page</h1>
      
      {loading && (
        <div className="mb-4 p-4 bg-blue-100 rounded">
          <p>Loading map...</p>
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
        className="w-full h-[600px] border rounded shadow-md"
      />
      
      <div className="mt-4 p-4 bg-gray-100 rounded">
        <h2 className="font-bold mb-2">Map Status:</h2>
        <p>MapBox Token: {mapboxToken ? '✅ Available' : '❌ Not Available'}</p>
        <p>Map Reference: {mapRef.current ? '✅ Created' : '❌ Not Created'}</p>
        <p>Loading: {loading ? '⏳ In Progress' : '✅ Complete'}</p>
        <p>Error: {error ? `❌ ${error}` : '✅ None'}</p>
      </div>
    </div>
  );
};

export default MapTest;