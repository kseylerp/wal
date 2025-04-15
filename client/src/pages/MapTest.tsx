import React, { useEffect, useState } from 'react';
import { TripData } from '@/types/chat';
import { Button } from '@/components/ui/button';

// Sample request data from actual OpenAI response
const sampleTripData: TripData = {
  id: "sedona-adventure-2023",
  title: "Sedona's Hidden Trails & Vortex Experience",
  description: "A rejuvenating 5-day hiking adventure through Sedona's lesser-known red rock formations, mystical vortex sites, and tranquil wilderness areas.",
  whyWeChoseThis: "Based on your interest in hiking and outdoor adventures with spiritual elements, Sedona offers the perfect blend of challenging trails and energetic vortex sites away from the typical tourist spots. The shoulder season timing avoids crowds while maintaining ideal weather conditions.",
  difficultyLevel: "Intermediate",
  priceEstimate: "$1,500 - $2,200 per person",
  duration: "5 Days",
  location: "Sedona, Arizona",
  suggestedGuides: ["Earth Wisdom Tours", "Red Rock Spiritual Journeys", "Sedona Wild"],
  mapCenter: [-111.76381, 34.86542],
  markers: [
    { name: "Boynton Canyon Vortex", coordinates: [-111.85056, 34.90868] },
    { name: "Secret Slickrock Trail", coordinates: [-111.80647, 34.87921] },
    { name: "Cathedral Rock", coordinates: [-111.79036, 34.82072] },
    { name: "Mystic Trail B&B", coordinates: [-111.76129, 34.86054] }
  ],
  journey: {
    segments: [
      {
        mode: "driving",
        from: "Sedona Airport",
        to: "Mystic Trail B&B",
        distance: 8200,
        duration: 900,
        geometry: {
          type: "LineString",
          coordinates: [
            [-111.79012, 34.84857],
            [-111.77937, 34.85232],
            [-111.76712, 34.85648],
            [-111.76129, 34.86054]
          ]
        }
      },
      {
        mode: "hiking",
        from: "Mystic Trail B&B",
        to: "Boynton Canyon Vortex",
        distance: 12300,
        duration: 14400,
        geometry: {
          type: "LineString",
          coordinates: [
            [-111.76129, 34.86054],
            [-111.78234, 34.87123],
            [-111.81529, 34.88964],
            [-111.83782, 34.90127],
            [-111.85056, 34.90868]
          ]
        }
      }
    ],
    totalDistance: 20500,
    totalDuration: 15300,
    bounds: [[-111.85056, 34.82072], [-111.76129, 34.90868]]
  },
  itinerary: [
    {
      day: 1,
      title: "Arrival & First Vortex Experience",
      description: "Arrive at Sedona Airport, transfer to your accommodation, and take an evening meditation hike to Airport Mesa vortex for sunset.",
      activities: ["Airport pickup", "Check-in at Mystic Trail B&B", "Evening vortex meditation", "Welcome dinner"]
    },
    {
      day: 2,
      title: "Boynton Canyon Spiritual Hike",
      description: "Full-day hike exploring Boynton Canyon, known for its powerful masculine and feminine energy centers. Experience guided meditation at specific energy points.",
      activities: ["Morning yoga", "Boynton Canyon hike (6 miles)", "Vortex meditation sessions", "Picnic lunch on trail"]
    },
    {
      day: 3,
      title: "Secret Slickrock Trail Adventure",
      description: "Explore off-the-beaten-path trails across Sedona's stunning red rock formations with a local guide who knows hidden viewpoints away from crowds.",
      activities: ["Secret Slickrock Trail hike", "Hidden pools swimming", "Native American site visit", "Stargazing session"]
    },
    {
      day: 4,
      title: "Cathedral Rock & Energy Work",
      description: "Morning hike to Cathedral Rock with a spiritual guide for energy alignment work, followed by an afternoon of reflection and optional spa treatments.",
      activities: ["Cathedral Rock hike", "Guided energy alignment session", "Free time for reflection", "Optional spa treatments"]
    },
    {
      day: 5,
      title: "Final Integration & Departure",
      description: "Morning integration session, followed by a final short hike before departure. Take home practices to maintain your energetic connection.",
      activities: ["Morning integration circle", "Final hike to Vista Point", "Practice session for home rituals", "Airport transfer"]
    }
  ]
};

