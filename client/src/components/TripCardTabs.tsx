import { useState } from "react";
import TripCard from "./TripCard";
import { Trip } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TripCardTabsProps {
  trips: Trip[];
}

export default function TripCardTabs({ trips }: TripCardTabsProps) {
  const [activeTab, setActiveTab] = useState(0);

  if (!trips || trips.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="border-b border-neutral-200">
        <div className="flex overflow-x-auto hide-scrollbar">
          {trips.map((trip, index) => (
            <button
              key={trip.id}
              className={cn(
                "px-4 py-2 font-medium text-sm whitespace-nowrap",
                activeTab === index
                  ? "border-b-2 border-primary text-primary"
                  : "text-neutral-500"
              )}
              onClick={() => setActiveTab(index)}
            >
              {trip.title.split(' ').slice(0, 3).join(' ')}
            </button>
          ))}
        </div>
      </div>
      
      <div className="pt-4">
        <TripCard trip={trips[activeTab]} />
      </div>
    </div>
  );
}
