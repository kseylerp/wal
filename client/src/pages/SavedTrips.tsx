import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';

interface SavedTrip {
  id: string;
  title: string;
  location: string;
  duration: string;
  dateAdded: string;
}

const SavedTrips: React.FC = () => {
  const [savedTrips, setSavedTrips] = useState<SavedTrip[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Load saved trips from localStorage
    try {
      const savedTripsJSON = localStorage.getItem('savedTrips');
      if (savedTripsJSON) {
        const trips = JSON.parse(savedTripsJSON);
        setSavedTrips(trips);
      }
    } catch (err) {
      console.error('Error loading saved trips:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeSavedTrip = (tripId: string) => {
    try {
      // Filter out the selected trip
      const updatedTrips = savedTrips.filter(trip => trip.id !== tripId);
      
      // Update state
      setSavedTrips(updatedTrips);
      
      // Save back to localStorage
      localStorage.setItem('savedTrips', JSON.stringify(updatedTrips));
    } catch (err) {
      console.error('Error removing saved trip:', err);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (e) {
      return 'Unknown date';
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary">Saved Trips</h1>
        <Link to="/" className="text-primary hover:underline flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Chat
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : savedTrips.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6-3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <h2 className="mt-4 text-lg font-medium text-gray-700">No Saved Trips</h2>
          <p className="mt-2 text-gray-500">
            You haven't saved any trips yet. Chat with our AI to discover and save exciting adventures!
          </p>
          <Link to="/" className="mt-4 inline-block bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition-colors">
            Start Exploring
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedTrips.map((trip) => (
            <div key={trip.id} className="border rounded-lg overflow-hidden shadow-sm bg-white hover:shadow-md transition-shadow">
              <div className="p-4">
                <h2 className="text-lg font-bold mb-2">{trip.title}</h2>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {trip.location && (
                    <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded">
                      {trip.location}
                    </span>
                  )}
                  {trip.duration && (
                    <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                      {trip.duration}
                    </span>
                  )}
                </div>
                
                <div className="text-xs text-gray-500 mb-4">
                  Saved on {formatDate(trip.dateAdded)}
                </div>
                
                <div className="flex justify-between">
                  <a 
                    href={`/map?id=${trip.id}`}
                    className="bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 rounded text-sm"
                  >
                    View Map
                  </a>
                  <button
                    onClick={() => removeSavedTrip(trip.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedTrips;