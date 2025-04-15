import { useState } from "react";
import { Trip, JourneySegment } from "@/lib/types";
import { 
  Car, Mountain, Sailboat, Bus, ChevronDown, ChevronUp, Map
} from "lucide-react";

interface JourneyOverviewProps {
  journey: Trip["journey"];
}

interface SegmentDetailsProps {
  segment: JourneySegment;
  isOpen: boolean;
  onToggle: () => void;
}

function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${Math.round(meters)} m`;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours} hr${hours !== 1 ? 's' : ''} ${minutes > 0 ? `${minutes} min` : ''}`;
  }
  return `${minutes} min`;
}

function SegmentIcon({ mode }: { mode: JourneySegment["mode"] }) {
  switch (mode) {
    case "driving":
      return <Car className="text-neutral-500 h-5 w-5" />;
    case "walking":
      return <Mountain className="text-neutral-500 h-5 w-5" />;
    case "cycling":
      return (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="text-neutral-500 h-5 w-5"
        >
          <circle cx="5.5" cy="17.5" r="3.5" />
          <circle cx="18.5" cy="17.5" r="3.5" />
          <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5V14l-3-3 4-3 2 3h2" />
        </svg>
      );
    case "transit":
      return <Bus className="text-neutral-500 h-5 w-5" />;
    default:
      return <Sailboat className="text-neutral-500 h-5 w-5" />;
  }
}

function SegmentDetails({ segment, isOpen, onToggle }: SegmentDetailsProps) {
  return (
    <div className="p-3 border-b border-neutral-200">
      <div 
        className="flex justify-between items-center cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center">
          <SegmentIcon mode={segment.mode} />
          <div className="ml-2">
            <p className="font-medium text-sm">{segment.from} to {segment.to}</p>
            <p className="text-xs text-neutral-500">
              {formatDuration(segment.duration)} • {formatDistance(segment.distance)}
              {segment.terrain && ` • ${segment.terrain} terrain`}
            </p>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="text-neutral-500 h-5 w-5" />
        ) : (
          <ChevronDown className="text-neutral-500 h-5 w-5" />
        )}
      </div>
      
      {isOpen && segment.steps && segment.steps.length > 0 && (
        <div className="mt-3 pl-7 space-y-2">
          {segment.steps.map((step, index) => (
            <div key={index} className="text-xs text-neutral-700">
              <p className="font-medium mb-0.5">{step.maneuver.instruction}</p>
              <p className="text-neutral-500">
                {formatDistance(step.distance)} • {formatDuration(step.duration)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function JourneyOverview({ journey }: JourneyOverviewProps) {
  const [openSegmentIndex, setOpenSegmentIndex] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);
  
  const toggleSegment = (index: number) => {
    setOpenSegmentIndex(openSegmentIndex === index ? null : index);
  };
  
  const visibleSegments = showAll 
    ? journey.segments 
    : journey.segments.slice(0, 3);

  return (
    <div className="mb-4">
      <h4 className="font-medium text-neutral-800 mb-2 flex items-center">
        <Map className="text-blue-500 h-4 w-4 mr-1" />
        Journey Overview
      </h4>
      
      <div className="border border-neutral-200 rounded-lg overflow-hidden">
        <div className="p-3 flex justify-between items-center border-b border-neutral-200 bg-neutral-50">
          <div className="text-sm">
            <p className="font-medium">Total Distance</p>
            <p className="text-neutral-600">{formatDistance(journey.totalDistance)}</p>
          </div>
          <div className="text-sm">
            <p className="font-medium">Total Duration</p>
            <p className="text-neutral-600">{journey.totalDuration >= 86400 
              ? `${Math.round(journey.totalDuration / 86400)} days` 
              : formatDuration(journey.totalDuration)
            }</p>
          </div>
        </div>
        
        <div className="divide-y divide-neutral-200">
          {visibleSegments.map((segment, index) => (
            <SegmentDetails
              key={index}
              segment={segment}
              isOpen={openSegmentIndex === index}
              onToggle={() => toggleSegment(index)}
            />
          ))}
        </div>
        
        {journey.segments.length > 3 && (
          <div className="p-3 text-center">
            <button
              className="text-primary font-medium text-sm"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? "Show Less" : `Show ${journey.segments.length - 3} More Segments`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
