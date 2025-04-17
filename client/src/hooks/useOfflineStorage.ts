import { useState, useEffect } from 'react';
import { Trip } from '@shared/schema';

const OFFLINE_TRIPS_KEY = 'offbeat_offline_trips';
const OFFLINE_SYNC_STATUS_KEY = 'offbeat_offline_sync_status';

type OfflineTrip = Trip & {
  offlineId?: string;
  syncStatus: 'pending' | 'synced' | 'failed';
  lastModified: string;
};

interface OfflineSyncStatus {
  lastSyncAttempt: string | null;
  isOnline: boolean;
}

/**
 * Hook for managing offline trip storage using localStorage
 */
export function useOfflineStorage() {
  const [offlineTrips, setOfflineTrips] = useState<OfflineTrip[]>([]);
  const [syncStatus, setSyncStatus] = useState<OfflineSyncStatus>({
    lastSyncAttempt: null,
    isOnline: navigator.onLine
  });

  // Load offline trips from localStorage on initial mount
  useEffect(() => {
    const loadOfflineData = () => {
      try {
        // Load trips
        const storedTrips = localStorage.getItem(OFFLINE_TRIPS_KEY);
        if (storedTrips) {
          setOfflineTrips(JSON.parse(storedTrips));
        }

        // Load sync status
        const storedSyncStatus = localStorage.getItem(OFFLINE_SYNC_STATUS_KEY);
        if (storedSyncStatus) {
          setSyncStatus(JSON.parse(storedSyncStatus));
        }
      } catch (error) {
        console.error('Error loading offline data:', error);
      }
    };

    loadOfflineData();
  }, []);

  // Update localStorage when offlineTrips changes
  useEffect(() => {
    try {
      localStorage.setItem(OFFLINE_TRIPS_KEY, JSON.stringify(offlineTrips));
    } catch (error) {
      console.error('Error saving offline trips:', error);
    }
  }, [offlineTrips]);

  // Update localStorage when syncStatus changes
  useEffect(() => {
    try {
      localStorage.setItem(OFFLINE_SYNC_STATUS_KEY, JSON.stringify(syncStatus));
    } catch (error) {
      console.error('Error saving sync status:', error);
    }
  }, [syncStatus]);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnlineStatus = () => {
      setSyncStatus(prev => ({
        ...prev,
        isOnline: navigator.onLine
      }));
    };

    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);

    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []);

  /**
   * Save a trip to offline storage
   */
  const saveOfflineTrip = (trip: Trip): OfflineTrip => {
    const offlineTrip: OfflineTrip = {
      ...trip,
      syncStatus: 'pending',
      lastModified: new Date().toISOString(),
      // Generate an offline ID if the trip doesn't have an ID yet
      ...(typeof trip.id !== 'number' && { offlineId: `offline-${Date.now()}` })
    };

    setOfflineTrips(prev => {
      // Check if this trip already exists in offline storage
      const existingIndex = prev.findIndex(t => 
        (typeof t.id === 'number' && t.id === trip.id) || 
        (t.offlineId && t.offlineId === offlineTrip.offlineId)
      );

      if (existingIndex >= 0) {
        // Update existing trip
        const updated = [...prev];
        updated[existingIndex] = offlineTrip;
        return updated;
      } else {
        // Add new trip
        return [...prev, offlineTrip];
      }
    });

    return offlineTrip;
  };

  /**
   * Remove a trip from offline storage
   */
  const removeOfflineTrip = (tripId: number | string) => {
    setOfflineTrips(prev => prev.filter(trip => 
      !(typeof trip.id === 'number' && trip.id === tripId) && 
      !(trip.offlineId && trip.offlineId === tripId)
    ));
  };

  /**
   * Update the sync status of an offline trip
   */
  const updateTripSyncStatus = (tripId: number | string, status: 'pending' | 'synced' | 'failed') => {
    setOfflineTrips(prev => prev.map(trip => {
      if ((typeof trip.id === 'number' && trip.id === tripId) || 
          (trip.offlineId && trip.offlineId === tripId)) {
        return {
          ...trip,
          syncStatus: status,
          lastModified: new Date().toISOString()
        };
      }
      return trip;
    }));
  };

  /**
   * Get all trips from offline storage
   */
  const getOfflineTrips = (): OfflineTrip[] => {
    return offlineTrips;
  };

  /**
   * Get a specific trip from offline storage
   */
  const getOfflineTrip = (tripId: number | string): OfflineTrip | undefined => {
    return offlineTrips.find(trip => 
      (typeof trip.id === 'number' && trip.id === tripId) || 
      (trip.offlineId && trip.offlineId === tripId)
    );
  };

  /**
   * Check if a trip exists in offline storage
   */
  const hasOfflineTrip = (tripId: number | string): boolean => {
    return offlineTrips.some(trip => 
      (typeof trip.id === 'number' && trip.id === tripId) || 
      (trip.offlineId && trip.offlineId === tripId)
    );
  };

  /**
   * Clear all offline trips
   */
  const clearOfflineTrips = () => {
    setOfflineTrips([]);
    localStorage.removeItem(OFFLINE_TRIPS_KEY);
  };

  /**
   * Update the last sync attempt timestamp
   */
  const updateLastSyncAttempt = () => {
    setSyncStatus(prev => ({
      ...prev,
      lastSyncAttempt: new Date().toISOString()
    }));
  };

  return {
    offlineTrips,
    syncStatus,
    saveOfflineTrip,
    removeOfflineTrip,
    updateTripSyncStatus,
    getOfflineTrips,
    getOfflineTrip,
    hasOfflineTrip,
    clearOfflineTrips,
    updateLastSyncAttempt
  };
}