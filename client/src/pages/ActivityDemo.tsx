import { ActivityTimelineDemo } from '@/components/activity/ActivityTimelineDemo';

export default function ActivityDemo() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Activity Timeline Demo</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          This is a demonstration of the timeline-based activity display for trip details. 
          The timeline shows activities in chronological order with expandable details.
        </p>
      </div>
      
      <ActivityTimelineDemo />
    </div>
  );
}