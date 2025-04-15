import { useRef, useEffect, useState } from "react";
import { Trip } from "@/lib/types";
import { Maximize2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface MapViewProps {
  mapCenter: Trip["mapCenter"];
  markers: Trip["markers"];
  journey: Trip["journey"];
}

declare global {
  interface Window {
    mapboxgl: any;
  }
}

export default function MapView({ mapCenter, markers, journey }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  const initializeMap = (container: HTMLDivElement) => {
    if (!window.mapboxgl) {
      console.error("Mapbox GL JS is not loaded");
      return;
    }
    
    // Use Mapbox token from environment variable
    const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN || "pk.placeholder.token";
    window.mapboxgl.accessToken = mapboxToken;
    
    const newMap = new window.mapboxgl.Map({
      container,
      style: "mapbox://styles/mapbox/outdoors-v12",
      center: mapCenter,
      zoom: 7,
    });
    
    // Add navigation controls
    newMap.addControl(new window.mapboxgl.NavigationControl(), "top-right");
    
    newMap.on('load', () => {
      setMapLoaded(true);
      
      // Add markers to map
      markers.forEach((marker) => {
        const el = document.createElement("div");
        el.className = "marker";
        el.style.width = "24px";
        el.style.height = "24px";
        el.style.backgroundImage = "url(https://cdn.mapbox.com/mapbox-gl-js/assets/custom_marker.png)";
        el.style.backgroundSize = "cover";
        
        new window.mapboxgl.Marker(el)
          .setLngLat(marker.coordinates)
          .setPopup(new window.mapboxgl.Popup().setHTML(`<h3>${marker.name}</h3>`))
          .addTo(newMap);
      });
      
      // Add journey routes if geometry is available
      journey.segments.forEach((segment, idx) => {
        if (segment.geometry && segment.geometry.coordinates.length > 0) {
          newMap.addSource(`route-${idx}`, {
            type: "geojson",
            data: {
              type: "Feature",
              properties: {},
              geometry: segment.geometry,
            },
          });
          
          newMap.addLayer({
            id: `route-${idx}`,
            type: "line",
            source: `route-${idx}`,
            layout: {
              "line-join": "round",
              "line-cap": "round",
            },
            paint: {
              "line-color": segment.mode === "walking" ? "#1A73E8" : "#5E35B1",
              "line-width": 4,
            },
          });
        }
      });
      
      // Fit to journey bounds if available
      if (journey.bounds && journey.bounds.length === 2) {
        newMap.fitBounds(journey.bounds, {
          padding: 40
        });
      }
    });
    
    return newMap;
  };

  useEffect(() => {
    // Load MapBox script dynamically
    if (!window.mapboxgl) {
      const script = document.createElement('script');
      script.src = 'https://api.mapbox.com/mapbox-gl-js/v2.14.1/mapbox-gl.js';
      script.async = true;
      script.onload = () => {
        const link = document.createElement('link');
        link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.14.1/mapbox-gl.css';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
        
        if (mapContainer.current && !map.current) {
          map.current = initializeMap(mapContainer.current);
        }
      };
      document.head.appendChild(script);
    } else if (mapContainer.current && !map.current) {
      map.current = initializeMap(mapContainer.current);
    }
    
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  const handleExpandClick = () => {
    setIsExpanded(true);
  };

  return (
    <>
      <div className="rounded-lg overflow-hidden shadow-sm mb-4 relative">
        <div ref={mapContainer} className="h-64 w-full"></div>
        <div className="absolute bottom-3 right-3">
          <button 
            className="bg-white rounded-full p-2 shadow-md hover:bg-gray-100" 
            aria-label="Expand map"
            onClick={handleExpandClick}
          >
            <Maximize2 className="text-neutral-700 h-5 w-5" />
          </button>
        </div>
      </div>
      
      <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
        <DialogContent className="sm:max-w-[90vw] max-h-[90vh] p-0">
          <div className="h-[80vh] w-full" id="expanded-map">
            {isExpanded && mapLoaded && map.current && (
              <div className="h-full w-full" ref={(el) => {
                if (el) {
                  const expandedMap = initializeMap(el);
                  return () => expandedMap?.remove();
                }
              }}></div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
