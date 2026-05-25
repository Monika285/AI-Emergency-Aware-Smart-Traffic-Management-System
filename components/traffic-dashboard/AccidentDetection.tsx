'use client';

import React from 'react';
import { useTraffic } from '@/context/TrafficContext';
import { AlertTriangle, MapPin, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const AccidentDetection: React.FC = () => {
  const { accidentDetected, setAccidentDetected } = useTraffic();

  if (!accidentDetected) {
    return null;
  }

  const accidentTime = new Date().toLocaleTimeString('en-US', { hour12: false });

  return (
    <div className="bg-card border-2 border-red-600 rounded-lg p-6 shadow-lg shadow-red-500/30">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-xl font-bold text-red-400 uppercase">Accident Detected</h3>
            <p className="text-sm text-muted-foreground mt-1">Critical Incident Alert</p>
          </div>
        </div>
        <button
          onClick={() => setAccidentDetected(false)}
          className="p-1 hover:bg-red-900/20 rounded transition-colors"
        >
          <X className="w-5 h-5 text-red-400" />
        </button>
      </div>

      {/* Accident Details */}
      <div className="space-y-4 mb-4">
        {/* Detection Conditions */}
        <div className="bg-secondary/30 border border-border rounded p-3">
          <p className="text-xs font-semibold text-foreground mb-2 uppercase">Detection Conditions</p>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full" />
              Sudden Vehicle Stop Detected
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full" />
              Collision Impact Sensors Active
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full" />
              Zero Movement for 5+ seconds
            </li>
          </ul>
        </div>

        {/* Incident Snapshot */}
        <div className="bg-secondary/50 border border-border rounded overflow-hidden">
          <div className="aspect-video bg-black flex items-center justify-center relative">
            <svg className="w-20 h-20 text-red-600 opacity-30" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-13c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5z" />
            </svg>
            <p className="absolute top-2 right-2 text-xs bg-red-900/80 text-red-200 px-2 py-1 rounded">
              SNAPSHOT
            </p>
          </div>
        </div>

        {/* Location & Time */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-cyan-500" />
            <div className="text-sm">
              <p className="text-xs text-muted-foreground">Location</p>
              <p className="font-mono text-foreground">Park Street Junction</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-500" />
            <div className="text-sm">
              <p className="text-xs text-muted-foreground">Detected At</p>
              <p className="font-mono text-foreground">{accidentTime}</p>
            </div>
          </div>
        </div>

        {/* Emergency Status */}
        <div className="bg-amber-900/30 border border-amber-700/50 rounded p-3">
          <p className="text-xs font-semibold text-amber-300 uppercase mb-2">Emergency Response</p>
          <div className="space-y-1 text-sm text-amber-200">
            <p>✓ Emergency services notified</p>
            <p>✓ Ambulance en route (ETA: 8 minutes)</p>
            <p>✓ Traffic flow restricted in zone</p>
          </div>
        </div>
      </div>

      <Button
        onClick={() => setAccidentDetected(false)}
        variant="destructive"
        className="w-full"
      >
        Acknowledge & Close Alert
      </Button>
    </div>
  );
};
