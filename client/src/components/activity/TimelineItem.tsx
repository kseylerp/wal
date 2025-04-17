import { ChevronDown, ChevronUp } from 'lucide-react';
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
  // Use type-specific color
  const getTypeColor = (type: string) => {
    const typeColors: Record<string, string> = {
      'hiking': 'bg-green-100 text-green-800',
      'backpacking': 'bg-emerald-100 text-emerald-800',
      'camping': 'bg-yellow-100 text-yellow-800',
      'biking': 'bg-blue-100 text-blue-800',
      'cycling': 'bg-blue-100 text-blue-800',
      'kayaking': 'bg-cyan-100 text-cyan-800',
      'rafting': 'bg-indigo-100 text-indigo-800',
      'climbing': 'bg-purple-100 text-purple-800',
      'skiing': 'bg-sky-100 text-sky-800',
      'snowboarding': 'bg-sky-100 text-sky-800',
      'fishing': 'bg-blue-100 text-blue-800',
      'sightseeing': 'bg-amber-100 text-amber-800',
      'driving': 'bg-slate-100 text-slate-800',
      'flying': 'bg-indigo-100 text-indigo-800',
    };
    
    // Normalize the activity type for matching
    const normalizedType = type.toLowerCase();
    
    // Find the first key in typeColors that is included in the normalized activity type
    const matchedType = Object.keys(typeColors).find(key => 
      normalizedType.includes(key)
    );
    
    // Return the matched color or a default
    return matchedType ? typeColors[matchedType] : 'bg-gray-100 text-gray-800';
  };
  
  // Handle difficulty color
  const getDifficultyColor = (difficulty: string) => {
    const level = difficulty.toLowerCase();
    if (level.includes('easy')) return 'bg-green-100 text-green-800';
    if (level.includes('moderate')) return 'bg-yellow-100 text-yellow-800';
    if (level.includes('challenging') || level.includes('difficult')) return 'bg-orange-100 text-orange-800';
    if (level.includes('hard') || level.includes('extreme') || level.includes('severe')) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };
  
  return (
    <div 
      className={cn(
        "bg-white border rounded-lg shadow-sm transition-all",
        isExpanded ? "border-purple-300" : "border-gray-200",
        compact ? "py-2 px-3" : "p-4"
      )}
    >
      {/* Timeline connector (vertical line) */}
      {!compact && (
        <div className="relative">
          {!isFirst && (
            <div className="absolute top-0 left-[20px] w-0.5 bg-gray-200 h-4 -mt-4"></div>
          )}
          {!isLast && (
            <div className="absolute bottom-0 left-[20px] w-0.5 bg-gray-200 h-4 -mb-4"></div>
          )}
          <div className={cn(
            "absolute top-0 left-[14px] w-[13px] h-[13px] rounded-full border-2",
            getTypeColor(activity.type).includes('green') ? "border-green-500 bg-green-100" :
            getTypeColor(activity.type).includes('blue') ? "border-blue-500 bg-blue-100" :
            getTypeColor(activity.type).includes('yellow') ? "border-yellow-500 bg-yellow-100" :
            getTypeColor(activity.type).includes('indigo') ? "border-indigo-500 bg-indigo-100" :
            getTypeColor(activity.type).includes('purple') ? "border-purple-500 bg-purple-100" :
            getTypeColor(activity.type).includes('amber') ? "border-amber-500 bg-amber-100" :
            "border-gray-500 bg-gray-100"
          )}></div>
        </div>
      )}
      
      {/* Header - always visible */}
      <div 
        className={cn(
          "flex justify-between items-start cursor-pointer",
          !compact && "ml-8"
        )}
        onClick={onToggle}
      >
        <div className="flex-1">
          <div className="flex items-center">
            {dayNumber > 0 && (
              <span className="text-xs font-medium bg-gray-100 text-gray-700 rounded-full px-2 py-0.5 mr-2">
                Day {dayNumber}
              </span>
            )}
            <h3 className={cn(
              "font-medium text-gray-800",
              compact ? "text-sm" : "text-base"
            )}>
              {activity.title}
            </h3>
          </div>
          
          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className={cn(
              "text-xs px-2 py-0.5 rounded-full",
              getTypeColor(activity.type)
            )}>
              {activity.type}
            </span>
            <span className={cn(
              "text-xs px-2 py-0.5 rounded-full",
              getDifficultyColor(activity.difficulty)
            )}>
              {activity.difficulty}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-800">
              {activity.duration_hours}h
            </span>
          </div>
        </div>
        
        <button className="text-gray-400 hover:text-gray-600 mt-1">
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>
      
      {/* Expanded Details */}
      {isExpanded && (
        <ExpandedTimelineItem activity={activity} compact={compact} />
      )}
    </div>
  );
}