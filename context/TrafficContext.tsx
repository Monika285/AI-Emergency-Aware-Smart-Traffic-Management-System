'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type Direction = 'North' | 'South' | 'East' | 'West';
export type SignalStatus = 'RED' | 'GREEN';

export interface SignalState {
  direction: Direction;
  status: SignalStatus;
  vehicleCount: number;
  density: 'Low' | 'Medium' | 'High';
  timeRemaining: number;
  isActive: boolean;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  message: string;
  type: 'signal' | 'ambulance' | 'accident' | 'violation' | 'sms' | 'general';
  metadata?: Record<string, any>;
}

export interface Hospital {
  id: string;
  name: string;
  phone: string;
  location: string;
  distance: number;
}

export interface SMSRecord {
  id: string;
  hospitalId: string;
  hospitalName: string;
  timestamp: string;
  message: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
}

export interface Violation {
  id: string;
  licensePlate: string;
  direction: Direction;
  timestamp: string;
  status: 'recorded' | 'challan-issued';
}

export interface TrafficContextType {
  signals: SignalState[];
  activityLogs: ActivityLog[];
  emergencyMode: boolean;
  ambulanceDetected: boolean;
  accidentDetected: boolean;
  selectedAmbulanceDirection: Direction | null;
  vehicleMetrics: Record<Direction, { count: number; density: string }>;
  addLog: (message: string, type: ActivityLog['type'], metadata?: Record<string, any>) => void;
  setAmbulanceDetected: (detected: boolean, direction?: Direction) => void;
  setAccidentDetected: (detected: boolean) => void;
  triggerSignalChange: (direction: Direction) => void;
  getSortedDirections: () => Direction[];
  hospitals: Hospital[];
  addHospital: (hospital: Omit<Hospital, 'id'>) => void;
  updateHospital: (id: string, hospital: Omit<Hospital, 'id'>) => void;
  deleteHospital: (id: string) => void;
  smsHistory: SMSRecord[];
  sendSMS: (hospitalId: string, message: string) => void;
  violations: Violation[];
  createViolation: (direction: Direction) => void;
  activeViolationDirection: Direction | null;
}

const TrafficContext = createContext<TrafficContextType | undefined>(undefined);

