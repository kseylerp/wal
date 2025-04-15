import { TripData } from "@/types/chat";

// Define custom activity types that extend the ones in journey segments
type ActivityMode = 'walking' | 'driving' | 'cycling' | 'transit' | 'biking' | 'hiking' | 'rafting';

// This data comes from the OpenAI API response
// The newest coordinates are from actual locations in the San Juan Mountains, Colorado
export const COLORADO_TRIP_DATA: TripData = {
  "id": "san-juans-wild-loop",
  "title": "San Juans Wild Loop: Camp, Bike, Hike & Raft",
  "description": "Loop journey through Colorado's wildest peaks. Bike the alpine passes, summit remote 13ers, raft the Animas River, and camp beneath the stars.",
  "whyWeChoseThis": "Based on your interest in mountain biking, hiking, and rafting in a natural setting, this San Juan Mountains adventure offers all three activities in one of America's most dramatic mountain ranges. This loop balances high-intensity outdoor activities with incredible wilderness experiences and family-friendly options.",
  "difficultyLevel": "High",
  "priceEstimate": "$1,800 - $2,500 per person",
  "duration": "10 Days",
  "location": "San Juan Mountains (Durango/Silverton/Ouray/Lake City)",
  "suggestedGuides": [
    "San Juan Expeditions",
    "Mountain Waters Rafting",
    "San Juan Backcountry"
  ],
  // Durango as the center point
  "mapCenter": [-107.8801, 37.2753],
  "markers": [
    {
      "name": "Durango",
      "coordinates": [-107.8801, 37.2753]
    },
    {
      "name": "Silverton",
      "coordinates": [-107.6653, 37.8119]
    },
    {
      "name": "Engineer Pass",
      "coordinates": [-107.6028, 37.9722]
    },
    {
      "name": "Lake City",
      "coordinates": [-107.3150, 38.0302]
    },
    {
      "name": "Handies Peak",
      "coordinates": [-107.5044, 37.9129]
    },
    {
      "name": "Ouray",
      "coordinates": [-107.6714, 38.0228]
    },
    {
      "name": "Animas River",
      "coordinates": [-107.8801, 37.3366]
    }
  ],
  "journey": {
    "segments": [
      {
        "mode": "biking",
        "from": "Durango",
        "to": "Silverton",
        "distance": 82000, // 51 miles
        "duration": 21600, // 6 hours
        "geometry": {
          "type": "LineString",
          "coordinates": [
            [-107.8801, 37.2753], // Durango
            [-107.8007, 37.4416], // Intermediate point
            [-107.7559, 37.5683], // Intermediate point
            [-107.6974, 37.6788], // Intermediate point
            [-107.6653, 37.8119]  // Silverton
          ]
        }
      },
      {
        "mode": "biking",
        "from": "Silverton",
        "to": "Engineer Pass",
        "distance": 24000, // 15 miles
        "duration": 10800, // 3 hours
        "geometry": {
          "type": "LineString",
          "coordinates": [
            [-107.6653, 37.8119], // Silverton
            [-107.6574, 37.8823], // Intermediate point
            [-107.6363, 37.9237], // Intermediate point
            [-107.6028, 37.9722]  // Engineer Pass
          ]
        }
      },
      {
        "mode": "hiking",
        "from": "Engineer Pass",
        "to": "Handies Peak",
        "distance": 12000, // 7.5 miles round trip
        "duration": 18000, // 5 hours
        "geometry": {
          "type": "LineString",
          "coordinates": [
            [-107.6028, 37.9722], // Engineer Pass
            [-107.5743, 37.9522], // Intermediate point
            [-107.5411, 37.9284], // Intermediate point
            [-107.5044, 37.9129]  // Handies Peak
          ]
        }
      },
      {
        "mode": "driving",
        "from": "Engineer Pass",
        "to": "Ouray",
        "distance": 32000, // 20 miles
        "duration": 7200, // 2 hours (4x4 road)
        "geometry": {
          "type": "LineString",
          "coordinates": [
            [-107.6028, 37.9722], // Engineer Pass
            [-107.6328, 37.9922], // Intermediate point
            [-107.6525, 38.0068], // Intermediate point
            [-107.6714, 38.0228]  // Ouray
          ]
        }
      },
      {
        "mode": "hiking",
        "from": "Ouray",
        "to": "Blue Lakes Trail",
        "distance": 14500, // 9 miles
        "duration": 18000, // 5 hours
        "geometry": {
          "type": "LineString",
          "coordinates": [
            [-107.6714, 38.0228], // Ouray
            [-107.7314, 38.0047], // Intermediate point
            [-107.7814, 37.9867], // Intermediate point
            [-107.8164, 37.9687]  // Blue Lakes
          ]
        }
      },
      {
        "mode": "driving",
        "from": "Ouray",
        "to": "Durango",
        "distance": 113000, // 70 miles
        "duration": 7200, // 2 hours
        "geometry": {
          "type": "LineString",
          "coordinates": [
            [-107.6714, 38.0228], // Ouray
            [-107.6805, 37.8563], // Intermediate point
            [-107.7655, 37.6388], // Intermediate point
            [-107.8306, 37.4534], // Intermediate point
            [-107.8801, 37.2753]  // Durango
          ]
        }
      },
      {
        "mode": "rafting",
        "from": "Durango",
        "to": "Animas River Trip",
        "distance": 24000, // 15 miles
        "duration": 18000, // 5 hours
        "geometry": {
          "type": "LineString",
          "coordinates": [
            [-107.8801, 37.2753], // Durango
            [-107.8814, 37.2989], // Intermediate point
            [-107.8821, 37.3182], // Intermediate point
            [-107.8801, 37.3366]  // Lower Animas
          ]
        }
      }
    ],
    "totalDistance": 301500, // 187.5 miles
    "totalDuration": 100800, // 28 hours
    "bounds": [[-107.8821, 37.2753], [-107.5044, 38.0302]]
  },
  "itinerary": [
    {
      "day": 1,
      "title": "Arrive in Durango",
      "description": "Gear check, acclimatize, and explore historic town.",
      "activities": [
        "Arrive and settle in Durango",
        "Explore historic downtown",
        "Gear check and preparation"
      ],
      "accommodations": "Downtown hostel or airbnb"
    },
    {
      "day": 2,
      "title": "Warm-up Ride in Durango",
      "description": "Get acclimated with warm-up mountain bike rides on local trails.",
      "activities": [
        "Warm-up mountain bike ride on Horse Gulch Trail System",
        "Choose from intermediate or advanced options",
        "Gear up for camping (outdoor shops, provisions)"
      ],
      "accommodations": "Downtown hostel or airbnb"
    },
    {
      "day": 3,
      "title": "Journey to Silverton",
      "description": "Epic bike ride or shuttle to Silverton via the Million Dollar Highway.",
      "activities": [
        "Bike or shuttle to Silverton",
        "Travel along the scenic Million Dollar Highway",
        "Arrive and explore historic mining town"
      ],
      "accommodations": "Remote tent camping"
    },
    {
      "day": 4,
      "title": "Engineer Pass Adventure",
      "description": "Bike/4x4 up to Engineer Pass with stunning alpine views.",
      "activities": [
        "Bike/4x4 up Cinnamon/Engineer Pass",
        "Rental shuttle possible for bikes",
        "Setup basecamp near Lake City"
      ],
      "accommodations": "Remote tent camping"
    },
    {
      "day": 5,
      "title": "Summit Handies Peak",
      "description": "Hike a Colorado 14er with panoramic mountain views.",
      "activities": [
        "Summit Handies Peak (14er)",
        "Moderate advanced hike, 5.5mi round trip",
        "Explore alpine lakes and wildflowers"
      ],
      "accommodations": "Remote tent camping"
    },
    {
      "day": 6,
      "title": "Travel to Ouray",
      "description": "Journey to Ouray, known as the 'Switzerland of America'.",
      "activities": [
        "Shuttle to Ouray",
        "Soak in local hot springs",
        "Explore the charming mountain town"
      ],
      "accommodations": "Cabin or Ouray Campground"
    },
    {
      "day": 7,
      "title": "Ouray Hiking Day",
      "description": "Epic mountain hiking on premier alpine trails.",
      "activities": [
        "Hike on Blue Lakes or Bear Creek National Recreation Trail",
        "10+ mile option with stunning views",
        "Optional Via Ferrata (guided only)"
      ],
      "accommodations": "Cabin or Ouray Campground"
    },
    {
      "day": 8,
      "title": "Return to Durango",
      "description": "Scenic drive back to Durango to prepare for rafting.",
      "activities": [
        "Drive back to Durango",
        "Prepare for rafting adventure",
        "Evening in historic downtown"
      ],
      "accommodations": "Riverside campground or hostel"
    },
    {
      "day": 9,
      "title": "Animas River Rafting",
      "description": "Thrilling whitewater rafting on the Animas River.",
      "activities": [
        "Full-day whitewater raft on Upper Animas",
        "Class IV sections (can be adjusted for experience level)",
        "Bike the Animas River Greenway for recovery"
      ],
      "accommodations": "Riverside campground or hostel"
    },
    {
      "day": 10,
      "title": "Departure Day",
      "description": "Final morning in Durango before departing.",
      "activities": [
        "Town stroll",
        "Artisan breakfast",
        "Departure from Durango"
      ]
    }
  ]
};

