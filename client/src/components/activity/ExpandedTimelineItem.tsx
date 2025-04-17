import { Activity } from '@/types/trip';
import { MapPin, Navigation, Map, Mountain, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ExpandedTimelineItemProps {
  activity: Activity;
  compact?: boolean;
}

export function ExpandedTimelineItem({
  activity,
  compact = false
}: ExpandedTimelineItemProps) {
  return (
    <div className={cn(
      "border-t border-dashed border-gray-200 pt-3 mt-3",
      !compact && "ml-8"
    )}>
      {/* Start/End Location */}
      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
        <div className="flex items-center">
          <Navigation className="h-3.5 w-3.5 mr-1.5 text-green-600" />
          <span className="text-gray-500 font-medium">Start:</span>
          <span className="ml-1 text-gray-700">{activity.start_location}</span>
        </div>
        <div className="flex items-center">
          <MapPin className="h-3.5 w-3.5 mr-1.5 text-red-600" />
          <span className="text-gray-500 font-medium">End:</span>
          <span className="ml-1 text-gray-700">{activity.end_location}</span>
        </div>
      </div>
      
      {/* Route Details */}
      {activity.route_details && (
        <div className="bg-gray-50 p-2 rounded border border-gray-100 mb-3">
          <h5 className="text-xs font-medium mb-1.5 flex items-center">
            <Map className="h-3.5 w-3.5 mr-1.5 text-gray-600" />
            Route Details
          </h5>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
            <div>
              <span className="text-gray-500">Distance:</span> {activity.route_details.distance_miles} miles
            </div>
            <div>
              <span className="text-gray-500">Type:</span> {activity.route_details.route_type}
            </div>
            <div>
              <span className="text-gray-500">Elevation Gain:</span> {activity.route_details.elevation_gain_ft} ft
            </div>
            <div>
              <span className="text-gray-500">Elevation Loss:</span> {activity.route_details.elevation_loss_ft} ft
            </div>
            <div>
              <span className="text-gray-500">High Point:</span> {activity.route_details.high_point_ft} ft
            </div>
            <div>
              <span className="text-gray-500">Terrain:</span> {activity.route_details.terrain}
            </div>
          </div>
        </div>
      )}
      
      {/* Highlights */}
      {activity.highlights && activity.highlights.length > 0 && (
        <div className="mb-3">
          <h5 className="text-xs font-medium mb-1.5 flex items-center">
            <Mountain className="h-3.5 w-3.5 mr-1.5 text-green-700" />
            Highlights
          </h5>
          <ul className="list-disc pl-5 space-y-0.5 text-xs text-gray-700">
            {activity.highlights.map((highlight, idx) => (
              <li key={idx}>{highlight}</li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Hazards */}
      {activity.hazards && activity.hazards.length > 0 && (
        <div className="mb-3">
          <h5 className="text-xs font-medium mb-1.5 flex items-center text-amber-700">
            <AlertTriangle className="h-3.5 w-3.5 mr-1.5 text-amber-700" />
            Hazards
          </h5>
          <ul className="list-disc pl-5 space-y-0.5 text-xs text-amber-700">
            {activity.hazards.map((hazard, idx) => (
              <li key={idx}>{hazard}</li>
            ))}
          </ul>
        </div>
      )}
      
      {/* View on Map Button */}
      {activity.route_geometry && (
        <Button
          variant="outline"
          size="sm"
          className="text-xs w-full"
        >
          View on Map
        </Button>
      )}
    </div>
  );
}