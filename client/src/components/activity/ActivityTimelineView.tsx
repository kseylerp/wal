import { useState } from 'react';
import { Activity } from '@/types/trip';
import { TimelineItem } from './TimelineItem';

interface ActivityTimelineViewProps {
  activities: Activity[];
  compact?: boolean;
}

export function ActivityTimelineView({ 
  activities,
  compact = false
}: ActivityTimelineViewProps) {
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null);
  
  if (!activities || activities.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 italic">
        No activities found for this trip.
      </div>
    );
  }
  
  // Group activities by day
  const dayMap = activities.reduce((acc, activity) => {
    const day = activity.day || 1;
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(activity);
    return acc;
  }, {} as Record<number, Activity[]>);
  
  // Sort days
  const sortedDays = Object.keys(dayMap)
    .map(Number)
    .sort((a, b) => a - b);
  
  const toggleActivity = (activity: Activity) => {
    const activityId = `${activity.title}-${activity.type}`;
    setExpandedActivity(expandedActivity === activityId ? null : activityId);
  };
  
  const getActivityId = (activity: Activity) => {
    return `${activity.title}-${activity.type}`;
  };
  
  return (
    <div className="flex flex-col space-y-4">
      {sortedDays.map(dayNumber => (
        <div key={dayNumber} className="space-y-4">
          {dayMap[dayNumber].map((activity, index) => {
            const activityId = getActivityId(activity);
            const isExpanded = expandedActivity === activityId;
            const isFirst = index === 0;
            const isLast = index === dayMap[dayNumber].length - 1;
            
            return (
              <TimelineItem
                key={activityId}
                activity={activity}
                isFirst={isFirst}
                isLast={isLast}
                isExpanded={isExpanded}
                onToggle={() => toggleActivity(activity)}
                dayNumber={dayNumber}
                compact={compact}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}