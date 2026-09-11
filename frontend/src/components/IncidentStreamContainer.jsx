import React, { useState, useEffect } from 'react';
import ErrorList from './ErrorList';
import { transformTelemetryData } from '../utils/adapter';

export default function IncidentStreamContainer({ projectId = 'project_test_server' }) {
  const [errors, setErrors] = useState([]);
  const [selectedError, setSelectedError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadTelemetry() {
      try {
        setIsLoading(true);
        const response = await fetch(`http://localhost:5000/api/v1/telemetry/projects/${projectId}/events`);
        const json = await response.json();
        
        const mappedErrors = transformTelemetryData(json);
        setErrors(mappedErrors);
      } catch (err) {
        console.error('Failed to load incident stream:', err);
      } finally {
        setIsLoading(false);
      }
    }

    if (projectId) loadTelemetry();
  }, [projectId]);

  // Client-side search filtering by title, service endpoint, or ID
  const filteredErrors = errors.filter((error) => {
    const query = searchQuery.toLowerCase();
    return (
      error.title.toLowerCase().includes(query) ||
      error.service.toLowerCase().includes(query) ||
      error.id.toLowerCase().includes(query)
    );
  });

  if (isLoading) {
    return (
      <div className="lg:col-span-5 h-64 bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-center text-xs font-mono text-slate-400">
        Loading incident stream...
      </div>
    );
  }

  return (
    <ErrorList
      errors={filteredErrors}
      selectedError={selectedError}
      onSelectError={setSelectedError}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
    />
  );
}