import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Trash2, Map, CalendarDays, DollarSign, MapPin, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Trip } from "@shared/schema";
import { useLocation } from "wouter";

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}

function ProfileContent() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  // Fetch user's saved trips
  const { data: trips, isLoading, isError } = useQuery<Trip[]>({
    queryKey: ['/api/trips'],
    queryFn: getQueryFn({ on401: 'throw' }),
  });

  const handleDeleteTrip = async (tripId: number) => {
    setIsDeleting(tripId);
    try {
      await apiRequest('DELETE', `/api/trips/${tripId}`);
      // Invalidate the trips query to refetch
      queryClient.invalidateQueries({ queryKey: ['/api/trips'] });
      toast({
        title: "Trip deleted",
        description: "The trip has been removed from your saved trips",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete trip. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const handleViewTrip = (tripId: number) => {
    setLocation(`/trips/${tripId}`);
  };

  const handleEditTrip = (tripId: number) => {
    // TODO: Implement edit functionality
    setLocation(`/trips/${tripId}/edit`);
  };

  const handleLogout = async () => {
    await logout();
    setLocation('/');
  };

  return (
    <div className="min-h-screen bg-[#fcf8f5] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
              <p className="text-gray-600">Welcome back, {user?.username}</p>
            </div>
            <Button variant="ghost" onClick={handleLogout}>
              Log out
            </Button>
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-4">My Saved Trips</h2>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : isError ? (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg">
            Failed to load your trips. Please try again.
          </div>
        ) : !trips || trips.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-500 mb-4">You don't have any saved trips yet.</p>
            <Button onClick={() => setLocation('/')}>Plan a New Adventure</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <Card key={trip.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{trip.title}</CardTitle>
                  <CardDescription className="flex items-center text-sm">
                    <MapPin className="h-3.5 w-3.5 mr-1" />
                    {trip.location}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pb-3 pt-0">
                  <div className="flex space-x-4 mb-3 text-sm text-gray-500">
                    <div className="flex items-center">
                      <CalendarDays className="h-3.5 w-3.5 mr-1" />
                      <span>{trip.duration}</span>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-3.5 w-3.5 mr-1" />
                      <span>{trip.priceEstimate}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2">{trip.description}</p>
                </CardContent>
                
                <CardFooter className="pt-0 flex justify-between">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleViewTrip(trip.id)}
                  >
                    <Map className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditTrip(trip.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTrip(trip.id)}
                      disabled={isDeleting === trip.id}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      {isDeleting === trip.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}