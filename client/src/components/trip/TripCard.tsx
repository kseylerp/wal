import React, { useState } from 'react';
import { TripCardProps } from '@/types/trip';
import JourneyMap from './JourneyMap';
import ItineraryList from './ItineraryList';
import { 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  DollarSign, 
  Map, 
  Activity, 
  BarChart, 
  ThumbsUp, 
  Heart
} from 'lucide-react';

const TripCard: React.FC<TripCardProps> = ({
  id,
  title,
  description,
  whyWeChoseThis,
  difficultyLevel,
  priceEstimate,
  duration,
  location,
  suggestedGuides,
  mapCenter,
  markers,
  journey,
  itinerary,
  onModifyRequest
}) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'itinerary' | 'about'>('itinerary');

  const toggleDetails = () => {
    setIsDetailsOpen(!isDetailsOpen);
  };

  const toggleMapExpand = () => {
    setIsMapExpanded(!isMapExpanded);
  };

  return (
    <div className="trip-card bg-white border border-gray-200 overflow-hidden rounded-2xl transition-transform duration-200 hover:translate-y-[-2px] hover:shadow-lg">
      <div className="relative">
        {/* Use background color instead of image */}
        <div className="w-full h-56 bg-gradient-to-r from-primary/50 to-primary/70 flex items-center justify-center relative">
          <span className="text-white text-2xl font-bold drop-shadow-md">{location}</span>
          
          {/* Trip stats overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/40 p-3 flex flex-wrap justify-between items-center gap-2">
            <div className="flex items-center text-white">
              <Clock className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">{duration}</span>
            </div>
            
            <div className="flex items-center text-white">
              <DollarSign className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">{priceEstimate}</span>
            </div>
            
            <div className="flex items-center text-white">
              <BarChart className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">{difficultyLevel}</span>
            </div>
            
            <div className="flex items-center text-white">
              <Map className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">{(journey.totalDistance * 0.621371).toFixed(1)} miles</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        
        {/* Trip summary */}
        <div className="mt-2 mb-4">
          <p className="text-gray-700 text-sm">{description}</p>
        </div>
        
        {/* Journey Map */}
        <JourneyMap
          mapId={id}
          center={mapCenter}
          markers={markers}
          journey={journey}
          isExpanded={isMapExpanded}
          toggleExpand={toggleMapExpand}
        />
        
        {/* Journey Stats */}
        <div className="grid grid-cols-2 gap-2 my-3">
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center text-sm text-gray-500 mb-1">
              <Clock className="h-4 w-4 mr-1" />
              Total Duration
            </div>
            <div className="text-gray-900 font-medium">
              {Math.round(journey.totalDuration / 3600)} hours
            </div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center text-sm text-gray-500 mb-1">
              <Map className="h-4 w-4 mr-1" />
              Total Distance
            </div>
            <div className="text-gray-900 font-medium">
              {(journey.totalDistance * 0.621371).toFixed(1)} miles
            </div>
          </div>
        </div>
        
        {/* Expand/Collapse Button */}
        <button
          type="button"
          className="w-full mt-2 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-50 hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          onClick={toggleDetails}
        >
          <span>{isDetailsOpen ? 'Hide Details' : 'Show Details'}</span>
          {isDetailsOpen ? (
            <ChevronUp className="ml-2 h-4 w-4" />
          ) : (
            <ChevronDown className="ml-2 h-4 w-4" />
          )}
        </button>
        
        {/* Collapsible Details */}
        {isDetailsOpen && (
          <div className="mt-4">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-4">
              <button
                className={`py-2 px-4 text-sm font-medium ${
                  activeTab === 'itinerary' 
                    ? 'text-primary border-b-2 border-primary' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('itinerary')}
              >
                Itinerary
              </button>
              <button
                className={`py-2 px-4 text-sm font-medium ${
                  activeTab === 'about' 
                    ? 'text-primary border-b-2 border-primary' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('about')}
              >
                About This Trip
              </button>
            </div>
            
            {activeTab === 'itinerary' && (
              <ItineraryList 
                itinerary={itinerary} 
                suggestedGuides={suggestedGuides} 
              />
            )}
            
            {activeTab === 'about' && (
              <div className="text-sm text-gray-700">
                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <Heart className="w-5 h-5 text-primary mr-2" />
                    <h4 className="font-medium text-gray-900">Why We Chose This Trip</h4>
                  </div>
                  <p>{whyWeChoseThis}</p>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <Activity className="w-5 h-5 text-primary mr-2" />
                    <h4 className="font-medium text-gray-900">Journey Details</h4>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                    <p><strong>Total Distance:</strong> {(journey.totalDistance * 0.621371).toFixed(1)} miles</p>
                    <p><strong>Total Duration:</strong> {Math.round(journey.totalDuration / 3600)} hours</p>
                    <p><strong>Travel Modes:</strong> {journey.segments.map(s => s.mode.charAt(0).toUpperCase() + s.mode.slice(1)).join(', ')}</p>
                    {journey.segments.some(s => s.terrain) && (
                      <p>
                        <strong>Terrain Types:</strong> {journey.segments
                          .filter(s => s.terrain)
                          .map(s => s.terrain!.charAt(0).toUpperCase() + s.terrain!.slice(1))
                          .join(', ')}
                      </p>
                    )}
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center mb-2">
                    <ThumbsUp className="w-5 h-5 text-primary mr-2" />
                    <h4 className="font-medium text-gray-900">Trip Information</h4>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                    <p><strong>Difficulty Level:</strong> {difficultyLevel}</p>
                    <p><strong>Price Range:</strong> {priceEstimate}</p>
                    <p><strong>Duration:</strong> {duration}</p>
                    <p><strong>Location:</strong> {location}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => onModifyRequest(id)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Modify This Trip
          </button>
        </div>
      </div>
    </div>
  );
};

export default TripCard;