const MapTest: React.FC = () => {
  const [mapboxToken, setMapboxToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState<TripData | null>(null);
  const [showActualData, setShowActualData] = useState(false);

  // Fetch the MapBox token
  useEffect(() => {
    async function fetchToken() {
      try {
        const response = await fetch('/api/config');
        const data = await response.json();
        
        if (data.mapboxToken) {
          setMapboxToken(data.mapboxToken);
          console.log('MapBox token fetched successfully');
          
          // Use the sample trip data since we have a valid token
          setSelectedTrip(sampleTripData);
        } else {
          setError('No MapBox token available');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching token:', err);
        setError('Failed to fetch MapBox token');
        setLoading(false);
      }
    }
    
    fetchToken();
  }, []);
  
  // Function to generate a static Mapbox image URL for a trip
  const generateStaticMapUrl = (trip: TripData): string => {
    // Base URL
    const baseUrl = `https://api.mapbox.com/styles/v1/mapbox/outdoors-v11/static`;
    
    // Generate marker parameters for all points
    const markers = trip.markers.map((marker, index) => {
      // Use different pin colors for visual distinction
      const colors = ['f74e4e', '4e4ef7', '4ef74e', 'f7f74e', 'f74ef7'];
      const color = colors[index % colors.length];
      return `pin-s+${color}(${marker.coordinates[0]},${marker.coordinates[1]})`;
    }).join(',');
    
    // Get center coordinates and zoom level
    // We'll use the center from the trip data and zoom level 9
    const center = `${trip.mapCenter[0]},${trip.mapCenter[1]},9`;
    
    // Image size
    const size = '800x600';
    
    // Assemble the complete URL
    return `${baseUrl}/${markers}/${center}/${size}?access_token=${mapboxToken}`;
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">MapBox Test Page with Real Trip Data</h1>
      
      {loading && (
        <div className="mb-4 p-4 bg-blue-100 rounded">
          <p>Loading map data...</p>
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          <h3 className="font-bold">Error:</h3>
          <p>{error}</p>
        </div>
      )}
      
      {selectedTrip && mapboxToken && (
        <div className="mb-8 p-4 border border-gray-200 rounded-lg shadow-sm">
          <h2 className="text-xl font-bold mb-4">{selectedTrip.title}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-700 mb-4">{selectedTrip.description}</p>
              
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Why We Chose This</h3>
                <p className="text-gray-600">{selectedTrip.whyWeChoseThis}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="font-medium text-gray-900">Difficulty</h4>
                  <p>{selectedTrip.difficultyLevel}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Price</h4>
                  <p>{selectedTrip.priceEstimate}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Duration</h4>
                  <p>{selectedTrip.duration}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Location</h4>
                  <p>{selectedTrip.location}</p>
                </div>
              </div>
              
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Suggested Guides</h3>
                <ul className="list-disc list-inside text-gray-600">
                  {selectedTrip.suggestedGuides.map((guide, index) => (
                    <li key={index}>{guide}</li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Trip Map</h3>
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <img 
                  src={generateStaticMapUrl(selectedTrip)} 
                  alt={`Map of ${selectedTrip.title}`} 
                  className="w-full h-auto"
                />
              </div>
              
              <div className="mt-4 bg-gray-50 p-3 rounded-md">
                <h4 className="font-medium mb-2">Key Locations</h4>
                <ul className="text-sm">
                  {selectedTrip.markers.map((marker, index) => (
                    <li key={index} className="mb-1">
                      <span className="font-medium">{marker.name}:</span> {marker.coordinates[1].toFixed(4)}, {marker.coordinates[0].toFixed(4)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="font-semibold mb-3">Itinerary</h3>
            <div className="space-y-4">
              {selectedTrip.itinerary.map((day) => (
                <div key={day.day} className="border-l-4 border-primary/30 pl-4">
                  <h4 className="font-medium">Day {day.day}: {day.title}</h4>
                  <p className="text-gray-600 text-sm mb-2">{day.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {day.activities.map((activity, i) => (
                      <span key={i} className="bg-primary/10 text-primary text-xs px-2 py-1 rounded">
                        {activity}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h2 className="font-bold mb-2">Technical Information:</h2>
        <p className="mb-2">This page demonstrates how we can use the static MapBox images API to display trip data with markers. This approach is more reliable than dynamic maps in some environments.</p>
        <p className="mb-2">• MapBox Token Status: {mapboxToken ? '✅ Valid' : '❌ Missing'}</p>
        <p className="mb-2">• Trip Data: Using real trip data structure from OpenAI API response</p>
        <p className="mb-2">• Map Style: MapBox Outdoors (ideal for showing hiking trips)</p>
      </div>
    </div>
  );
};

export default MapTest;