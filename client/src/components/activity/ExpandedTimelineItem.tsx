import { useState, useRef, useEffect } from 'react';
import { 
  MapPin, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  Camera, 
  Droplets,
  Info,
  Mountain
} from 'lucide-react';
import { Activity } from '@/types/trip';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import mapboxgl from 'mapbox-gl';

interface ExpandedTimelineItemProps {
  activity: Activity;
  compact?: boolean;
}

export function ExpandedTimelineItem({ 
  activity,
  compact = false
}: ExpandedTimelineItemProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    // Don't initialize map if no coordinates or if already initialized
    if (!activity.route || mapRef.current || !mapContainerRef.current) return;

    // Check if we have valid coordinates to display
    const hasCoordinates = Array.isArray(activity.route) && 
                            activity.route.length > 0 && 
                            activity.route[0].length === 2;
    
    if (!hasCoordinates) return;

    const token = process.env.MAPBOX_TOKEN || 
                  process.env.MAPBOX_PUBLIC_TOKEN || 
                  // The newest token with public scopes
                  'pk.eyJ1Ijoia3NleWxlcnAiLCJhIjoiY204cGJnM2M0MDk1ZjJrb2F3b3o0ZWlnaCJ9.a2VxRsgFb9FwElyHeUUaTw';
    
    if (!token) return;

    mapboxgl.accessToken = token;

    // Calculate the bounds of the route coordinates
    const bounds = new mapboxgl.LngLatBounds();
    activity.route.forEach(coord => {
      bounds.extend([coord[0], coord[1]]);
    });

    // Create a new map instance
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/outdoors-v11',
      bounds: bounds,
      fitBoundsOptions: { 
        padding: 40,
        maxZoom: 14
      }
    });

    map.on('load', () => {
      setMapLoaded(true);

      // Add the route line
      if (activity.route && activity.route.length > 1) {
        map.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: activity.route
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
            'line-color': '#9381ff',
            'line-width': 4
          }
        });

        // Add start and end markers
        const startPoint = activity.route[0];
        const endPoint = activity.route[activity.route.length - 1];

        new mapboxgl.Marker({ color: '#4CAF50' })
          .setLngLat(startPoint)
          .addTo(map);

        new mapboxgl.Marker({ color: '#F44336' })
          .setLngLat(endPoint)
          .addTo(map);
      }

      // Add points of interest if available
      if (activity.points_of_interest) {
        activity.points_of_interest.forEach((poi, index) => {
          if (poi.coordinates) {
            new mapboxgl.Marker({ color: '#FFD700' })
              .setLngLat(poi.coordinates)
              .setPopup(new mapboxgl.Popup().setHTML(`<h3>${poi.name}</h3><p>${poi.description || ''}</p>`))
              .addTo(map);
          }
        });
      }
    });

    // Save the map instance
    mapRef.current = map;

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [activity.route, activity.points_of_interest]);

  return (
    <div className="mt-4 space-y-4">
      {/* Description */}
      {activity.description && (
        <div className="text-sm text-gray-700">
          <p>{activity.description}</p>
        </div>
      )}

      <Separator />

      {/* Key details */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        {activity.location && (
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2 text-gray-500" />
            <span>{activity.location}</span>
          </div>
        )}
        
        {activity.duration_hours && (
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2 text-gray-500" />
            <span>
              {activity.duration_hours === 1 
                ? '1 hour' 
                : activity.duration_hours < 1 
                  ? `${Math.round(activity.duration_hours * 60)} min` 
                  : `${activity.duration_hours} hours`}
            </span>
          </div>
        )}
        
        {activity.elevation_gain && (
          <div className="flex items-center">
            <TrendingUp className="h-4 w-4 mr-2 text-gray-500" />
            <span>{activity.elevation_gain} ft gain</span>
          </div>
        )}
        
        {activity.difficulty && (
          <div className="flex items-center">
            <Mountain className="h-4 w-4 mr-2 text-gray-500" />
            <span className="capitalize">{activity.difficulty}</span>
          </div>
        )}
      </div>

      {/* Map */}
      {!compact && activity.route && activity.route.length > 0 && (
        <div
          ref={mapContainerRef}
          className="h-[150px] w-full rounded-md overflow-hidden border"
        >
          {!mapLoaded && (
            <div className="h-full w-full flex items-center justify-center bg-gray-100">
              <span className="text-sm text-gray-500">Loading map...</span>
            </div>
          )}
        </div>
      )}

      {/* Highlights */}
      {activity.highlights && activity.highlights.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center text-sm font-medium">
            <Info className="h-4 w-4 mr-2 text-blue-500" />
            <h5>Highlights</h5>
          </div>
          <div className="flex flex-wrap gap-2">
            {activity.highlights.map((highlight, index) => (
              <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                {highlight}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Hazards/warnings */}
      {activity.hazards && activity.hazards.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center text-sm font-medium">
            <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
            <h5>Hazards & Warnings</h5>
          </div>
          <div className="flex flex-wrap gap-2">
            {activity.hazards.map((hazard, index) => (
              <Badge key={index} variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100">
                {hazard}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Water sources */}
      {activity.water_sources && activity.water_sources.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center text-sm font-medium">
            <Droplets className="h-4 w-4 mr-2 text-cyan-500" />
            <h5>Water Sources</h5>
          </div>
          <div className="flex flex-wrap gap-2">
            {activity.water_sources.map((source, index) => (
              <Badge key={index} variant="outline" className="border-cyan-200 bg-cyan-50 text-cyan-700 hover:bg-cyan-100">
                {source}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Photo opportunities */}
      {activity.photo_spots && activity.photo_spots.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center text-sm font-medium">
            <Camera className="h-4 w-4 mr-2 text-purple-500" />
            <h5>Photo Spots</h5>
          </div>
          <div className="flex flex-wrap gap-2">
            {activity.photo_spots.map((spot, index) => (
              <Badge key={index} variant="outline" className="border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100">
                {spot}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Full details button */}
      <div className="pt-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={(e) => {
            e.stopPropagation();
            // Future: navigate to full activity detail view
            console.log('View full details for', activity.title);
          }}
        >
          View Full Details
        </Button>
      </div>
    </div>
  );
}