import React, { useState, useMemo } from 'react';
import { Flame, Activity, User, Zap, LayoutDashboard, Server } from 'lucide-react';
import MetricCard from '../components/MetricCard';
import ErrorDetails from '../components/ErrorDetails';
import IncidentStreamContainer from '../components/IncidentStreamContainer';
import ServerMetricsDashboard from '../components/ServerMetricsDashboard';
import { formatErrorDetails } from '../utils/adapter';

export default function Dashboard() {
  const [selectedError, setSelectedError] = useState(null);
  const [activeTab, setActiveTab] = useState('incidents'); // 'incidents' | 'metrics'

  // Formats selected telemetry item into the props expected by ErrorDetails
  const formattedDetails = useMemo(() => {
    return formatErrorDetails(selectedError);
  }, [selectedError]);

  return (
    <div className="space-y-6">
      {/* View Switcher Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('incidents')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'incidents'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Incidents & Errors</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('metrics')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'metrics'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Server Metrics</span>
          </button>
        </div>
      </div>

      {/* Tab Content Rendering */}
      {activeTab === 'metrics' ? (
        <ServerMetricsDashboard />
      ) : (
        <>
          {/* Incident Stream & Detail Inspector */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <IncidentStreamContainer
              projectId="project_test_server"
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
      )}
    </div>
  );
}