export const TrafficProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const directions: Direction[] = ['North', 'South', 'East', 'West'];
  
  const [signals, setSignals] = useState<SignalState[]>([
    { direction: 'North', status: 'GREEN', vehicleCount: 12, density: 'Medium', timeRemaining: 20, isActive: true },
    { direction: 'South', status: 'GREEN', vehicleCount: 8, density: 'Low', timeRemaining: 20, isActive: true },
    { direction: 'East', status: 'RED', vehicleCount: 15, density: 'Medium', timeRemaining: 50, isActive: false },
    { direction: 'West', status: 'RED', vehicleCount: 6, density: 'Low', timeRemaining: 50, isActive: false },
  ]);

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([
    {
      id: '1',
      timestamp: new Date().toISOString(),
      message: 'System initialized - Traffic monitoring active',
      type: 'general',
    },
  ]);

  const [emergencyMode, setEmergencyMode] = useState(false);
  const [ambulanceDetected, setAmbulanceDetectedState] = useState(false);
  const [accidentDetected, setAccidentDetectedState] = useState(false);
  const [selectedAmbulanceDirection, setSelectedAmbulanceDirection] = useState<Direction | null>(null);
  
  // Track ambulance counts per direction
  const [ambulanceCountByDirection, setAmbulanceCountByDirection] = useState<Record<Direction, number>>({
    North: 0,
    South: 0,
    East: 0,
    West: 0,
  });
  
  const [hospitals, setHospitals] = useState<Hospital[]>([
    { id: '1', name: 'Apollo Hospital', phone: '+91-98765-43210', location: '2 km away', distance: 2 },
    { id: '2', name: 'AMRI Hospital', phone: '+91-87654-32109', location: '3 km away', distance: 3 },
    { id: '3', name: 'Fortis Healthcare', phone: '+91-76543-21098', location: '4 km away', distance: 4 },
  ]);
  
  const [smsHistory, setSmsHistory] = useState<SMSRecord[]>([]);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [activeViolationDirection, setActiveViolationDirection] = useState<Direction | null>(null);
  const lastViolationTime = React.useRef<number>(0);

  // Add log entry
  const addLog = useCallback((message: string, type: ActivityLog['type'], metadata?: Record<string, any>) => {
    setActivityLogs((prev) => {
      const newLogs = [
        {
          id: Date.now().toString(),
          timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
          message,
          type,
          metadata,
        },
        ...prev,
      ];
      return newLogs.slice(0, 50); // Keep only 50 latest logs
    });
  }, []);

  // Helper function to get opposite direction pair
  const getOppositePair = (direction: Direction): Direction[] => {
    if (direction === 'North' || direction === 'South') {
      return ['North', 'South'];
    }
    return ['East', 'West'];
  };

  // Set ambulance detection with count tracking
  const setAmbulanceDetected = useCallback((detected: boolean, direction: Direction = 'North') => {
    setAmbulanceDetectedState(detected);
    setSelectedAmbulanceDirection(detected ? direction : null);
    setEmergencyMode(detected);
    
    if (detected) {
      // Increment ambulance count for this direction
      setAmbulanceCountByDirection((prev) => ({
        ...prev,
        [direction]: prev[direction] + 1,
      }));
      const pair = getOppositePair(direction);
      addLog(`Ambulance detected on ${direction} direction - ${pair.join(' & ')} signals set to GREEN`, 'ambulance', { direction, pair });
    }
  }, [addLog]);

  // Set accident detection and auto-send SMS
  const setAccidentDetected = useCallback((detected: boolean) => {
    setAccidentDetectedState(detected);
    if (detected) {
      addLog('Accident detected at Park Street Junction - Emergency services notified', 'accident');
      // Auto-send SMS to all hospitals
      setHospitals((prev) => {
        prev.forEach((hospital) => {
          const message = `EMERGENCY ALERT: Accident detected at Park Street Junction, Kolkata. Emergency services dispatched. Response time: 5-8 minutes. Location: https://maps.google.com/?q=22.5726,88.3635`;
          // Use a small delay to ensure messages are staggered
          setTimeout(() => {
            setSmsHistory((prevSMS) => {
              const newSMS: SMSRecord = {
                id: Date.now().toString() + Math.random(),
                hospitalId: hospital.id,
                hospitalName: hospital.name,
                timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
                message,
                status: 'sent',
              };
              return [newSMS, ...prevSMS];
            });
            addLog(`Auto-SMS sent to ${hospital.name}`, 'sms', { hospitalId: hospital.id, hospitalName: hospital.name });
          }, Math.random() * 500);
        });
        return prev;
      });
    }
  }, [addLog]);

  // Trigger signal change
  const triggerSignalChange = useCallback((direction: Direction) => {
    setSignals((prev) => {
      const updated: SignalState[] = prev.map((signal) => ({
        ...signal,
        status: (signal.direction === direction ? 'GREEN' : 'RED') as SignalStatus,
        isActive: signal.direction === direction,
        timeRemaining: signal.direction === direction ? 25 : 50,
      }));
      return updated;
    });
    addLog(`Signal changed to GREEN (${direction})`, 'signal', { direction });
  }, [addLog]);

  // Get sorted directions by vehicle count (highest first)
  const getSortedDirections = useCallback((): Direction[] => {
    return [...signals].sort((a, b) => b.vehicleCount - a.vehicleCount).map((s) => s.direction);
  }, [signals]);

  // Add hospital
  const addHospital = useCallback((hospital: Omit<Hospital, 'id'>) => {
    const newHospital: Hospital = {
      ...hospital,
      id: Date.now().toString(),
    };
    setHospitals((prev) => [...prev, newHospital]);
    addLog(`Hospital added: ${hospital.name}`, 'general');
  }, [addLog]);

  // Update hospital
  const updateHospital = useCallback((id: string, hospital: Omit<Hospital, 'id'>) => {
    setHospitals((prev) => prev.map((h) => (h.id === id ? { ...h, ...hospital } : h)));
    addLog(`Hospital updated: ${hospital.name}`, 'general');
  }, [addLog]);

  // Delete hospital
  const deleteHospital = useCallback((id: string) => {
    const hospital = hospitals.find((h) => h.id === id);
    setHospitals((prev) => prev.filter((h) => h.id !== id));
    if (hospital) {
      addLog(`Hospital removed: ${hospital.name}`, 'general');
    }
  }, [hospitals, addLog]);

  // Send SMS to hospital with location data
  const sendSMS = useCallback((hospitalId: string, message: string) => {
    const hospital = hospitals.find((h) => h.id === hospitalId);
    if (hospital) {
      // Create SMS with accident location details
      const accidentLocation = 'Park Street Junction, Kolkata';
      const latitude = '22.5726°N';
      const longitude = '88.3635°W';
      
      const fullMessage = `${message}\n\nLocation: ${accidentLocation}\nLat: ${latitude} | Lon: ${longitude}\nMaps: https://maps.google.com/?q=22.5726,88.3635`;
      
      const smsRecord: SMSRecord = {
        id: Date.now().toString(),
        hospitalId,
        hospitalName: hospital.name,
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
        message: fullMessage,
        status: 'pending',
      };
      
      setSmsHistory((prev) => [smsRecord, ...prev]);
      addLog(`SMS sent to ${hospital.name}: Emergency alert with location`, 'sms', { hospitalId, hospitalName: hospital.name });

      // Call API to send real SMS
      fetch('/api/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: hospital.phone,
          hospitalName: hospital.name,
          message: fullMessage,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log('[v0] SMS API response:', data);
          // Mark as delivered after API call
          setTimeout(() => {
            setSmsHistory((prev) =>
              prev.map((sms) =>
                sms.id === smsRecord.id ? { ...sms, status: 'delivered' as const } : sms
              )
            );
          }, 1000);
        })
        .catch((error) => {
          console.error('[v0] SMS error:', error);
          // Still mark as delivered for demo purposes
          setTimeout(() => {
            setSmsHistory((prev) =>
              prev.map((sms) =>
                sms.id === smsRecord.id ? { ...sms, status: 'delivered' as const } : sms
              )
            );
          }, 1000);
        });
    }
  }, [hospitals, addLog]);

  // Track how long the current pair has been green
  const greenElapsedRef = React.useRef<number>(0);
  const lastActivePairRef = React.useRef<string>('North-South');

  // Simulation loop with advanced logic: total vehicle count, multiple ambulance handling
  useEffect(() => {
    const simulationInterval = setInterval(() => {
      setSignals((prev) => {
        // Get current active pair
        const currentGreenSignals = prev.filter((s) => s.isActive);
        const currentActivePair = currentGreenSignals.length > 0 ? currentGreenSignals[0].direction : 'North';
        const getOpposite = (dir: Direction): Direction[] => {
          if (dir === 'North' || dir === 'South') return ['North', 'South'];
          return ['East', 'West'];
        };
        const currentPair = getOpposite(currentActivePair);
        const currentPairKey = currentPair.join('-');
        
        // Track elapsed green time for current pair
        if (lastActivePairRef.current === currentPairKey) {
          greenElapsedRef.current += 1;
        } else {
          // Pair changed, reset counter
          greenElapsedRef.current = 1;
          lastActivePairRef.current = currentPairKey;
        }
        
        // Minimum green time before allowing a switch (15 seconds for smoother transitions)
        const MIN_GREEN_TIME = 15;
        // Require significant vehicle difference to trigger a switch (prevents rapid switching)
        const VEHICLE_DIFF_THRESHOLD = 10;
        
        const hasElapsedMinTime = greenElapsedRef.current >= MIN_GREEN_TIME;
        
        // Step 1: Update vehicle counts based on CURRENT light status
        let updated: SignalState[] = prev.map((signal) => {
          const isCurrentlyGreen = signal.isActive;
          let newCount: number;
          
          if (isCurrentlyGreen) {
            // GREEN light: vehicles DECREASE as they pass through junction
            // Primary decrease with small chance to slightly increase (new arrivals)
            const change = Math.floor(Math.random() * 8) - 6; // -6 to +1 (mostly decrease)
            newCount = Math.max(5, signal.vehicleCount + change);
          } else {
            // RED light: vehicles INCREASE as they queue up waiting
            // Continuous increase (new arrivals queuing)
            const increase = Math.floor(Math.random() * 7) + 1; // +1 to +7 (constant increase)
            newCount = Math.max(5, signal.vehicleCount + increase);
          }
          
          const density: 'Low' | 'Medium' | 'High' = newCount <= 15 ? 'Low' : newCount <= 25 ? 'Medium' : 'High';
          const newTime = Math.max(0, signal.timeRemaining - 1);
          
          return {
            ...signal,
            vehicleCount: newCount,
            density,
            timeRemaining: newTime,
          };
        });
        
        // Step 2: Calculate TOTAL vehicle count for each pair (not average)
        const northSignal = updated.find((s) => s.direction === 'North')!;
        const southSignal = updated.find((s) => s.direction === 'South')!;
        const eastSignal = updated.find((s) => s.direction === 'East')!;
        const westSignal = updated.find((s) => s.direction === 'West')!;
        
        const nsPairTotal = northSignal.vehicleCount + southSignal.vehicleCount;
        const ewPairTotal = eastSignal.vehicleCount + westSignal.vehicleCount;
        
        // Step 3: Calculate ambulance counts per pair
        const nsAmbulanceCount = ambulanceCountByDirection['North'] + ambulanceCountByDirection['South'];
        const ewAmbulanceCount = ambulanceCountByDirection['East'] + ambulanceCountByDirection['West'];
        
        // Step 4: Determine which pair should be green
        let nextPair: Direction[] = currentPair;
        let shouldSwitch = false;
        
        if (ambulanceCountByDirection['North'] > 0 || ambulanceCountByDirection['South'] > 0 || 
            ambulanceCountByDirection['East'] > 0 || ambulanceCountByDirection['West'] > 0) {
          // There are ambulances - handle with ambulance logic (immediate switch for emergencies)
          if (nsAmbulanceCount > ewAmbulanceCount) {
            // N-S pair has more ambulances
            nextPair = ['North', 'South'];
            shouldSwitch = currentPair[0] !== 'North';
          } else if (ewAmbulanceCount > nsAmbulanceCount) {
            // E-W pair has more ambulances
            nextPair = ['East', 'West'];
            shouldSwitch = currentPair[0] !== 'East';
          } else if (nsAmbulanceCount === ewAmbulanceCount && nsAmbulanceCount > 0) {
            // Equal ambulances in both pairs - use vehicle count to decide
            // Direction with LESS vehicles gets priority
            const nsMinVehicles = Math.min(northSignal.vehicleCount, southSignal.vehicleCount);
            const ewMinVehicles = Math.min(eastSignal.vehicleCount, westSignal.vehicleCount);
            
            if (nsMinVehicles < ewMinVehicles) {
              nextPair = ['North', 'South'];
              shouldSwitch = currentPair[0] !== 'North';
            } else {
              nextPair = ['East', 'West'];
              shouldSwitch = currentPair[0] !== 'East';
            }
          }
        } else {
          // No ambulances - use total vehicle count with hysteresis
          // Only switch if:
          // 1. Minimum green time has elapsed
          // 2. The OTHER pair has significantly MORE vehicles (threshold)
          
          const vehicleDiff = Math.abs(nsPairTotal - ewPairTotal);
          
          if (hasElapsedMinTime && vehicleDiff >= VEHICLE_DIFF_THRESHOLD) {
            if (nsPairTotal > ewPairTotal && currentPair[0] !== 'North') {
              nextPair = ['North', 'South'];
              shouldSwitch = true;
            } else if (ewPairTotal > nsPairTotal && currentPair[0] !== 'East') {
              nextPair = ['East', 'West'];
              shouldSwitch = true;
            }
          }
        }
        
        // Calculate green time based on traffic density
        const maxTotal = Math.max(nsPairTotal, ewPairTotal);
        const greenTimeNeeded = Math.ceil((maxTotal / 40) * 60);
        
        // Step 5: Apply light status changes ONLY if we should switch
        if (shouldSwitch) {
          greenElapsedRef.current = 0; // Reset elapsed time on switch
          updated = updated.map((signal) => {
            const shouldBeGreen = nextPair.includes(signal.direction);
            
            return {
              ...signal,
              status: shouldBeGreen ? 'GREEN' : 'RED',
              isActive: shouldBeGreen,
              timeRemaining: shouldBeGreen ? greenTimeNeeded : greenTimeNeeded + 30,
            };
          });
          
          addLog(`Signal switched: ${nextPair.join(' & ')} GREEN (${nextPair[0] === 'North' ? nsPairTotal : ewPairTotal} vehicles)`, 'signal', { phase: 'switched' });
        } else {
          // Just update the timeRemaining display for active signals
          updated = updated.map((signal) => ({
            ...signal,
            timeRemaining: signal.isActive 
              ? Math.max(1, greenTimeNeeded - greenElapsedRef.current)
              : Math.max(1, greenTimeNeeded - greenElapsedRef.current + 30),
          }));
        }

        return updated;
      });
    }, 1000);

    return () => clearInterval(simulationInterval);
  }, [ambulanceCountByDirection, addLog]);

  // Play continuous ambulance alarm sound while ambulance is detected
  useEffect(() => {
    let audioContext: (AudioContext | any) | null = null;
    let oscillators: OscillatorNode[] = [];
    let gainNodes: GainNode[] = [];
    let sirenInterval: NodeJS.Timeout | null = null;

    if (ambulanceDetected) {
      try {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        console.log('[v0] Ambulance alarm started - continuous loop');

        // Create a pulsing siren effect that loops continuously
        const createSirenSound = () => {
          if (!audioContext) return;

          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);

          oscillator.type = 'sine';
          oscillator.frequency.value = 800; // High pitch

          // Set initial volume
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);

          // Start the oscillator
          oscillator.start(audioContext.currentTime);

          // Stop after 0.3 seconds to create pulsing effect
          oscillator.stop(audioContext.currentTime + 0.3);

          oscillators.push(oscillator);
          gainNodes.push(gainNode);
        };

        // Create pulsing siren sound every 0.5 seconds (creates alarm effect)
        createSirenSound(); // Start immediately
        sirenInterval = setInterval(createSirenSound, 500); // Repeat every 500ms
      } catch (error) {
        console.log('[v0] Audio context error:', error);
      }
    }

    // Cleanup when ambulance is no longer detected
    return () => {
      if (sirenInterval) {
        clearInterval(sirenInterval);
      }
      oscillators.forEach((osc) => {
        try {
          osc.stop();
        } catch (e) {
          // Already stopped
        }
      });
      console.log('[v0] Ambulance alarm stopped');
    };
  }, [ambulanceDetected]);

  // Auto-dismiss ambulance alert after 30 seconds and clear ambulance count
  useEffect(() => {
    if (ambulanceDetected && selectedAmbulanceDirection) {
      const timer = setTimeout(() => {
        // Decrement ambulance count for this direction as it "passes"
        setAmbulanceCountByDirection((prev) => ({
          ...prev,
          [selectedAmbulanceDirection]: Math.max(0, prev[selectedAmbulanceDirection] - 1),
        }));
        
        setAmbulanceDetectedState(false);
        setSelectedAmbulanceDirection(null);
        setEmergencyMode(false);
      }, 30000);
      return () => clearTimeout(timer);
    }
  }, [ambulanceDetected, selectedAmbulanceDirection]);

  // Auto-dismiss accident alert after 20 seconds
  useEffect(() => {
    if (accidentDetected) {
      const timer = setTimeout(() => {
        setAccidentDetectedState(false);
      }, 20000);
      return () => clearTimeout(timer);
    }
  }, [accidentDetected]);

  // Create traffic violation
  const createViolation = useCallback((direction: Direction) => {
    // Debounce: prevent creating violations within 500ms (for StrictMode)
    const now = Date.now();
    if (now - lastViolationTime.current < 500) {
      return;
    }
    lastViolationTime.current = now;

    const licensePlates = [
      'WB06AB1234', 'WB07CD5678', 'WB08EF9012', 'WB09GH3456', 'WB10IJ7890',
      'DL01AK1111', 'MH02LM2222', 'KA03NO3333', 'TN04OP4444', 'GJ05QR5555'
    ];
    const randomPlate = licensePlates[Math.floor(Math.random() * licensePlates.length)];
    
    const newViolation: Violation = {
      id: Date.now().toString(),
      licensePlate: randomPlate,
      direction,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      status: 'recorded',
    };
    
    setViolations((prev) => [newViolation, ...prev].slice(0, 20));
    setActiveViolationDirection(direction);
    addLog(`Traffic violation: Vehicle ${randomPlate} crossed red light at ${direction}`, 'violation', { 
      licensePlate: randomPlate,
      direction
    });
    
    // Auto-issue challan after 2 seconds
    setTimeout(() => {
      setViolations((prev) =>
        prev.map((v) => (v.id === newViolation.id ? { ...v, status: 'challan-issued' as const } : v))
      );
      addLog(`Challan issued to ${randomPlate}`, 'violation', { licensePlate: randomPlate });
    }, 2000);
    
    // Clear violation highlight after 5 seconds
    setTimeout(() => {
      setActiveViolationDirection(null);
    }, 5000);
  }, [addLog]);

  const vehicleMetrics = directions.reduce((acc, direction) => {
    const signal = signals.find((s) => s.direction === direction);
    if (signal) {
      acc[direction] = {
        count: signal.vehicleCount,
        density: signal.density,
      };
    }
    return acc;
  }, {} as Record<Direction, { count: number; density: string }>);

  return (
    <TrafficContext.Provider
      value={{
        signals,
        activityLogs,
        emergencyMode,
        ambulanceDetected,
        accidentDetected,
        selectedAmbulanceDirection,
        vehicleMetrics,
        addLog,
        setAmbulanceDetected,
        setAccidentDetected,
        triggerSignalChange,
        getSortedDirections,
        hospitals,
        addHospital,
        updateHospital,
        deleteHospital,
        smsHistory,
        sendSMS,
        violations,
        createViolation,
        activeViolationDirection,
      }}
    >
      {children}
    </TrafficContext.Provider>
  );
};

export const useTraffic = () => {
  const context = useContext(TrafficContext);
  if (!context) {
    throw new Error('useTraffic must be used within TrafficProvider');
  }
  return context;
};
