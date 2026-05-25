'use client';

import React from 'react';
import { Activity, AlertTriangle } from 'lucide-react';

interface NavbarProps {
  systemStatus: 'active' | 'warning' | 'critical';
  totalVehicles: number;
}

export const Navbar: React.FC<NavbarProps> = ({ systemStatus, totalVehicles }) => {
  const statusColors = {
    active: 'bg-green-600',
    warning: 'bg-amber-600',
    critical: 'bg-red-600',
  };

  const statusLabels = {
    active: 'System Active',
    warning: 'System Warning',
    critical: 'Critical Alert',
  };

  return (
    <nav className="bg-card/80 backdrop-blur-md border-b border-border/50 px-6 py-4 shadow-lg shadow-black/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
              <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground leading-tight">Smart Traffic Control</h1>
              <p className="text-xs text-muted-foreground">AI-Powered Traffic Management System</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 px-4 py-2 bg-secondary/30 rounded-lg border border-border/30">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Vehicles:</span>
            <span className="font-mono font-bold text-cyan-400 text-lg">{totalVehicles}</span>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-secondary/30 rounded-lg border border-border/30">
            <div className={`w-2.5 h-2.5 rounded-full ${statusColors[systemStatus]} ${systemStatus !== 'active' ? 'animate-pulse' : ''}`} />
            <span className="text-sm font-medium text-muted-foreground">{statusLabels[systemStatus]}</span>
          </div>

          <div className="text-xs text-muted-foreground px-4 py-2 bg-secondary/30 rounded-lg border border-border/30">
            Park Street Junction • Kolkata
          </div>
        </div>
      </div>
    </nav>
  );
};
