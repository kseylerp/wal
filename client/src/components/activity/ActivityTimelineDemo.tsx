import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity } from '@/types/trip';
import { generateSampleActivities } from './SampleActivityData';
import { TimelineItem } from './TimelineItem';

// Demo component for the Activity Timeline
export function ActivityTimelineDemo() {
  const [activities] = useState<Activity[]>(() => generateSampleActivities(6));
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

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Activity Timeline (Demo)</CardTitle>
        <CardDescription>
          Sample timeline of activities for a trip
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="timeline" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="timeline">Timeline View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>
          <TabsContent value="timeline" className="pt-4">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Trip Activities</h3>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={toggleExpandAll}
                >
                  {expandAll ? 'Collapse All' : 'Expand All'}
                </Button>
              </div>
              
              <div className="space-y-8">
                {activities.map((activity, index) => (
                  <TimelineItem
                    key={activity.id || index}
                    activity={activity}
                    isFirst={index === 0}
                    isLast={index === activities.length - 1}
                    isExpanded={expandAll || expandedActivityId === (activity.id || index.toString())}
                    onToggle={() => toggleActivity(activity.id || index.toString())}
                    dayNumber={activity.day || Math.floor(index / 2) + 1}
                    compact={false}
                  />
                ))}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="list" className="pt-4">
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{activity.title}</CardTitle>
                    <CardDescription className="text-xs">
                      Day {activity.day} • {activity.duration_hours} hours • {activity.distance} miles
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2 text-sm">
                    <p className="line-clamp-2">{activity.description}</p>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button variant="link" size="sm" className="px-0 h-auto">View Details</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}