// This is just a utility function to convert our trip data to a form that works better with MapBox
export function prepareMapSegments(tripData: TripData) {
  return tripData.journey.segments.map((segment, index) => {
    // Get start and end coordinates from segment geometry
    const startCoords = segment.geometry.coordinates[0] as [number, number];
    const endCoords = segment.geometry.coordinates[segment.geometry.coordinates.length - 1] as [number, number];
    
    // Map activity types to valid MapBox profiles
    let profile: 'driving' | 'walking' | 'cycling';
    let color: string;
    
    // Type guard to handle the custom activity modes
    const mode = segment.mode as string;
    
    if (mode === 'biking' || mode === 'cycling') {
      profile = 'cycling';
      color = '#f59e0b'; // amber
    } else if (mode === 'hiking' || mode === 'walking') {
      profile = 'walking';
      color = '#10b981'; // green
    } else if (mode === 'rafting') {
      // MapBox doesn't have rafting, so use walking with a different color
      profile = 'walking';
      color = '#3b82f6'; // blue
    } else {
      profile = 'driving';
      color = '#6366f1'; // indigo
    }
    
    return {
      index,
      start: startCoords,
      end: endCoords,
      color,
      name: `${segment.from} to ${segment.to} (${segment.mode})`,
      profile,
      originalSegment: segment
    };
  });
}