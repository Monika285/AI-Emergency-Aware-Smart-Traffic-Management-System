'use client';

import React, { useState } from 'react';
import { useTraffic } from '@/context/TrafficContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle, Radio, CheckCircle, Clock, MessageSquare, Navigation } from 'lucide-react';

type DemoStep = 'idle' | 'detection' | 'sms_sent' | 'ambulance_dispatched' | 'signal_adapted';

export const DemoAccidentTab: React.FC = () => {
  const { setAccidentDetected, addLog, hospitals, sendSMS, activityLogs } = useTraffic();
  const [demoStep, setDemoStep] = useState<DemoStep>('idle');
  const [isRunning, setIsRunning] = useState(false);

  const runFullDemo = async () => {
    setIsRunning(true);
    
    try {
      // Step 1: Detect Accident
      setDemoStep('detection');
      setAccidentDetected(true);
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Step 2: Send SMS to all hospitals
      setDemoStep('sms_sent');
      const accidentMessage = `CRITICAL EMERGENCY: Multi-vehicle accident at Park Street Junction. Immediate medical assistance required. Coordinates: 22.5726°N, 88.3635°W. Fire department also dispatched. Please respond immediately.`;
      hospitals.forEach((hospital) => {
        sendSMS(hospital.id, accidentMessage);
      });
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Step 3: Ambulance Dispatched
      setDemoStep('ambulance_dispatched');
      addLog('Emergency ambulances dispatched from 3 nearby hospitals', 'ambulance');
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Step 4: Signal Adapted
      setDemoStep('signal_adapted');
      addLog('All traffic signals set to GREEN on ambulance route for fast passage', 'general');
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setDemoStep('idle');
    } finally {
      setIsRunning(false);
    }
  };

  const resetDemo = () => {
    setDemoStep('idle');
    setAccidentDetected(false);
  };

  const stepDescriptions = {
    detection: {
      title: '🚨 Accident Detected',
      description: 'System detected a multi-vehicle collision at Park Street Junction',
      details: [
        'Vehicle velocity analysis: Sudden deceleration detected',
        'Collision detection: Spatial proximity analysis triggered',
        'Severity level: Critical',
        'Location: Park Street Junction intersection',
      ],
    },
    sms_sent: {
      title: '📱 Emergency SMS Sent',
      description: `SMS alerts sent to ${hospitals.length} nearby hospitals with location and details`,
      details: hospitals.map((h) => `✓ ${h.name} - ${h.phone}`),
    },
    ambulance_dispatched: {
      title: '🚑 Ambulance Dispatched',
      description: 'Emergency medical teams en route from nearby hospitals',
      details: [
        'Apollo Hospital: ETA 4 minutes',
        'AMRI Hospital: ETA 5 minutes',
        'Fortis Healthcare: ETA 6 minutes',
        'All ambulances on fastest route',
      ],
    },
    signal_adapted: {
      title: '🚦 Signals Adapted',
      description: 'Traffic signals automatically optimized for ambulance passage',
      details: [
        'North: GREEN (ambulance route)',
        'South: RED',
        'East: RED',
        'West: RED',
        'Emergency corridor created',
      ],
    },
  };

  const currentStep = stepDescriptions[demoStep as keyof typeof stepDescriptions];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20">
            <AlertCircle className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Demo: Accident Detection & Response</h2>
            <p className="text-sm text-muted-foreground">Watch the complete workflow from detection to emergency response</p>
          </div>
        </div>
      </div>

      {/* Main Demo Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Demo Controls and Info */}
        <Card className="p-6 border border-border/50 bg-secondary/20">
          <h3 className="text-lg font-semibold text-foreground mb-4">Demo Workflow</h3>

          {demoStep === 'idle' ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Click the button below to run an automated accident detection and response demo. Watch as the system:
              </p>
              <ul className="text-sm text-muted-foreground space-y-2 ml-4">
                <li>✓ Detects the accident using AI vision</li>
                <li>✓ Sends SMS to nearby hospitals</li>
                <li>✓ Dispatches ambulances</li>
                <li>✓ Adapts traffic signals for emergency passage</li>
              </ul>
              <Button
                onClick={runFullDemo}
                disabled={isRunning}
                className="w-full gap-2 mt-4"
                variant="default"
              >
                <Radio className="w-4 h-4" />
                Start Full Demo
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Step Progress */}
              <div className="space-y-3">
                {['detection', 'sms_sent', 'ambulance_dispatched', 'signal_adapted'].map((step, index) => {
                  const isActive = demoStep === step;
                  const isComplete = ['detection', 'sms_sent', 'ambulance_dispatched', 'signal_adapted'].indexOf(
                    demoStep
                  ) > index;

                  return (
                    <div
                      key={step}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                        isActive
                          ? 'bg-cyan-500/10 border border-cyan-500/30'
                          : isComplete
                            ? 'bg-green-500/10 border border-green-500/30'
                            : 'bg-secondary/30 border border-border/30'
                      }`}
                    >
                      {isComplete ? (
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      ) : isActive ? (
                        <Clock className="w-5 h-5 text-cyan-400 flex-shrink-0 animate-pulse" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-muted-foreground flex-shrink-0" />
                      )}
                      <span className={`text-sm font-semibold ${isActive || isComplete ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {step === 'detection' && 'Accident Detection'}
                        {step === 'sms_sent' && 'SMS Notifications'}
                        {step === 'ambulance_dispatched' && 'Ambulance Dispatch'}
                        {step === 'signal_adapted' && 'Signal Adaptation'}
                      </span>
                    </div>
                  );
                })}
              </div>

              {currentStep && (
                <div className="mt-6 pt-4 border-t border-border/50">
                  <h4 className="text-sm font-semibold text-cyan-400 mb-2">{currentStep.title}</h4>
                  <p className="text-xs text-muted-foreground mb-3">{currentStep.description}</p>
                </div>
              )}

              <Button onClick={resetDemo} className="w-full" variant="outline" disabled={isRunning}>
                Reset Demo
              </Button>
            </div>
          )}
        </Card>

        {/* Current Step Details */}
        {demoStep !== 'idle' && currentStep && (
          <Card className="p-6 border border-border/50 bg-secondary/20 animate-slide-in-bottom">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              {demoStep === 'detection' && (
                <>
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  Detection Details
                </>
              )}
              {demoStep === 'sms_sent' && (
                <>
                  <MessageSquare className="w-5 h-5 text-amber-400" />
                  SMS Sent
                </>
              )}
              {demoStep === 'ambulance_dispatched' && (
                <>
                  <Navigation className="w-5 h-5 text-cyan-400" />
                  Dispatch Status
                </>
              )}
              {demoStep === 'signal_adapted' && (
                <>
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  Signal Status
                </>
              )}
            </h3>

            <div className="space-y-2">
              {currentStep.details.map((detail, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 p-2 rounded bg-secondary/30 border border-border/50 text-xs text-muted-foreground animate-slide-in-bottom"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="text-cyan-400 font-semibold flex-shrink-0 mt-0.5">→</div>
                  <span>{detail}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Recent Activity Log */}
      <Card className="p-6 border border-border/50 bg-secondary/20">
        <h3 className="text-lg font-semibold text-foreground mb-4">System Activity Log</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {activityLogs.slice(0, 15).map((log) => (
            <div key={log.id} className="flex items-start gap-2 p-2 rounded bg-secondary/30 border border-border/50 text-xs">
              <div className="text-muted-foreground font-mono flex-shrink-0">{log.timestamp}</div>
              <div className="text-foreground flex-1">{log.message}</div>
              <div
                className={`text-xs font-semibold px-2 py-1 rounded flex-shrink-0 ${
                  log.type === 'accident'
                    ? 'bg-red-500/10 text-red-400'
                    : log.type === 'ambulance'
                      ? 'bg-cyan-500/10 text-cyan-400'
                      : log.type === 'sms'
                        ? 'bg-amber-500/10 text-amber-400'
                        : 'bg-green-500/10 text-green-400'
                }`}
              >
                {log.type.toUpperCase()}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
