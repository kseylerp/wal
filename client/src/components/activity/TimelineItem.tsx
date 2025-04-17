import { useState } from 'react';
import { 
  MapPin, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  LocateFixed, 
  Bike, 
  Ship, 
  Camera, 
  Tent, 
  Mountain, 
  AlertTriangle 
} from 'lucide-react';
import { Activity } from '@/types/trip';
import { ExpandedTimelineItem } from './ExpandedTimelineItem';
import { cn } from '@/lib/utils';

interface TimelineItemProps {
  activity: Activity;
  isFirst: boolean;
  isLast: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  dayNumber: number;
  compact?: boolean;
}

export function TimelineItem({
  activity,
  isFirst,
  isLast,
  isExpanded,
  onToggle,
  dayNumber,
  compact = false
}: TimelineItemProps) {
  const [hovering, setHovering] = useState(false);

  // Get activity type icon
  const getActivityIcon = () => {
    const props = { className: "h-4 w-4" };
    
    const type = activity.type?.toLowerCase() || '';
    
    if (type.includes('hik')) return <LocateFixed {...props} />;
    if (type.includes('bik') || type.includes('cycl')) return <Bike {...props} />;
    if (type.includes('raft') || type.includes('kayak') || type.includes('swim')) return <Ship {...props} />;
    if (type.includes('camp')) return <Tent {...props} />;
    if (type.includes('view') || type.includes('photo')) return <Camera {...props} />;
    
    return <Mountain {...props} />; // Default
  };

  // Get difficulty color
  const getDifficultyColor = () => {
    switch (activity.difficulty?.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'challenging':
      case 'difficult':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'extreme':
      case 'very difficult':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  // Format duration
  const formatDuration = () => {
    const duration = activity.duration_hours || 0;
    if (duration < 1) {
      return `${Math.round(duration * 60)} min`;
    }
    return duration === 1 ? '1 hour' : `${duration} hours`;
  };

  return (
    <div 
      className={cn(
        "relative",
        { "pb-0": isLast }
      )}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {/* Timeline connector line */}
      {!isLast && (
        <div 
          className="absolute left-[18px] top-[32px] w-[2px] bg-gray-200" 
          style={{ 
            height: 'calc(100% - 32px)',
            backgroundColor: hovering ? '#9381ff' : undefined
          }}
        />
      )}

      {/* Day indicator - only show on first activity of each day */}
      {activity.day === dayNumber && (
        <div className="mb-2 pl-10 text-sm font-semibold text-gray-500">
          Day {dayNumber}
        </div>
      )}

      <div className="flex items-start">
        {/* Timeline node */}
        <div 
          className={cn(
            "relative z-10 flex-shrink-0 w-10 h-10 rounded-full border-4 flex items-center justify-center",
            getDifficultyColor(),
            { "border-[#9381ff]": hovering }
          )}
        >
          {getActivityIcon()}
        </div>

        {/* Activity content */}
        <div className="flex-grow ml-4">
          <div 
            className={cn(
              "rounded-lg border p-3 cursor-pointer transition-all",
              { 
                "bg-white shadow-sm hover:shadow": !isExpanded,
                "bg-gray-50": isExpanded,
                "border-[#9381ff]": hovering || isExpanded 
              }
            )}
            onClick={onToggle}
          >
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <h4 className="font-medium text-gray-800">
                  {activity.title || 'Unnamed Activity'}
                </h4>
                <div className="flex items-center text-xs text-gray-500 mt-1">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{formatDuration()}</span>
                  
                  {!compact && activity.distance && (
                    <>
                      <span className="mx-1">•</span>
                      <span>{activity.distance} miles</span>
                    </>
                  )}
                  
                  {!compact && activity.type && (
                    <>
                      <span className="mx-1">•</span>
                      <span className="capitalize">{activity.type}</span>
                    </>
                  )}
                </div>
              </div>

              <div>
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </div>

            {/* Location preview (only show if not expanded and not compact) */}
            {!isExpanded && !compact && activity.location && (
              <div className="mt-2 flex items-center text-xs text-gray-500">
                <MapPin className="h-3 w-3 mr-1" />
                <span className="truncate">{activity.location}</span>
              </div>
            )}

            {/* Hazards/warnings indicator */}
            {!isExpanded && !compact && activity.hazards && activity.hazards.length > 0 && (
              <div className="mt-2 flex items-center text-xs text-amber-600">
                <AlertTriangle className="h-3 w-3 mr-1" />
                <span>Requires caution</span>
              </div>
            )}

            {/* Expanded details content */}
            {isExpanded && (
              <ExpandedTimelineItem 
                activity={activity} 
                compact={compact}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}