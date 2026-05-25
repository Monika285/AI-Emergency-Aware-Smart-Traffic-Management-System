'use client';

import React, { useMemo, useState } from 'react';
import { useTraffic } from '@/context/TrafficContext';
import { Navbar } from './Navbar';
import { VideoFeed } from './VideoFeed';
import { SignalControl } from './SignalControl';
import { AmbulanceAlert } from './AmbulanceAlert';
import { AccidentDetection } from './AccidentDetection';
import { EmergencySMS } from './EmergencySMS';
import { ViolationDetection } from './ViolationDetection';
import { ActivityLog } from './ActivityLog';
import { MapView } from './MapView';
import { Statistics } from './Statistics';
import { DemoAccidentTab } from './DemoAccidentTab';
import { HospitalManagement } from './HospitalManagement';
import { Button } from '@/components/ui/button';

type TabType = 'live' | 'demo' | 'hospital';

export const TrafficDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('live');
  const { signals, accidentDetected, setAmbulanceDetected, setAccidentDetected, activityLogs, createViolation } =
    useTraffic();

  const totalVehicles = useMemo(() => {
    return signals.reduce((sum, signal) => sum + signal.vehicleCount, 0);
  }, [signals]);

  const systemStatus = useMemo(() => {
    if (accidentDetected) return 'critical';
    const avgDensity = signals.reduce((sum, s) => {
      const density = s.density === 'High' ? 3 : s.density === 'Medium' ? 2 : 1;
      return sum + density;
    }, 0) / signals.length;
    return avgDensity > 2.5 ? 'warning' : 'active';
  }, [signals, accidentDetected]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar systemStatus={systemStatus} totalVehicles={totalVehicles} />

      {/* Emergency Alerts */}
      <AmbulanceAlert />

      <div className="p-6 max-w-7xl mx-auto">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-border pb-4">
          <Button
            onClick={() => setActiveTab('live')}
            variant={activeTab === 'live' ? 'default' : 'outline'}
            className="gap-2"
          >
            📊 Live Monitor
          </Button>
          <Button
            onClick={() => setActiveTab('demo')}
            variant={activeTab === 'demo' ? 'default' : 'outline'}
            className="gap-2"
          >
            🎬 Demo Accident
          </Button>
          <Button
            onClick={() => setActiveTab('hospital')}
            variant={activeTab === 'hospital' ? 'default' : 'outline'}
            className="gap-2"
          >
            🏥 Hospital SMS
          </Button>
        </div>

        {/* Tab Content */}
        {activeTab === 'live' && (
          <>
            {/* Statistics Cards */}
            <div className="mb-6">
              <Statistics />
            </div>

            {/* Control Buttons */}
            <div className="flex gap-3 mb-6 flex-wrap">
            <Button
              onClick={() => setAmbulanceDetected(true, 'North')}
              variant="destructive"
              className="text-sm"
            >
              Simulate Ambulance
            </Button>
            <Button
              onClick={() => setAccidentDetected(true)}
              variant="destructive"
              className="text-sm"
            >
              Simulate Accident
            </Button>
            <Button
              onClick={() => {
                const directions = ['North', 'South', 'East', 'West'];
                const randomDir = directions[Math.floor(Math.random() * directions.length)];
                createViolation(randomDir as any);
              }}
              variant="outline"
              className="text-sm border-red-600 text-red-600 hover:bg-red-600/10"
            >
              Simulate Violation
            </Button>
            </div>

            {/* Main Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
              {/* Left: Video Feed */}
              <div className="lg:col-span-2">
                <VideoFeed />
              </div>

              {/* Middle: Map View */}
              <div>
                <MapView />
              </div>

              {/* Right: Alerts and Logs */}
              <div className="space-y-6">
                {/* Accident Detection */}
                {accidentDetected && <AccidentDetection />}

                {/* Emergency SMS */}
                <EmergencySMS />

                {/* Violations */}
                <ViolationDetection />
              </div>
            </div>

            {/* Signal Control Grid */}
            <div className="mb-6">
              <SignalControl />
            </div>

            {/* Bottom: Activity Log */}
            <div className="h-64">
              <ActivityLog />
            </div>
          </>
        )}

        {/* Demo Accident Tab */}
        {activeTab === 'demo' && (
          <DemoAccidentTab />
        )}

        {/* Hospital SMS Tab */}
        {activeTab === 'hospital' && (
          <HospitalManagement />
        )}
      </div>
    </div>
  );
};
