'use client';

import React, { useState, useEffect } from 'react';
import { useTraffic, Direction } from '@/context/TrafficContext';
import { Zap, AlertCircle } from 'lucide-react';

export const SignalControl: React.FC = () => {
  const { signals, emergencyMode, ambulanceDetected, selectedAmbulanceDirection } = useTraffic();
  const [ambulanceCount, setAmbulanceCount] = useState<Record<Direction, number>>({
    North: 0,
    South: 0,
    East: 0,
    West: 0,
  });

  const getSignalColor = (status: string) => {
    switch (status) {
      case 'GREEN':
        return 'bg-green-600 glow-green';
      case 'RED':
        return 'bg-red-600 glow-red';
      default:
        return 'bg-gray-600';
    }
  };

  const getDirectionIcon = (direction: Direction) => {
    const icons: Record<Direction, string> = {
      North: '↑',
      South: '↓',
      East: '→',
      West: '←',
    };
    return icons[direction];
  };

  return (
    <div className="bg-card border border-border/50 rounded-lg p-6 shadow-lg shadow-cyan-500/5 hover:shadow-cyan-500/10 transition-shadow">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
            <Zap className="w-5 h-5 text-cyan-400" />
          </div>
          <h2 className="text-lg font-bold text-foreground">Signal Control System</h2>
        </div>
        {emergencyMode && (
          <div className="flex items-center gap-2 px-4 py-2 bg-red-900/40 border border-red-700/50 rounded-lg animate-pulse">
            <AlertCircle className="w-4 h-4 text-red-400 animate-pulse" />
            <span className="text-sm font-semibold text-red-300 uppercase tracking-wider">Emergency Mode</span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {/* North-South Pair */}
        <div className="border border-border/50 rounded-lg p-4 bg-secondary/20">
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border/30">
            <span className="text-xs font-bold uppercase px-2 py-1 bg-purple-500/20 border border-purple-500/40 rounded text-purple-300">
              Vertical Pair (N-S)
            </span>
            <div className="text-xs px-2 py-1 bg-cyan-500/20 border border-cyan-500/40 rounded text-cyan-300 font-semibold">
              Total: {(signals[0]?.vehicleCount || 0) + (signals[1]?.vehicleCount || 0)} vehicles
            </div>
            {signals[0]?.isActive && signals[1]?.isActive && (
              <div className="ml-auto flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-500/40 rounded-full">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs font-semibold text-green-300">Active Pair</span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {['North', 'South'].map((dir) => {
              const signal = signals.find((s) => s.direction === dir as Direction)!;
              const signalColor =
                signal.status === 'GREEN' ? '#10b981' : '#ef4444';
              
              const isAmbulanceDirection = ambulanceDetected && (signal.direction === selectedAmbulanceDirection || (selectedAmbulanceDirection === 'North' || selectedAmbulanceDirection === 'South'));

              return (
                <div
                  key={signal.direction}
                  className={`border-2 rounded-lg p-4 transition-all transform hover:scale-105 cursor-pointer ${
                    isAmbulanceDirection 
                      ? 'border-cyan-500 bg-cyan-500/20 shadow-lg shadow-cyan-500/50 scale-105' 
                      : signal.isActive 
                        ? 'border-border neon-border-active bg-secondary/40 scale-105' 
                        : 'border-border bg-secondary/20'
                  }`}
                  style={
                    signal.isActive
                      ? {
                          boxShadow: `0 0 20px ${signalColor}, 0 0 40px ${signalColor}40`,
                        }
                      : {}
                  }
                >
                  <div className="text-center mb-4">
                    <div className="text-3xl font-bold text-cyan-400 mb-1">
                      {getDirectionIcon(signal.direction)}
                    </div>
                    <h3 className="text-sm font-semibold text-foreground uppercase">
                      {signal.direction}
                    </h3>
                    {isAmbulanceDirection && (
                      <div className="mt-2 flex items-center justify-center gap-1 px-2 py-1 bg-red-500/20 border border-red-500 rounded-full animate-pulse">
                        <span className="text-xs font-bold text-red-400">🚑 AMBULANCE</span>
                      </div>
                    )}
                  </div>

                  {/* Signal Light */}
                  <div className="flex justify-center mb-4">
                    <div
                      className={`w-12 h-12 rounded-full ${getSignalColor(signal.status)} ${
                        signal.status === 'GREEN' && signal.isActive ? 'pulse-fast' : ''
                      } transition-all`}
                    />
                  </div>

                  {/* Signal Status */}
                  <div className="text-center mb-3">
                    <p className="text-xs text-muted-foreground mb-1">Status</p>
                    <p className={`font-mono text-sm font-bold ${
                      signal.status === 'GREEN' ? 'text-green-400' : 
                      'text-red-400'
                    }`}>{signal.status}</p>
                  </div>

                  {/* Vehicle Count */}
                  <div className="text-center mb-3">
                    <p className="text-xs text-muted-foreground mb-1">Vehicles</p>
                    <p className="font-mono text-lg font-bold text-cyan-400">{signal.vehicleCount}</p>
                  </div>

                  {/* Density Indicator */}
                  <div className="text-center mb-3">
                    <p className="text-xs text-muted-foreground mb-1">Density</p>
                    <div className="flex items-center justify-center gap-1">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`w-2 h-4 rounded-sm transition-all ${
                            (signal.density === 'Low' && i === 1) ||
                            (signal.density === 'Medium' && i <= 2) ||
                            signal.density === 'High'
                              ? 'bg-green-500'
                              : 'bg-gray-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Timer */}
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Next Change</p>
                    <p className={`font-mono text-sm font-bold text-amber-400`}>
                      {signal.timeRemaining}s
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* East-West Pair */}
        <div className="border border-border/50 rounded-lg p-4 bg-secondary/20">
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border/30">
            <span className="text-xs font-bold uppercase px-2 py-1 bg-blue-500/20 border border-blue-500/40 rounded text-blue-300">
              Horizontal Pair (E-W)
            </span>
            <div className="text-xs px-2 py-1 bg-cyan-500/20 border border-cyan-500/40 rounded text-cyan-300 font-semibold">
              Total: {(signals[2]?.vehicleCount || 0) + (signals[3]?.vehicleCount || 0)} vehicles
            </div>
            {signals[2]?.isActive && signals[3]?.isActive && (
              <div className="ml-auto flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-500/40 rounded-full">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs font-semibold text-green-300">Active Pair</span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {['East', 'West'].map((dir) => {
              const signal = signals.find((s) => s.direction === dir as Direction)!;
              const signalColor =
                signal.status === 'GREEN' ? '#10b981' : '#ef4444';
              
              const isAmbulanceDirection = ambulanceDetected && (signal.direction === selectedAmbulanceDirection || (selectedAmbulanceDirection === 'East' || selectedAmbulanceDirection === 'West'));

              return (
                <div
                  key={signal.direction}
                  className={`border-2 rounded-lg p-4 transition-all transform hover:scale-105 cursor-pointer ${
                    isAmbulanceDirection 
                      ? 'border-cyan-500 bg-cyan-500/20 shadow-lg shadow-cyan-500/50 scale-105' 
                      : signal.isActive 
                        ? 'border-border neon-border-active bg-secondary/40 scale-105' 
                        : 'border-border bg-secondary/20'
                  }`}
                  style={
                    signal.isActive
                      ? {
                          boxShadow: `0 0 20px ${signalColor}, 0 0 40px ${signalColor}40`,
                        }
                      : {}
                  }
                >
                  <div className="text-center mb-4">
                    <div className="text-3xl font-bold text-cyan-400 mb-1">
                      {getDirectionIcon(signal.direction)}
                    </div>
                    <h3 className="text-sm font-semibold text-foreground uppercase">
                      {signal.direction}
                    </h3>
                    {isAmbulanceDirection && (
                      <div className="mt-2 flex items-center justify-center gap-1 px-2 py-1 bg-red-500/20 border border-red-500 rounded-full animate-pulse">
                        <span className="text-xs font-bold text-red-400">🚑 AMBULANCE</span>
                      </div>
                    )}
                  </div>

                  {/* Signal Light */}
                  <div className="flex justify-center mb-4">
                    <div
                      className={`w-12 h-12 rounded-full ${getSignalColor(signal.status)} ${
                        signal.status === 'GREEN' && signal.isActive ? 'pulse-fast' : ''
                      } transition-all`}
                    />
                  </div>

                  {/* Signal Status */}
                  <div className="text-center mb-3">
                    <p className="text-xs text-muted-foreground mb-1">Status</p>
                    <p className={`font-mono text-sm font-bold ${
                      signal.status === 'GREEN' ? 'text-green-400' : 
                      'text-red-400'
                    }`}>{signal.status}</p>
                  </div>

                  {/* Vehicle Count */}
                  <div className="text-center mb-3">
                    <p className="text-xs text-muted-foreground mb-1">Vehicles</p>
                    <p className="font-mono text-lg font-bold text-cyan-400">{signal.vehicleCount}</p>
                  </div>

                  {/* Density Indicator */}
                  <div className="text-center mb-3">
                    <p className="text-xs text-muted-foreground mb-1">Density</p>
                    <div className="flex items-center justify-center gap-1">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`w-2 h-4 rounded-sm transition-all ${
                            (signal.density === 'Low' && i === 1) ||
                            (signal.density === 'Medium' && i <= 2) ||
                            signal.density === 'High'
                              ? 'bg-green-500'
                              : 'bg-gray-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Timer */}
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Next Change</p>
                    <p className={`font-mono text-sm font-bold text-amber-400`}>
                      {signal.timeRemaining}s
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Signal Algorithm Info */}
      <div className="mt-6 p-4 bg-secondary/30 border border-border rounded text-xs text-muted-foreground">
        <p className="mb-2 font-semibold text-foreground">Adaptive Algorithm Status:</p>
        <ul className="space-y-1 ml-3 list-disc">
          <li>Real-time vehicle detection enabled</li>
          <li>Dynamic signal switching based on traffic density</li>
          <li>Ambulance priority mode: {emergencyMode ? 'ACTIVE' : 'READY'}</li>
        </ul>
      </div>
    </div>
  );
};
