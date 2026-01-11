import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  Donor,
  BloodRequest,
  BloodBankInventory,
  BloodType,
  initialDonors,
  initialBloodBank,
  bloodCompatibility,
  dijkstra,
  getAreaName,
} from '@/lib/bloodData';
import { supabase } from '@/integrations/supabase/client';

interface DonorWithDistance {
  donor: Donor;
  route: string[];
  distance: number;
}

interface BloodContextType {
  donors: Donor[];
  requests: BloodRequest[];
  bloodBank: BloodBankInventory[];
  addDonor: (donor: Omit<Donor, 'id'>) => void;
  deleteDonor: (donorId: string) => void;
  updateDonorAvailability: (donorId: string, isAvailable: boolean) => void;
  createRequest: (request: Omit<BloodRequest, 'id' | 'status' | 'createdAt'>) => Promise<BloodRequest>;
  processRequest: (requestId: string) => BloodRequest | null;
  getCompatibleDonors: (bloodType: BloodType) => Donor[];
  getCompatibleBloodTypes: (bloodType: BloodType) => BloodType[];
  findNearestDonor: (bloodType: BloodType, hospitalArea: string) => DonorWithDistance | null;
  findAllDonorsSorted: (bloodType: BloodType, hospitalArea: string) => DonorWithDistance[];
  addBloodUnits: (bloodType: BloodType, units: number) => void;
  removeBloodUnits: (bloodType: BloodType, units: number) => void;
  updateReservedUnits: (bloodType: BloodType, reserved: number) => void;
  recordDonation: (donorId: string, requestId: string, donorName: string, donorEmail: string, bloodType: string, units: number, hospital: string, recipientName: string) => Promise<void>;
  confirmMatch: (requestId: string) => Promise<void>;
  markRequestComplete: (requestId: string) => Promise<void>;
  deleteRequest: (requestId: string) => Promise<void>;
}

const BloodContext = createContext<BloodContextType | undefined>(undefined);

