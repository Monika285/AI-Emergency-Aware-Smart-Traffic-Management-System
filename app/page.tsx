'use client';

// Force refresh v2
import { TrafficProvider } from '@/context/TrafficContext';
import { TrafficDashboard } from '@/components/traffic-dashboard/TrafficDashboard';

export default function Home() {
  return (
    <TrafficProvider>
      <TrafficDashboard />
    </TrafficProvider>
  );
}
