import { Activity } from '@/types/trip';
import { ActivityTimelineView } from './ActivityTimelineView';

export interface ActivityTimelineProps {
  activities: Activity[];
  compact?: boolean;
}

export function ActivityTimeline({ 
  activities,
  compact = false
}: ActivityTimelineProps) {
  return <ActivityTimelineView activities={activities} compact={compact} />;
}