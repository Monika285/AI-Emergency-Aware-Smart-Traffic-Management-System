'use client';

import React, { useMemo } from 'react';
import { useTraffic } from '@/context/TrafficContext';
import { Direction } from '@/context/TrafficContext';
import { Camera, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const ViolationDetection: React.FC = () => {
  const { violations, createViolation } = useTraffic();
  
  const directions: Direction[] = ['North', 'South', 'East', 'West'];
  
  const challanCount = useMemo(() => {
    return violations.filter((v) => v.status === 'challan-issued').length;
  }, [violations]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'recorded':
        return 'bg-blue-900/30 text-blue-300 border-blue-700';
      case 'verified':
        return 'bg-amber-900/30 text-amber-300 border-amber-700';
      case 'challan-issued':
        return 'bg-red-900/30 text-red-300 border-red-700';
      default:
        return 'bg-gray-900/30 text-gray-300 border-gray-700';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Camera className="w-5 h-5 text-purple-500" />
        <h3 className="text-lg font-bold text-foreground">Traffic Violations</h3>
        <span className="ml-4 px-3 py-1 bg-red-900/30 border border-red-700 rounded-full text-red-400 font-bold text-sm">
          Challans Issued: {challanCount}
        </span>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {violations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No violations detected</p>
          </div>
        ) : (
          violations.map((violation) => (
            <div
              key={violation.id}
              className="border border-border rounded-lg p-4 bg-secondary/20 hover:bg-secondary/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <p className="font-mono text-lg font-bold text-cyan-400">
                    {violation.licensePlate}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Direction: {violation.direction}</p>
                </div>
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded border ${getStatusColor(
                    violation.status
                  )}`}
                >
                  {violation.status === 'challan-issued' ? 'Challan Issued' : 'Recorded'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground mb-1">Violation Type</p>
                  <p className="font-semibold text-foreground uppercase">Red Light Jump</p>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground mb-1">Time</p>
                  <p className="font-mono text-foreground">{violation.timestamp}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
