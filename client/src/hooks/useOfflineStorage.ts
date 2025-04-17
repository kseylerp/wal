import { useState, useEffect } from 'react';
import { Trip } from '@shared/schema';

type SyncStatus = 'pending' | 'synced' | 'failed';

type OfflineTrip = Trip & {
  offlineId?: string;
  syncStatus: SyncStatus;
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

  // Load trips from localStorage on initial render
  useEffect(() => {
    loadTrips();
    
    // Setup online/offline event listeners
    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);
    
    return () => {
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);
    };
  }, []);

  // Handle online/offline status changes
  const handleOnlineStatusChange = () => {
    setSyncStatus(prev => ({
      ...prev,
      isOnline: navigator.onLine
    }));
  };

  // Load trips from localStorage
  const loadTrips = () => {
    try {
      // Load trips
      const storedTrips = localStorage.getItem('offlineTrips');
      if (storedTrips) {
        setOfflineTrips(JSON.parse(storedTrips));
      }
      
      // Load sync status
      const storedSyncStatus = localStorage.getItem('syncStatus');
      if (storedSyncStatus) {
        setSyncStatus({
          ...JSON.parse(storedSyncStatus),
          isOnline: navigator.onLine
        });
      }
    } catch (error) {
      console.error('Error loading offline trips:', error);
    }
  };

  // Save trips to localStorage
  const saveTrips = (trips: OfflineTrip[]) => {
    try {
      localStorage.setItem('offlineTrips', JSON.stringify(trips));
      setOfflineTrips(trips);
    } catch (error) {
      console.error('Error saving offline trips:', error);
    }
  };

  /**
   * Save a trip to offline storage
   */
  const saveOfflineTrip = (trip: Trip): OfflineTrip => {
    const offlineTrip: OfflineTrip = {
      ...trip,
      offlineId: trip.id ? `offline-${trip.id}` : `offline-${Date.now()}`,
      syncStatus: 'pending',
      lastModified: new Date().toISOString()
    };
    
    const updatedTrips = [...offlineTrips];
    const existingIndex = updatedTrips.findIndex(t => 
      t.id === trip.id || t.offlineId === offlineTrip.offlineId
    );
    
    if (existingIndex >= 0) {
      updatedTrips[existingIndex] = offlineTrip;
    } else {
      updatedTrips.push(offlineTrip);
    }
    
    saveTrips(updatedTrips);
    return offlineTrip;
  };

  /**
   * Remove a trip from offline storage
   */
  const removeOfflineTrip = (tripId: number | string): boolean => {
    const updatedTrips = offlineTrips.filter(trip => 
      trip.id !== tripId && trip.offlineId !== `offline-${tripId}`
    );
    
    if (updatedTrips.length !== offlineTrips.length) {
      saveTrips(updatedTrips);
      return true;
    }
    
    return false;
  };

  /**
   * Update the sync status of an offline trip
   */
  const updateTripSyncStatus = (tripId: number | string, status: SyncStatus): boolean => {
    const updatedTrips = [...offlineTrips];
    const index = updatedTrips.findIndex(trip => 
      trip.id === tripId || trip.offlineId === `offline-${tripId}`
    );
    
    if (index >= 0) {
      updatedTrips[index] = {
        ...updatedTrips[index],
        syncStatus: status,
        lastModified: new Date().toISOString()
      };
      
      saveTrips(updatedTrips);
      return true;
    }
    
    return false;
  };

  /**
   * Get all trips from offline storage
   */
  const getAllOfflineTrips = (): OfflineTrip[] => {
    return offlineTrips;
  };

  /**
   * Get a specific trip from offline storage
   */
  const getOfflineTrip = (tripId: number | string): OfflineTrip | null => {
    const trip = offlineTrips.find(t => 
      t.id === tripId || t.offlineId === `offline-${tripId}`
    );
    
    return trip || null;
  };

  /**
   * Check if a trip exists in offline storage
   */
  const hasTripOffline = (tripId: number | string): boolean => {
    return offlineTrips.some(trip => 
      trip.id === tripId || trip.offlineId === `offline-${tripId}`
    );
  };

  /**
   * Clear all offline trips
   */
  const clearOfflineTrips = (): void => {
    localStorage.removeItem('offlineTrips');
    setOfflineTrips([]);
  };

  /**
   * Update the last sync attempt timestamp
   */
  const updateLastSyncAttempt = (): void => {
    const now = new Date().toISOString();
    const updatedStatus = {
      ...syncStatus,
      lastSyncAttempt: now
    };
    
    localStorage.setItem('syncStatus', JSON.stringify(updatedStatus));
    setSyncStatus(updatedStatus);
  };

  return {
    offlineTrips,
    syncStatus,
    saveOfflineTrip,
    removeOfflineTrip,
    updateTripSyncStatus,
    getAllOfflineTrips,
    getOfflineTrip,
    hasTripOffline,
    clearOfflineTrips,
    updateLastSyncAttempt
  };
}