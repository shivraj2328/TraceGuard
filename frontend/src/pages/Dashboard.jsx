import React, { useState, useMemo } from 'react';
import { Flame, Activity, User, Zap } from 'lucide-react';
import MetricCard from '../components/MetricCard';
import ErrorDetails from '../components/ErrorDetails';
import IncidentStreamContainer from '../components/IncidentStreamContainer';
import { formatErrorDetails } from '../utils/adapter';

export default function Dashboard() {
  const [selectedError, setSelectedError] = useState(null);

  // Formats selected telemetry item into the props expected by ErrorDetails
  const formattedDetails = useMemo(() => {
    return formatErrorDetails(selectedError);
  }, [selectedError]);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Total Incidents"
          value="24"
          icon={<Flame className="w-5 h-5 text-red-400" />}
          trend="+12% today"
        />
        <MetricCard
          title="Events Captured"
          value="1,482"
          icon={<Activity className="w-5 h-5 text-sky-400" />}
          trend="32 req/sec"
        />
        <MetricCard
          title="Affected Users"
          value="93"
          icon={<User className="w-5 h-5 text-amber-400" />}
          trend="2.4% active"
        />
        <MetricCard
          title="AI Diagnostics"
          value="100%"
          icon={<Zap className="w-5 h-5 text-purple-400" />}
          trend="Auto-patched"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <IncidentStreamContainer
          selectedError={selectedError}
          onSelectError={setSelectedError}
        />
        {formattedDetails ? (
          <ErrorDetails selectedError={formattedDetails} />
        ) : (
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-xs font-mono text-slate-500 flex items-center justify-center">
            Select an incident from the stream to view full details
          </div>
        )}
      </div>
    </>
  );
}