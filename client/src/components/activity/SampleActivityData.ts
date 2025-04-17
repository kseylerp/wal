import { Activity } from '@/types/trip';

// Sample data for testing the activity timeline
export const generateSampleActivities = (count: number = 5): Activity[] => {
  const activities: Activity[] = [];
  
  const activityTypes = ['hiking', 'biking', 'rafting', 'camping', 'viewpoint', 'photo'];
  const difficulties = ['easy', 'moderate', 'challenging', 'difficult'];
  const locations = [
    'Grand Canyon Rim',
    'Colorado River Trail',
    'Bright Angel Path',
    'Desert View Point',
    'Havasu Falls',
    'Phantom Ranch',
    'Plateau Point',
    'Ribbon Falls',
    'Skeleton Point'
  ];
  
  // Helper to get random item from array
  const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
  
  // Helper to get random number in range
  const getRandomNumber = (min: number, max: number): number => 
    Math.round((Math.random() * (max - min) + min) * 10) / 10;
  
  for (let i = 0; i < count; i++) {
    const day = Math.floor(i / 2) + 1; // Assign ~2 activities per day
    const type = getRandomItem(activityTypes);
    const difficulty = getRandomItem(difficulties);
    
    const activity: Activity = {
      id: `activity-${i + 1}`,
      title: `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      type,
      day,
      difficulty,
      duration_hours: getRandomNumber(1, 5),
      distance: getRandomNumber(2, 15),
      location: getRandomItem(locations),
      description: `A ${difficulty} ${type} activity for day ${day} of your adventure. This activity showcases some of the best views and experiences in the area.`,
      elevation_gain: Math.round(getRandomNumber(100, 1000)),
      highlights: [
        'Scenic Vistas',
        'Wildlife Viewing',
        'Historical Sites',
        'Natural Wonders'
      ].slice(0, Math.floor(Math.random() * 4) + 1),
      hazards: Math.random() > 0.5 ? [
        'Steep Terrain',
        'Weather Changes',
        'Wildlife'
      ].slice(0, Math.floor(Math.random() * 3) + 1) : [],
      water_sources: Math.random() > 0.7 ? ['Stream', 'Lake', 'Spring'] : [],
      photo_spots: Math.random() > 0.4 ? ['Lookout Point', 'Canyon View', 'Sunset Spot'] : []
    };
    
    activities.push(activity);
  }
  
  return activities;
};