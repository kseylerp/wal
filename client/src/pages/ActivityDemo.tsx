import { useState } from 'react';
import { ActivityTimeline } from '@/components/activity/ActivityTimeline';
import { Activity } from '@/types/trip';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Sample data for the demo
const SAMPLE_ACTIVITIES: Activity[] = [
  {
    title: "Alpine Lake Trail Hike",
    type: "hiking",
    difficulty: "moderate",
    duration_hours: 3.5,
    location: "Alpine Meadows, Rocky Mountain National Park",
    start_location: "Alpine Trailhead",
    end_location: "Crystal Lake Viewpoint",
    distance: 5.2,
    day: 1,
    description: "A beautiful trail winding through alpine meadows to a pristine mountain lake with stunning reflections of the surrounding peaks. The trail is well-maintained with moderate inclines.",
    highlights: [
      "Wildflower meadows in summer",
      "Crystal Lake panoramic views",
      "Wildlife viewing opportunities (elk, marmots)"
    ],
    hazards: [
      "Afternoon thunderstorms are common in summer",
      "Limited shade in meadow sections"
    ],
    route_details: {
      distance_miles: 5.2,
      elevation_gain_ft: 820,
      elevation_loss_ft: 320,
      high_point_ft: 10450,
      route_type: "Out and back"
    }
  },
  {
    title: "Mountain Ridge Campsite",
    type: "camping",
    difficulty: "easy",
    duration_hours: 12,
    location: "Ridge Overlook, Rocky Mountain National Park",
    day: 1,
    description: "Set up camp at this established site with stunning valley views. Facilities include a fire ring, bear box, and nearby vault toilets.",
    highlights: [
      "Sunset views over the valley",
      "Star-gazing opportunities",
      "Protected from prevailing winds"
    ],
    hazards: [
      "Bear activity in the area - proper food storage required",
      "No water source at site (must carry in water)"
    ],
    route_details: {
      distance_miles: 0.2,
      elevation_gain_ft: 50,
      elevation_loss_ft: 0,
      high_point_ft: 10500,
      route_type: "Short walk"
    }
  },
  {
    title: "Canyon River Rafting",
    type: "rafting",
    difficulty: "challenging",
    duration_hours: 4,
    location: "Echo Canyon, Green River",
    start_location: "Canyon Launch Point",
    end_location: "Evergreen Recovery Area",
    distance: 8.5,
    day: 2,
    description: "An exhilarating whitewater journey through scenic Echo Canyon with class III and IV rapids. Experienced guides navigate the most technical sections.",
    highlights: [
      "Thrilling rapids including 'Thor's Hammer' and 'Neptune's Trident'",
      "Canyon wall geological formations",
      "Bald eagle nesting areas"
    ],
    hazards: [
      "Class IV rapids require paddling proficiency",
      "Cold water temperatures even in summer",
      "Limited exit points through the canyon"
    ],
    route_details: {
      distance_miles: 8.5,
      elevation_gain_ft: 0,
      elevation_loss_ft: 350,
      high_point_ft: 7200,
      route_type: "One-way river journey"
    }
  },
  {
    title: "Sunset Vista Photography",
    type: "viewpoint",
    difficulty: "easy",
    duration_hours: 1,
    location: "Eagle's Perch Overlook",
    day: 2,
    description: "A short walk to a premier viewpoint for sunset photography. The panoramic views of the valley and distant mountains create stunning photo opportunities.",
    highlights: [
      "Golden hour lighting on canyon walls",
      "270-degree panoramic views",
      "Wildflowers and wildlife in foreground elements"
    ],
    route_details: {
      distance_miles: 0.5,
      elevation_gain_ft: 100,
      elevation_loss_ft: 100,
      high_point_ft: 9800,
      route_type: "Short walk"
    }
  },
  {
    title: "Aspen Forest Mountain Biking",
    type: "biking",
    difficulty: "challenging",
    duration_hours: 2.5,
    location: "Silverleaf Trail System",
    start_location: "North Trailhead",
    end_location: "Cedar Creek Junction",
    distance: 7.8,
    day: 3,
    description: "A thrilling single-track mountain bike trail winding through aspen groves and open meadows with moderate technical sections and fast descents.",
    highlights: [
      "Stunning aspen groves (golden in fall)",
      "Flowing single-track sections",
      "Technical rock gardens and root sections"
    ],
    hazards: [
      "Several technical rock drops (with bypass options)",
      "Blind corners - watch speed",
      "Creek crossing may be high in spring"
    ],
    route_details: {
      distance_miles: 7.8,
      elevation_gain_ft: 1150,
      elevation_loss_ft: 950,
      high_point_ft: 9800,
      route_type: "Loop"
    }
  }
];

export default function ActivityDemo() {
  const [viewMode, setViewMode] = useState('timeline');
  
  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <h1 className="text-2xl font-bold mb-6">Activity Timeline Demo</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
        {/* Left Column: Activity Timeline */}
        <div className="md:col-span-1 lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Activities</CardTitle>
              <CardDescription>5-day trip itinerary</CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityTimeline activities={SAMPLE_ACTIVITIES} />
            </CardContent>
          </Card>
        </div>
        
        {/* Right Column: Map (placeholder for now) */}
        <div className="md:col-span-2 lg:col-span-2 flex flex-col">
          <Card className="flex-1 flex flex-col sticky top-20">
            <CardHeader>
              <CardTitle>Interactive Map</CardTitle>
              <CardDescription>Visualize your journey</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 bg-gray-100 flex items-center justify-center">
              <div className="text-center p-6">
                <div className="text-4xl mb-4">🗺️</div>
                <h3 className="text-lg font-medium mb-2">Map Placeholder</h3>
                <p className="text-gray-500 text-sm max-w-md">
                  In the actual implementation, this area will contain the MapBox
                  interactive map showing routes and activity points.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}