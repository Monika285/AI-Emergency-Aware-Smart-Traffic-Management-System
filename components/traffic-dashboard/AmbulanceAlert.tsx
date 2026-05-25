'use client';

import React from 'react';
import { useTraffic } from '@/context/TrafficContext';
import { AlertTriangle, X, Siren } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const AmbulanceAlert: React.FC = () => {
  const { ambulanceDetected, selectedAmbulanceDirection, setAmbulanceDetected } = useTraffic();

  if (!ambulanceDetected) {
    return null;
  }

  return (
    <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4">
      <div className="bg-red-900/90 border-2 border-red-500 rounded-lg p-4 shadow-2xl shadow-red-500/50 min-w-96 animate-pulse">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="animate-pulse">
              <Siren className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-red-200 uppercase tracking-widest">
                AMBULANCE DETECTED
              </h3>
              <p className="text-sm text-red-300 font-mono">
                Direction: {selectedAmbulanceDirection} | {selectedAmbulanceDirection && (selectedAmbulanceDirection === 'North' || selectedAmbulanceDirection === 'South') ? 'North & South' : 'East & West'} signals set to GREEN
              </p>
            </div>
          </div>
          <button
            onClick={() => setAmbulanceDetected(false)}
            className="p-2 hover:bg-red-800/50 rounded transition-colors"
          >
            <X className="w-5 h-5 text-red-300" />
          </button>
        </div>

        {/* Alert Sound Indicator */}
        <div className="mt-3 flex items-center gap-2 text-xs text-red-300">
          <div className="flex gap-1">
            <div className="w-1 h-4 bg-red-400 animate-bounce" style={{ animationDelay: '0s' }} />
            <div className="w-1 h-4 bg-red-400 animate-bounce" style={{ animationDelay: '0.1s' }} />
            <div className="w-1 h-4 bg-red-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
          </div>
          <span>Alert Sound Playing</span>
        </div>
      </div>
    </div>
  );
};
