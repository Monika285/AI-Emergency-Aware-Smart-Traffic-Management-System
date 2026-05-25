'use client';

import React, { useMemo } from 'react';
import { useTraffic } from '@/context/TrafficContext';
import { BarChart3, TrendingDown, AlertCircle, Zap } from 'lucide-react';

export const Statistics: React.FC = () => {
  const { signals, activityLogs } = useTraffic();

  const stats = useMemo(() => {
    const totalVehicles = signals.reduce((sum, s) => sum + s.vehicleCount, 0);
    const avgDensity = (
      signals.reduce((sum, s) => {
        const val = s.density === 'High' ? 3 : s.density === 'Medium' ? 2 : 1;
        return sum + val;
      }, 0) / signals.length
    ).toFixed(2);

    const highDensityLanes = signals.filter((s) => s.density === 'High').length;
    const greenSignals = signals.filter((s) => s.status === 'GREEN').length;

    const violations = activityLogs.filter((l) => l.type === 'violation').length;
    const accidents = activityLogs.filter((l) => l.type === 'accident').length;

    return {
      totalVehicles,
      avgDensity: parseFloat(avgDensity),
      highDensityLanes,
      greenSignals,
      violations,
      accidents,
    };
  }, [signals, activityLogs]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {/* Total Vehicles */}
      <div className="bg-card border border-border/50 rounded-lg p-4 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all hover:shadow-lg hover:shadow-cyan-500/10 hover:scale-105 transform">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Vehicles</p>
          <BarChart3 className="w-4 h-4 text-cyan-500 animate-pulse" />
        </div>
        <p className="text-3xl font-bold text-cyan-400 font-mono">{stats.totalVehicles}</p>
        <p className="text-xs text-muted-foreground mt-1">monitored</p>
      </div>

      {/* Average Density */}
      <div className="bg-card border border-border/50 rounded-lg p-4 hover:border-green-500/30 hover:bg-green-500/5 transition-all hover:shadow-lg hover:shadow-green-500/10 hover:scale-105 transform">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Avg Density</p>
          <TrendingDown className="w-4 h-4 text-green-500" />
        </div>
        <p className="text-3xl font-bold text-green-400 font-mono">
          {stats.avgDensity}
          <span className="text-sm text-muted-foreground">/3</span>
        </p>
        <p className="text-xs text-muted-foreground mt-1">congestion level</p>
      </div>

      {/* High Density Lanes */}
      <div className="bg-card border border-border/50 rounded-lg p-4 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all hover:shadow-lg hover:shadow-amber-500/10 hover:scale-105 transform">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">High Density</p>
          <AlertCircle className={`w-4 h-4 ${stats.highDensityLanes > 0 ? 'text-amber-500 animate-pulse' : 'text-green-500'}`} />
        </div>
        <p className="text-3xl font-bold text-amber-400 font-mono">{stats.highDensityLanes}</p>
        <p className="text-xs text-muted-foreground mt-1">lanes</p>
      </div>

      {/* Active Green Signals */}
      <div className="bg-card border border-border/50 rounded-lg p-4 hover:border-green-500/30 hover:bg-green-500/5 transition-all hover:shadow-lg hover:shadow-green-500/10 hover:scale-105 transform">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Green Signals</p>
          <Zap className="w-4 h-4 text-green-500 animate-pulse" />
        </div>
        <p className="text-3xl font-bold text-green-400 font-mono">{stats.greenSignals}</p>
        <p className="text-xs text-muted-foreground mt-1">active</p>
      </div>

      {/* Violations */}
      <div className="bg-card border border-border/50 rounded-lg p-4 hover:border-red-500/30 hover:bg-red-500/5 transition-all hover:shadow-lg hover:shadow-red-500/10 hover:scale-105 transform">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Violations</p>
          <AlertCircle className={`w-4 h-4 ${stats.violations > 0 ? 'text-red-500 animate-pulse' : 'text-muted-foreground'}`} />
        </div>
        <p className="text-3xl font-bold text-red-400 font-mono">{stats.violations}</p>
        <p className="text-xs text-muted-foreground mt-1">detected</p>
      </div>

      {/* Accidents */}
      <div className="bg-card border border-border/50 rounded-lg p-4 hover:border-red-600/30 hover:bg-red-600/5 transition-all hover:shadow-lg hover:shadow-red-600/10 hover:scale-105 transform">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Accidents</p>
          <AlertCircle className={`w-4 h-4 ${stats.accidents > 0 ? 'text-red-600 animate-pulse' : 'text-muted-foreground'}`} />
        </div>
        <p className="text-3xl font-bold text-red-500 font-mono">{stats.accidents}</p>
        <p className="text-xs text-muted-foreground mt-1">today</p>
      </div>
    </div>
  );
};
