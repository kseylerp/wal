import { useState } from 'react';
import { 
  MapPin, 
  Ruler, 
  ArrowRight, 
  Mountain, 
  Clock, 
  AlertTriangle, 
  Camera,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  Navigation
} from 'lucide-react';
import { Activity } from '@/types/trip';
import { Separator } from '@/components/ui/separator';

interface ExpandedTimelineItemProps {
  activity: Activity;
  compact?: boolean;
}

export function ExpandedTimelineItem({
  activity,
  compact = false
}: ExpandedTimelineItemProps) {
  return (
    <div className="mt-3 text-sm transition-all">
      {/* Description */}
      {activity.description && (
        <div className="mb-3">
          <p className="text-gray-700">{activity.description}</p>
        </div>
      )}
      
      <Separator className="my-3" />
      
      {/* Info grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {/* Location info */}
        {activity.location && (
          <div className="flex items-start">
            <MapPin className="h-4 w-4 mr-2 text-gray-500 mt-0.5" />
            <div>
              <div className="font-medium text-gray-700">Location</div>
              <div className="text-gray-600">{activity.location}</div>
            </div>
          </div>
        )}
        
        {/* Start/End locations */}
        {(activity.start_location || activity.end_location) && (
          <div className="flex items-start">
            <Navigation className="h-4 w-4 mr-2 text-gray-500 mt-0.5" />
            <div>
              <div className="font-medium text-gray-700">Route</div>
              <div className="text-gray-600">
                {activity.start_location}
                {activity.start_location && activity.end_location && (
                  <ArrowRight className="h-3 w-3 inline mx-1" />
                )}
                {activity.end_location}
              </div>
            </div>
          </div>
        )}
        
        {/* Duration */}
        <div className="flex items-start">
          <Clock className="h-4 w-4 mr-2 text-gray-500 mt-0.5" />
          <div>
            <div className="font-medium text-gray-700">Duration</div>
            <div className="text-gray-600">
              {activity.duration_hours < 1 
                ? `${Math.round(activity.duration_hours * 60)} minutes` 
                : `${activity.duration_hours} hour${activity.duration_hours !== 1 ? 's' : ''}`
              }
            </div>
          </div>
        </div>
        
        {/* Distance */}
        {activity.distance && (
          <div className="flex items-start">
            <Ruler className="h-4 w-4 mr-2 text-gray-500 mt-0.5" />
            <div>
              <div className="font-medium text-gray-700">Distance</div>
              <div className="text-gray-600">{activity.distance} miles</div>
            </div>
          </div>
        )}
      </div>
      
      {/* Route details section */}
      {activity.route_details && (
        <>
          <Separator className="my-3" />
          
          <h4 className="font-medium text-gray-700 mb-2">Elevation Profile</h4>
          <div className="grid grid-cols-2 gap-2 mb-1">
            <div className="flex items-center">
              <TrendingUp className="h-4 w-4 mr-1 text-green-600" />
              <span className="text-gray-700">
                {activity.route_details.elevation_gain_ft} ft gain
              </span>
            </div>
            <div className="flex items-center">
              <TrendingDown className="h-4 w-4 mr-1 text-blue-600" />
              <span className="text-gray-700">
                {activity.route_details.elevation_loss_ft} ft loss
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center">
              <Mountain className="h-4 w-4 mr-1 text-purple-600" />
              <span className="text-gray-700">
                {activity.route_details.high_point_ft} ft high point
              </span>
            </div>
            <div className="flex items-center">
              <ArrowUpRight className="h-4 w-4 mr-1 text-gray-600" />
              <span className="text-gray-700">
                {activity.route_details.route_type}
              </span>
            </div>
          </div>
        </>
      )}
      
      {/* Highlights */}
      {activity.highlights && activity.highlights.length > 0 && (
        <>
          <Separator className="my-3" />
          
          <h4 className="font-medium text-gray-700 mb-2 flex items-center">
            <Camera className="h-4 w-4 mr-1 text-green-600" />
            Highlights
          </h4>
          <ul className="list-disc pl-4 space-y-1 text-gray-700">
            {activity.highlights.map((highlight, idx) => (
              <li key={idx}>{highlight}</li>
            ))}
          </ul>
        </>
      )}
      
      {/* Hazards */}
      {activity.hazards && activity.hazards.length > 0 && (
        <>
          <Separator className="my-3" />
          
          <h4 className="font-medium text-gray-700 mb-2 flex items-center">
            <AlertTriangle className="h-4 w-4 mr-1 text-amber-600" />
            Hazards &amp; Warnings
          </h4>
          <ul className="list-disc pl-4 space-y-1 text-amber-700">
            {activity.hazards.map((hazard, idx) => (
              <li key={idx}>{hazard}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}