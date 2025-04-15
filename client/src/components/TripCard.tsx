import { useState } from "react";
import { Trip } from "@/lib/types";
import MapView from "./MapView";
import JourneyOverview from "./JourneyOverview";
import { MapPin, Info, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

interface TripCardProps {
  trip: Trip;
}

type TabName = "overview" | "itinerary" | "details";

export default function TripCard({ trip }: TripCardProps) {
  const [activeTab, setActiveTab] = useState<TabName>("overview");

  if (!trip) return null;

  return (
    <div id={`trip-card-${trip.id || 'unknown'}`}>
      <div className="mb-3">
        <h3 className="text-lg font-semibold text-neutral-800">
          {typeof trip.title === 'string' ? trip.title : 'Trip Option'}
        </h3>
        <div className="flex items-center text-sm text-neutral-600 mt-1">
          <MapPin className="text-orange-500 h-4 w-4 mr-1" />
          <span>{typeof trip.location === 'string' ? trip.location : 'Location unknown'}</span>
          <span className="mx-2">•</span>
          <span>{typeof trip.duration === 'string' ? trip.duration : 'Duration unknown'}</span>
        </div>
      </div>
      
      <div className="bg-neutral-100 p-1 rounded-md text-sm mb-4">
        <div className="flex items-center">
          <span 
            className={cn(
              "px-3 py-1.5 rounded cursor-pointer",
              activeTab === "overview" 
                ? "bg-white text-primary font-medium" 
                : "text-neutral-600"
            )}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </span>
          <span 
            className={cn(
              "px-3 py-1.5 rounded cursor-pointer",
              activeTab === "itinerary" 
                ? "bg-white text-primary font-medium" 
                : "text-neutral-600"
            )}
            onClick={() => setActiveTab("itinerary")}
          >
            Itinerary
          </span>
          <span 
            className={cn(
              "px-3 py-1.5 rounded cursor-pointer",
              activeTab === "details" 
                ? "bg-white text-primary font-medium" 
                : "text-neutral-600"
            )}
            onClick={() => setActiveTab("details")}
          >
            Details
          </span>
        </div>
      </div>
      
      {activeTab === "overview" && (
        <>
          <p className="text-neutral-700 text-sm mb-3">
            {typeof trip.description === 'string' ? trip.description : 'No description available yet.'}
          </p>
          
          <div className="bg-neutral-50 rounded-lg p-3 mb-4">
            <h4 className="font-medium text-neutral-800 mb-1">Why We Chose This</h4>
            <p className="text-sm text-neutral-700">
              {typeof trip.whyWeChoseThis === 'string' ? trip.whyWeChoseThis : 'Information coming soon.'}
            </p>
          </div>
          
          <MapView 
            mapCenter={trip.mapCenter} 
            markers={trip.markers} 
            journey={trip.journey} 
          />
          
          <JourneyOverview journey={trip.journey} />
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-neutral-50 p-3 rounded-lg">
              <h4 className="text-sm font-medium text-neutral-700">Difficulty Level</h4>
              <p className="text-neutral-800 font-medium">
                {typeof trip.difficultyLevel === 'string' ? trip.difficultyLevel : 'Moderate'}
              </p>
            </div>
            <div className="bg-neutral-50 p-3 rounded-lg">
              <h4 className="text-sm font-medium text-neutral-700">Price Estimate</h4>
              <p className="text-neutral-800 font-medium">
                {typeof trip.priceEstimate === 'string' ? trip.priceEstimate : 'Varies'}
              </p>
            </div>
          </div>
        </>
      )}
      
      {activeTab === "itinerary" && (
        <div className="space-y-4">
          {Array.isArray(trip.itinerary) ? (
            trip.itinerary.map((day) => (
              <div key={day.day || Math.random()} className="border-l-2 border-primary pl-4 pb-2">
                <h4 className="font-medium">
                  Day {day.day || '?'}: {typeof day.title === 'string' ? day.title : 'Activities'}
                </h4>
                <p className="text-sm text-neutral-700 mt-1">
                  {typeof day.description === 'string' ? day.description : 'Details coming soon.'}
                </p>
                {Array.isArray(day.activities) && day.activities.length > 0 && (
                  <div className="mt-2">
                    <h5 className="text-sm font-medium">Activities:</h5>
                    <ul className="list-disc list-inside text-sm text-neutral-700">
                      {day.activities.map((activity, index) => (
                        <li key={index}>{typeof activity === 'string' ? activity : 'Activity details'}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {day.accommodation && (
                  <div className="mt-2 text-sm">
                    <span className="font-medium">Stay: </span>
                    <span>{day.accommodation}</span>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-neutral-600 text-sm">Itinerary is being prepared. Check back soon!</p>
          )}
        </div>
      )}
      
      {activeTab === "details" && (
        <div className="space-y-4">
          <div className="bg-neutral-50 p-3 rounded-lg">
            <h4 className="font-medium flex items-center gap-1">
              <Info className="h-4 w-4" /> Guides & Outfitters
            </h4>
            {Array.isArray(trip.suggestedGuides) && trip.suggestedGuides.length > 0 ? (
              <ul className="mt-2 space-y-2">
                {trip.suggestedGuides.map((guide, index) => (
                  <li key={index} className="text-sm">{typeof guide === 'string' ? guide : 'Local guide'}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-neutral-600">Recommended guides will be provided soon.</p>
            )}
          </div>
          
          <div className="bg-neutral-50 p-3 rounded-lg">
            <h4 className="font-medium flex items-center gap-1">
              <CalendarDays className="h-4 w-4" /> Best Time to Visit
            </h4>
            <p className="mt-1 text-sm">
              June to September offers the best conditions for this trip, with July and August being ideal for both hiking and kayaking.
            </p>
          </div>
        </div>
      )}
      
      <div className="flex justify-between">
        <button className="px-4 py-2 border border-primary rounded-lg text-primary font-medium text-sm">
          Save Trip
        </button>
        <button className="px-4 py-2 bg-primary text-white rounded-lg font-medium text-sm">
          Refine This Trip
        </button>
      </div>
    </div>
  );
}
