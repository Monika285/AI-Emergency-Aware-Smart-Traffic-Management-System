'use client';

import React, { useEffect, useRef } from 'react';
import { useTraffic } from '@/context/TrafficContext';
import { Map } from 'lucide-react';

export const MapView: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { signals, accidentDetected, ambulanceDetected, selectedAmbulanceDirection, violations, activeViolationDirection } = useTraffic();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = 'rgba(31, 41, 55, 0.3)';
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 30) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }
    for (let i = 0; i < height; i += 30) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }

    const centerX = width / 2;
    const centerY = height / 2;

    // Draw main intersection with accident indicator
    if (accidentDetected) {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
      ctx.fillRect(centerX - 50, centerY - 50, 100, 100);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.strokeRect(centerX - 50, centerY - 50, 100, 100);
      
      // Draw accident marker
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    } else {
      ctx.fillStyle = 'rgba(16, 185, 129, 0.1)';
      ctx.fillRect(centerX - 40, centerY - 40, 80, 80);
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.strokeRect(centerX - 40, centerY - 40, 80, 80);
    }

    // Draw roads
    ctx.strokeStyle = 'rgba(107, 114, 128, 0.4)';
    ctx.lineWidth = 24;

    // Horizontal road
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();

    // Vertical road
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height);
    ctx.stroke();

    // Draw signals
    const signalPositions = [
      { x: centerX, y: 30, direction: 'North' },
      { x: centerX, y: height - 30, direction: 'South' },
      { x: width - 30, y: centerY, direction: 'East' },
      { x: 30, y: centerY, direction: 'West' },
    ];

    signals.forEach((signal) => {
      const pos = signalPositions.find((p) => p.direction === signal.direction);
      if (!pos) return;

      // Get color based on signal status
      const color =
        signal.status === 'GREEN' ? '#10b981' : signal.status === 'RED' ? '#ef4444' : '#f59e0b';

      // Draw signal point
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Draw vehicle indicator
      ctx.fillStyle = 'rgba(6, 182, 212, 0.4)';
      const vehicleSize = Math.min(signal.vehicleCount / 5, 12);
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, vehicleSize, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw violation indicator if active
    if (activeViolationDirection && violations.length > 0) {
      const violPos = signalPositions.find((p) => p.direction === activeViolationDirection);
      if (violPos && violations.length > 0) {
        const latestViolation = violations[0];
        
        // Draw pink vehicle indicator for violation
        ctx.fillStyle = '#ec4899';
        ctx.shadowColor = '#ec4899';
        ctx.shadowBlur = 15;
        const violationSize = 8;
        ctx.beginPath();
        ctx.arc(violPos.x, violPos.y - 25, violationSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Draw vehicle number popup
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(violPos.x - 45, violPos.y - 48, 90, 18);
        ctx.strokeStyle = '#ec4899';
        ctx.lineWidth = 1;
        ctx.strokeRect(violPos.x - 45, violPos.y - 48, 90, 18);
        
        ctx.fillStyle = '#ec4899';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(latestViolation.licensePlate, violPos.x, violPos.y - 39);
        
        // Draw violation message
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(violPos.x - 55, violPos.y - 25, 110, 20);
        ctx.strokeStyle = '#ec4899';
        ctx.lineWidth = 1;
        ctx.strokeRect(violPos.x - 55, violPos.y - 25, 110, 20);
        
        ctx.fillStyle = '#ec4899';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('VIOLATION!', violPos.x, violPos.y - 15);
      }
    }

    // Draw ambulance if detected
    if (ambulanceDetected && selectedAmbulanceDirection) {
      const ambPos = signalPositions.find((p) => p.direction === selectedAmbulanceDirection);
      if (ambPos) {
        // Draw ambulance route highlight
        const centerToAmb =
          selectedAmbulanceDirection === 'North'
            ? [centerX, 100]
            : selectedAmbulanceDirection === 'South'
              ? [centerX, height - 100]
              : selectedAmbulanceDirection === 'East'
                ? [width - 100, centerY]
                : [100, centerY];

        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerToAmb[0], centerToAmb[1]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw ambulance with pulse
        const time = Date.now() % 1000;
        const pulseSize = 10 + (time / 1000) * 5;
        ctx.fillStyle = 'rgba(6, 182, 212, 0.3)';
        ctx.beginPath();
        ctx.arc(ambPos.x, ambPos.y, pulseSize, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#06b6d4';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🚑', ambPos.x, ambPos.y);
      }
    }

    // Draw accident location if present
    if (accidentDetected) {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
      const time = Date.now() % 1000;
      const pulseSize = 30 + (time / 1000) * 20;
      ctx.beginPath();
      ctx.arc(centerX, centerY, pulseSize, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 30, 0, Math.PI * 2);
      ctx.stroke();

      // Draw warning symbol
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⚠', centerX, centerY);
    }

    // Add compass
    ctx.fillStyle = '#9ca3af';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('N', centerX, 15);
    ctx.fillText('S', centerX, height - 5);
    ctx.textAlign = 'right';
    ctx.fillText('E', width - 10, centerY + 4);
    ctx.textAlign = 'left';
    ctx.fillText('W', 10, centerY + 4);

    // Draw location name
    ctx.fillStyle = '#6b7280';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Park Street Junction', centerX, height - 20);
  }, [signals, accidentDetected, ambulanceDetected, selectedAmbulanceDirection, violations, activeViolationDirection]);

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Map className="w-4 h-4 text-cyan-500" />
        <h3 className="text-sm font-bold text-foreground">Live Map View</h3>
      </div>
      <canvas
        ref={canvasRef}
        width={250}
        height={250}
        className="w-full bg-black border border-border rounded"
      />
    </div>
  );
};