export function BloodProvider({ children }: { children: ReactNode }) {
  const [donors, setDonors] = useState<Donor[]>(initialDonors);
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [bloodBank, setBloodBank] = useState<BloodBankInventory[]>(initialBloodBank);

  const addDonor = (donorData: Omit<Donor, 'id'>) => {
    const newDonor: Donor = {
      ...donorData,
      id: Date.now().toString(),
    };
    setDonors(prev => [...prev, newDonor]);
  };

  const deleteDonor = (donorId: string) => {
    setDonors(prev => prev.filter(d => d.id !== donorId));
  };

  const updateDonorAvailability = (donorId: string, isAvailable: boolean) => {
    setDonors(prev =>
      prev.map(d => (d.id === donorId ? { ...d, isAvailable } : d))
    );
  };

  const addBloodUnits = (bloodType: BloodType, units: number) => {
    setBloodBank(prev =>
      prev.map(b =>
        b.bloodType === bloodType ? { ...b, units: b.units + units } : b
      )
    );
  };

  const removeBloodUnits = (bloodType: BloodType, units: number) => {
    setBloodBank(prev =>
      prev.map(b =>
        b.bloodType === bloodType ? { ...b, units: Math.max(0, b.units - units) } : b
      )
    );
  };

  const updateReservedUnits = (bloodType: BloodType, reserved: number) => {
    setBloodBank(prev =>
      prev.map(b =>
        b.bloodType === bloodType ? { ...b, reserved: Math.max(0, reserved) } : b
      )
    );
  };

  const getCompatibleDonors = (bloodType: BloodType): Donor[] => {
    const compatibleTypes = bloodCompatibility[bloodType];
    return donors.filter(
      d => compatibleTypes.includes(d.bloodType) && d.isAvailable
    );
  };

  const getCompatibleBloodTypes = (bloodType: BloodType): BloodType[] => {
    return bloodCompatibility[bloodType] || [];
  };

  const findAllDonorsSorted = (bloodType: BloodType, hospitalArea: string): DonorWithDistance[] => {
    // Get exact match donors only
    const exactDonors = donors.filter(
      d => d.bloodType === bloodType && d.isAvailable
    );
    
    if (exactDonors.length === 0) return [];

    const donorsWithDistance: DonorWithDistance[] = [];

    for (const donor of exactDonors) {
      const result = dijkstra(hospitalArea, donor.area);
      if (result.distance >= 0) {
        donorsWithDistance.push({
          donor,
          route: result.path.map(getAreaName),
          distance: result.distance,
        });
      }
    }

    // Sort by distance (nearest first)
    return donorsWithDistance.sort((a, b) => a.distance - b.distance);
  };

  const findNearestDonor = (bloodType: BloodType, hospitalArea: string): DonorWithDistance | null => {
    const allDonors = findAllDonorsSorted(bloodType, hospitalArea);
    return allDonors.length > 0 ? allDonors[0] : null;
  };

  const createRequest = async (requestData: Omit<BloodRequest, 'id' | 'status' | 'createdAt'>): Promise<BloodRequest> => {
    const newRequest: BloodRequest = {
      ...requestData,
      id: Date.now().toString(),
      status: 'Pending',
      createdAt: new Date(),
    };
    
    setRequests(prev => [...prev, newRequest]);

    // Also save to database for tracking
    try {
      await supabase.from('blood_requests').insert({
        patient_name: requestData.patientName,
        blood_type: requestData.bloodType,
        units: requestData.units,
        hospital: requestData.hospital,
        hospital_area: requestData.hospitalArea,
        priority: requestData.priority,
        requester_name: requestData.requesterName,
        requester_phone: requestData.requesterPhone,
        relation_with_patient: requestData.relationWithPatient,
      });
    } catch (error) {
      console.error('Error saving request to database:', error);
    }

    return newRequest;
  };

  const processRequest = (requestId: string): BloodRequest | null => {
    const req = requests.find(r => r.id === requestId);
    if (!req || req.status !== 'Pending') return null;

    // STEP 1: Try to find an available donor first (preferred)
    const exactDonors = donors.filter(
      d => d.bloodType === req.bloodType && d.isAvailable
    );
    
    if (exactDonors.length > 0) {
      // Find nearest donor with exact blood type
      let nearestDonor: Donor | null = null;
      let shortestDistance = Infinity;
      let bestRoute: string[] = [];

      for (const donor of exactDonors) {
        const result = dijkstra(req.hospitalArea, donor.area);
        if (result.distance >= 0 && result.distance < shortestDistance) {
          shortestDistance = result.distance;
          nearestDonor = donor;
          bestRoute = result.path;
        }
      }

      if (nearestDonor) {
        updateDonorAvailability(nearestDonor.id, false);
        const matchedRequest: BloodRequest = {
          ...req,
          status: 'Matched',
          source: 'Donor',
          matchedDonor: nearestDonor,
          route: bestRoute.map(getAreaName),
          distance: shortestDistance,
        };
        setRequests(prev => prev.map(r => r.id === requestId ? matchedRequest : r));
        return matchedRequest;
      }
    }

    // STEP 2: No donor available - check blood bank (for emergency)
    const bankEntry = bloodBank.find(b => b.bloodType === req.bloodType);
    const availableUnits = bankEntry ? bankEntry.units - bankEntry.reserved : 0;
    const hasBloodInBank = availableUnits >= req.units;
    
    if (hasBloodInBank) {
      setBloodBank(prev =>
        prev.map(b =>
          b.bloodType === req.bloodType
            ? { ...b, units: b.units - req.units }
            : b
        )
      );
      const fulfilledRequest: BloodRequest = {
        ...req,
        status: 'Fulfilled',
        source: 'Blood Bank',
      };
      setRequests(prev => prev.map(r => r.id === requestId ? fulfilledRequest : r));
      return fulfilledRequest;
    }

    // STEP 3: Neither donor nor blood bank has blood - request pending
    const pendingRequest: BloodRequest = {
      ...req,
      status: 'Pending',
    };
    setRequests(prev => prev.map(r => r.id === requestId ? pendingRequest : r));
    return pendingRequest;
  };

  const recordDonation = async (
    donorId: string,
    requestId: string,
    donorName: string,
    donorEmail: string,
    bloodType: string,
    units: number,
    hospital: string,
    recipientName: string
  ) => {
    try {
      const { error } = await supabase.from('donations').insert({
        donor_id: donorId,
        request_id: requestId,
        donor_name: donorName,
        donor_email: donorEmail,
        blood_type: bloodType,
        units,
        hospital,
        recipient_name: recipientName,
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error recording donation:', error);
      throw error;
    }
  };

  const confirmMatch = async (requestId: string) => {
    const request = requests.find(r => r.id === requestId);
    if (!request || !request.matchedDonor) return;

    // Record the donation
    await recordDonation(
      request.matchedDonor.id,
      requestId,
      request.matchedDonor.name,
      '', // email will be updated if available
      request.matchedDonor.bloodType,
      request.units,
      request.hospital,
      request.patientName
    );

    // Update request status to Fulfilled
    setRequests(prev =>
      prev.map(r =>
        r.id === requestId ? { ...r, status: 'Fulfilled' } : r
      )
    );

    // Send notification email
    try {
      await supabase.functions.invoke('send-match-notification', {
        body: {
          donorName: request.matchedDonor.name,
          donorEmail: request.matchedDonor.phone, // Using phone as placeholder - would use email if available
          patientName: request.patientName,
          hospital: request.hospital,
          bloodType: request.bloodType,
          units: request.units,
        },
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const markRequestComplete = async (requestId: string) => {
    try {
      // Update local state
      setRequests(prev =>
        prev.map(r =>
          r.id === requestId ? { ...r, status: 'Fulfilled' } : r
        )
      );

      // Update database
      await supabase
        .from('blood_requests')
        .update({ status: 'Fulfilled' })
        .eq('id', requestId);
    } catch (error) {
      console.error('Error marking request complete:', error);
      throw error;
    }
  };

  const deleteRequest = async (requestId: string) => {
    try {
      // Update local state
      setRequests(prev => prev.filter(r => r.id !== requestId));

      // Delete from database
      await supabase
        .from('blood_requests')
        .delete()
        .eq('id', requestId);
    } catch (error) {
      console.error('Error deleting request:', error);
      throw error;
    }
  };

  return (
    <BloodContext.Provider
      value={{
        donors,
        requests,
        bloodBank,
        addDonor,
        deleteDonor,
        updateDonorAvailability,
        createRequest,
        processRequest,
        getCompatibleDonors,
        getCompatibleBloodTypes,
        findNearestDonor,
        findAllDonorsSorted,
        addBloodUnits,
        removeBloodUnits,
        updateReservedUnits,
        recordDonation,
        confirmMatch,
        markRequestComplete,
        deleteRequest,
      }}
    >
      {children}
    </BloodContext.Provider>
  );
}

export function useBlood() {
  const context = useContext(BloodContext);
  if (context === undefined) {
    throw new Error('useBlood must be used within a BloodProvider');
  }
  return context;
}
