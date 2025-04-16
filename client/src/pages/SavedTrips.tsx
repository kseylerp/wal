import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { getQueryFn } from '@/lib/queryClient';
import { Trip } from '@shared/schema';
import { Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TripCard from '@/components/trip/TripCard';
import { useAuth } from '@/hooks/useAuth';

export default function SavedTrips() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  
  // Fetch the user's saved trips from the API
  const { 
    data: trips,
    isLoading,
    error
  } = useQuery<Trip[]>({
    queryKey: ['/api/trips'],
    queryFn: getQueryFn({ on401: 'throw' }),
    enabled: !!user,
  });
  
  const handleEditTrip = (id: number) => {
    // This would typically open a trip details view
    console.log(`Editing trip ${id}`);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Your Saved Trips</h1>
        <Link to="/">
          <Button variant="outline" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Trip
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="bg-red-50 rounded-lg p-8 text-center">
          <h2 className="text-lg font-medium text-red-800">Error Loading Trips</h2>
          <p className="mt-2 text-red-600">
            We couldn't load your saved trips. Please try again later.
          </p>
          <Button 
            variant="default" 
            onClick={() => window.location.reload()}
            className="mt-4"
          >
            Retry
          </Button>
        </div>
      ) : trips?.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-8 w-8 text-gray-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6-3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" 
              />
            </svg>
          </div>
          <h2 className="mt-4 text-lg font-medium text-gray-700">No Saved Trips</h2>
          <p className="mt-2 text-gray-500">
            You haven't saved any trips yet. Chat with <span className="text-[#FB8C9A] font-medium">Wally</span> to discover and save exciting adventures!
          </p>
          <Link to="/">
            <Button 
              variant="default" 
              className="mt-4 bg-[#655590] hover:bg-[#655590]/90"
            >
              Start Exploring
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {trips?.map((trip) => (
            <TripCard
              key={trip.id}
              id={trip.id}
              title={trip.title}
              description={trip.description}
              location={trip.location}
              duration={trip.duration}
              difficultyLevel={trip.difficultyLevel}
              priceEstimate={trip.priceEstimate}
              mapCenter={trip.mapCenter as [number, number]}
              journey={trip.journeyData}
              itinerary={trip.itinerary}
              createdAt={trip.createdAt}
              onEdit={handleEditTrip}
            />
          ))}
        </div>
      )}
    </div>
  );
}