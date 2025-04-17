import { useState } from 'react';
import { Activity } from '@/types/trip';
import { TimelineItem } from './TimelineItem';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ActivityTimelineProps {
  activities: Activity[];
  compact?: boolean;
}

export function ActivityTimeline({ activities, compact = false }: ActivityTimelineProps) {
  const [expandedActivityId, setExpandedActivityId] = useState<string | null>(null);
  const [expandAll, setExpandAll] = useState(false);

  // Toggle expansion of a specific activity
  const toggleActivity = (activityId: string) => {
    if (expandAll) {
      setExpandAll(false);
      setExpandedActivityId(activityId);
      return;
    }
    
    setExpandedActivityId(prev => prev === activityId ? null : activityId);
  };

  // Toggle all activities expansion
  const toggleExpandAll = () => {
    setExpandAll(prev => !prev);
    setExpandedActivityId(null);
  };

  if (!activities || activities.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 italic">
        No activities available for this trip.
      </div>
    );
  }

  return (
    <div className="activity-timeline">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-md font-medium text-gray-800">Trip Activities</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={toggleExpandAll} 
          className="text-xs flex items-center gap-1"
        >
          {expandAll ? (
            <>
              <ChevronUp className="h-3 w-3" />
              Collapse All
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3" />
              Expand All
            </>
          )}
        </Button>
      </div>

      <div className="space-y-2">
        {activities.map((activity, index) => (
          <TimelineItem
            key={activity.id || index}
            activity={activity}
            isFirst={index === 0}
            isLast={index === activities.length - 1}
            isExpanded={expandAll || expandedActivityId === (activity.id || index.toString())}
            onToggle={() => toggleActivity(activity.id || index.toString())}
            dayNumber={Math.floor(index / 3) + 1} // Assuming ~3 activities per day
            compact={compact}
          />
        ))}
      </div>
    </div>
  );
}