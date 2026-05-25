'use client';

import React, { useEffect, useRef } from 'react';
import { useTraffic } from '@/context/TrafficContext';
import { Camera } from 'lucide-react';

export const VideoFeed: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { signals, vehicleMetrics } = useTraffic();

  // Draw traffic visualization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas with dark background
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);

    // Draw road grid
    ctx.strokeStyle = 'rgba(31, 41, 55, 0.5)';
    ctx.lineWidth = 1;
    
    // Vertical lines
    for (let i = 0; i < width; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }
    
    // Horizontal lines
    for (let i = 0; i < height; i += 40) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }

    // Draw intersection center
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Draw crossroads
    ctx.strokeStyle = 'rgba(107, 114, 128, 0.3)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height);
    ctx.stroke();

    // Draw direction labels and vehicle counts
    const directions = [
      { name: 'North', x: centerX, y: 20, dx: 0, dy: -80 },
      { name: 'South', x: centerX, y: height - 20, dx: 0, dy: 80 },
      { name: 'East', x: width - 20, y: centerY, dx: 80, dy: 0 },
      { name: 'West', x: 20, y: centerY, dx: -80, dy: 0 },
    ];

    directions.forEach((dir) => {
      const signal = signals.find((s) => s.direction === dir.name as any);
      if (!signal) return;

      // Draw vehicle count
      ctx.fillStyle = '#e5e7eb';
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${signal.vehicleCount} vehicles`, dir.x, dir.y - 30);

      // Draw signal indicator
      const signalColor =
        signal.status === 'GREEN' ? '#10b981' : signal.status === 'RED' ? '#ef4444' : '#f59e0b';
      
      ctx.fillStyle = signalColor;
      ctx.shadowColor = signalColor;
      ctx.shadowBlur = 15;
      ctx.fillRect(dir.x - 8, dir.y - 8, 16, 16);
      ctx.shadowBlur = 0;

      // Draw lane arrows
      ctx.strokeStyle = 'rgba(107, 114, 128, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(dir.x, dir.y);
      ctx.lineTo(dir.x + dir.dx, dir.y + dir.dy);
      ctx.stroke();

      // Draw arrowhead
      const arrowSize = 8;
      const angle = Math.atan2(dir.dy, dir.dx);
      ctx.fillStyle = 'rgba(107, 114, 128, 0.4)';
      ctx.beginPath();
      ctx.moveTo(dir.x + dir.dx, dir.y + dir.dy);
      ctx.lineTo(dir.x + dir.dx - arrowSize * Math.cos(angle - Math.PI / 6), dir.y + dir.dy - arrowSize * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(dir.x + dir.dx - arrowSize * Math.cos(angle + Math.PI / 6), dir.y + dir.dy - arrowSize * Math.sin(angle + Math.PI / 6));
      ctx.closePath();
      ctx.fill();
    });

    // Draw vehicle boxes (simulated)
    const laneBoxes = [
      { x: 100, y: centerY - 20, width: 80, count: vehicleMetrics.North?.count || 0 },
      { x: 100, y: centerY + 20, width: 80, count: vehicleMetrics.South?.count || 0 },
      { x: centerX - 20, y: 100, width: 80, count: vehicleMetrics.West?.count || 0 },
      { x: centerX + 20, y: 100, width: 80, count: vehicleMetrics.East?.count || 0 },
    ];

    laneBoxes.forEach((lane, i) => {
      const numVehicles = Math.ceil(lane.count / 10);
      for (let j = 0; j < numVehicles && j < 4; j++) {
        ctx.fillStyle = 'rgba(6, 182, 212, 0.3)';
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 1;
        ctx.fillRect(lane.x + j * 20, lane.y + j * 15, 18, 14);
        ctx.strokeRect(lane.x + j * 20, lane.y + j * 15, 18, 14);
      }
    });

    // Draw FPS/monitoring info
    ctx.fillStyle = '#9ca3af';
    ctx.font = '12px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('RTSP Stream: Park Street Junction', 10, height - 10);
    ctx.fillText('Recording Active | 24/7 Monitoring', width - 200, height - 10);
  }, [signals, vehicleMetrics]);

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden h-full flex flex-col shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20 transition-shadow">
      <div className="border-b border-border px-4 py-3 flex items-center gap-2 bg-secondary/50 backdrop-blur">
        <Camera className="w-4 h-4 text-cyan-500 animate-pulse" />
        <span className="text-sm font-semibold text-foreground">Live Traffic Feed</span>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-xs text-muted-foreground uppercase tracking-wide">Recording</span>
        </div>
      </div>
      <div className="relative w-full bg-black">
        <canvas
          ref={canvasRef}
          width={600}
          height={400}
          className="w-full hover:shadow-inner transition-shadow"
        />
        {/* Location Overlay */}
        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur rounded-lg p-3 border border-cyan-500/20">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono mb-1">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
            Live Feed
          </div>
          <p className="text-sm font-semibold text-foreground">Park Street Junction</p>
          <p className="text-xs text-muted-foreground">Kolkata, India</p>
          <p className="text-xs text-muted-foreground mt-1">Lat: 22.5726° | Lon: 88.3635°</p>
        </div>

        {/* Timestamp & Status */}
        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur rounded-lg p-3 border border-green-500/20">
          <p className="text-green-400 text-xs font-mono">{new Date().toLocaleTimeString()}</p>
          <p className="text-xs text-muted-foreground mt-1">Status: Active</p>
          <p className="text-xs text-muted-foreground">FPS: 30</p>
        </div>

        {/* Vehicle Count & Density */}
        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur rounded-lg p-3 border border-amber-500/20 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Total Vehicles:</span>
            <span className="text-sm font-bold text-amber-400">
              {Object.values(vehicleMetrics).reduce((sum, m) => sum + m.count, 0)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Avg Density:</span>
            <span className="text-sm font-bold text-amber-400">
              {vehicleMetrics.North?.density || 'N/A'}
            </span>
          </div>
        </div>

        {/* Lane Information */}
        <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur rounded-lg p-3 border border-cyan-500/20">
          <div className="text-xs font-mono text-cyan-400 space-y-1">
            <div className="flex justify-between gap-4">
              <span>N: {vehicleMetrics.North?.count || 0}</span>
              <span>S: {vehicleMetrics.South?.count || 0}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>E: {vehicleMetrics.East?.count || 0}</span>
              <span>W: {vehicleMetrics.West?.count || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
