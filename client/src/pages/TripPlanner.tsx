import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { TripResponse } from '@/types/trip-schema';

const TripPlanner: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Example trip ideas to inspire users
  const tripIdeas = [
    {
      title: "Colorado Mountain Biking",
      description: "A 7-day mountain biking adventure in Colorado with hiking and camping",
      tags: ["biking", "hiking", "camping"]
    },
    {
      title: "Pacific Northwest Exploration",
      description: "10 days exploring Washington and Oregon's coast and mountains",
      tags: ["hiking", "beaches", "forests"]
    },
    {
      title: "Utah National Parks Tour",
      description: "Visit Utah's Mighty 5 national parks over 2 weeks",
      tags: ["hiking", "photography", "camping"]
    }
  ];

  // Function to apply a trip idea as the query
  const useTripIdea = (idea: typeof tripIdeas[0]) => {
    setQuery(`I want a trip like this: ${idea.title}. ${idea.description}. Include these activities: ${idea.tags.join(', ')}.`);
  };

  // Function to handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      toast({
        title: "Empty Query",
        description: "Please enter details about your desired trip.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Call the API to get trip suggestions
      const response = await apiRequest<TripResponse>('/api/trip-plans', {
        method: 'POST',
        body: JSON.stringify({ query }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response || !response.trips || response.trips.length === 0) {
        throw new Error('No trip suggestions received');
      }
      
      // Store trip data in localStorage for now
      // In a real app, we'd save this to a database
      localStorage.setItem('tripPlans', JSON.stringify(response));
      
      // Navigate to the trip results page
      setLocation('/trip-results');
      
      toast({
        title: "Trip Plans Generated!",
        description: `Created ${response.trips.length} trip suggestions based on your preferences.`,
      });
    } catch (error) {
      console.error('Error generating trip plans:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate trip plans. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-center mb-2">AI Trip Planner</h1>
      <p className="text-center text-gray-600 mb-10">
        Describe your ideal adventure and our AI will create a detailed trip plan with maps, activities, and more.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left section - Trip Ideas */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Trip Ideas</h2>
          <p className="text-sm text-gray-600">
            Need inspiration? Click on one of these trip ideas to use as a starting point.
          </p>
          
          <div className="space-y-4">
            {tripIdeas.map((idea, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => useTripIdea(idea)}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{idea.title}</CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                  <p className="text-sm text-gray-600">{idea.description}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {idea.tags.map((tag, i) => (
                      <Badge key={i} variant="outline" className="bg-primary/10 text-primary text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        {/* Center section - Trip Query Form */}
        <div className="col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Describe Your Dream Trip</CardTitle>
              <CardDescription>
                Tell us about the activities, locations, duration, and any preferences you have.
                The more details you provide, the better your trip plan will be.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Textarea
                      placeholder="Example: I want a 7-day trip in Colorado that includes mountain biking, hiking, and camping. I prefer intermediate trails and would like to visit some hot springs. I'm traveling in July with my partner who loves photography."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="min-h-[200px]"
                    />
                  </div>
                  <div className="text-sm text-gray-500">
                    <p className="font-medium mb-1">For best results, include:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Activities you want to do (hiking, biking, rafting, etc.)</li>
                      <li>Trip duration and preferred season</li>
                      <li>Difficulty level and experience</li>
                      <li>Accommodation preferences (camping, hotels, etc.)</li>
                      <li>Any specific destinations or regions</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading || !query.trim()}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating Trip Plan...
                    </>
                  ) : (
                    'Create My Trip Plan'
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
          
          <div className="mt-6 bg-yellow-50 border border-yellow-100 rounded-lg p-4">
            <h3 className="font-medium text-yellow-800">About This Tool</h3>
            <p className="text-sm text-yellow-700 mt-1">
              This AI trip planner uses OpenAI's advanced models to create personalized adventure trips.
              It generates real routes, elevation data, and detailed itineraries. Please note that while
              the geographic data is accurate, you should always verify details before booking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripPlanner;