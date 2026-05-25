'use client';

import React, { useState, useEffect } from 'react';
import { useTraffic } from '@/context/TrafficContext';
import { MessageSquare, CheckCircle, Clock } from 'lucide-react';

interface SMSRecord {
  id: string;
  hospital: string;
  status: 'sending' | 'sent';
  timestamp: string;
}

export const EmergencySMS: React.FC = () => {
  const { accidentDetected, addLog } = useTraffic();
  const [smsRecords, setSmsRecords] = useState<SMSRecord[]>([]);

  // Simulate SMS sending when accident is detected
  useEffect(() => {
    if (accidentDetected) {
      const hospitals = ['Apollo Hospital', 'AMRI Hospital', 'Fortis Hospital'];
      
      hospitals.forEach((hospital, index) => {
        // First show "sending" status
        const sendingId = `${Date.now()}-${index}`;
        setSmsRecords((prev) => [
          ...prev,
          {
            id: sendingId,
            hospital,
            status: 'sending',
            timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
          },
        ]);

        // After 1 second, change to "sent"
        const timer = setTimeout(() => {
          setSmsRecords((prev) =>
            prev.map((record) =>
              record.id === sendingId ? { ...record, status: 'sent' } : record
            )
          );
          addLog(`SMS sent to ${hospital}`, 'sms', { hospital });
        }, 1000 + index * 300);

        return () => clearTimeout(timer);
      });
    } else {
      setSmsRecords([]);
    }
  }, [accidentDetected, addLog]);

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-blue-500" />
        <h3 className="text-lg font-bold text-foreground">Emergency SMS Alerts</h3>
      </div>

      {smsRecords.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
          <p className="text-sm">No emergency SMS alerts</p>
          <p className="text-xs text-muted-foreground mt-1">
            SMS notifications sent to nearby hospitals during accidents
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {smsRecords.map((record) => (
            <div
              key={record.id}
              className="border border-border rounded-lg p-4 bg-secondary/20 hover:bg-secondary/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <p className="font-semibold text-foreground text-sm">{record.hospital}</p>
                  <p className="text-xs text-muted-foreground font-mono">{record.timestamp}</p>
                </div>
                {record.status === 'sending' ? (
                  <div className="flex items-center gap-1 text-xs text-amber-400">
                    <Clock className="w-3 h-3 animate-spin" />
                    <span>Sending...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-xs text-green-400">
                    <CheckCircle className="w-3 h-3" />
                    <span>Sent</span>
                  </div>
                )}
              </div>

              <div className="text-xs text-muted-foreground bg-secondary/30 rounded p-2 font-mono">
                <p className="mb-1 text-foreground">Message:</p>
                <p>
                  "🚨 Accident at Park Street Junction. Immediate assistance required. Multiple
                  vehicles involved. Emergency services alerted."
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
