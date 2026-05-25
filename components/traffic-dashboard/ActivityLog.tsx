'use client';

import React from 'react';
import { useTraffic } from '@/context/TrafficContext';
import { Activity, AlertCircle, Zap, MessageSquare, Siren, TrendingUp } from 'lucide-react';

export const ActivityLog: React.FC = () => {
  const { activityLogs } = useTraffic();

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'signal':
        return <Zap className="w-4 h-4 text-yellow-500" />;
      case 'ambulance':
        return <Siren className="w-4 h-4 text-red-500" />;
      case 'accident':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'violation':
        return <Activity className="w-4 h-4 text-purple-500" />;
      case 'sms':
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      default:
        return <TrendingUp className="w-4 h-4 text-green-500" />;
    }
  };

  const getLogBgColor = (type: string) => {
    switch (type) {
      case 'signal':
        return 'bg-yellow-900/10';
      case 'ambulance':
        return 'bg-red-900/10';
      case 'accident':
        return 'bg-red-900/20';
      case 'violation':
        return 'bg-purple-900/10';
      case 'sms':
        return 'bg-blue-900/10';
      default:
        return 'bg-green-900/10';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 h-full flex flex-col shadow-lg shadow-cyan-500/5 hover:shadow-cyan-500/10 transition-shadow">
      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border/50">
        <Activity className="w-5 h-5 text-cyan-500 animate-pulse" />
        <h3 className="text-lg font-bold text-foreground">Activity Log</h3>
        <span className="ml-auto text-xs bg-cyan-500/10 px-3 py-1 rounded-full text-cyan-400 border border-cyan-500/20 font-mono">
          {activityLogs.length} events
        </span>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-secondary/20 [&::-webkit-scrollbar-thumb]:bg-cyan-500/30 [&::-webkit-scrollbar-thumb]:rounded-full">
        {activityLogs.map((log) => (
          <div
            key={log.id}
            className={`border border-border/50 rounded-lg p-3 text-xs transition-all hover:border-border hover:bg-secondary/30 hover:scale-105 ${getLogBgColor(
              log.type
            )}`}
          >
            <div className="flex items-start gap-2 mb-1">
              <div className="flex-shrink-0 mt-0.5">{getLogIcon(log.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-foreground font-medium break-words text-xs leading-tight">{log.message}</p>
              </div>
            </div>
            <div className="ml-6 text-muted-foreground font-mono text-xs opacity-75">
              {log.timestamp}
            </div>
          </div>
        ))}
      </div>

      {activityLogs.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">No activity yet</p>
        </div>
      )}
    </div>
  );
};
