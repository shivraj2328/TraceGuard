import React, { useState, useEffect } from 'react';
import ErrorList from './ErrorList';
import { transformTelemetryData } from '../utils/adapter';

export default function IncidentStreamContainer({
  projectId = 'project_test_server',
  selectedError,
  onSelectError,
}) {
  const [errors, setErrors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadTelemetry() {
      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/v1/telemetry/projects/events?projectId=${projectId}`
        );
        const json = await response.json();

        if (isMounted) {
          const mappedErrors = transformTelemetryData(json);
          setErrors(mappedErrors);

          // Auto-select first incident on initial load if none is selected
          if (mappedErrors.length > 0 && !selectedError && onSelectError) {
            onSelectError(mappedErrors[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load incident stream:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    if (projectId) loadTelemetry();

    return () => {
      isMounted = false;
    };
  }, [projectId]);

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
      onSelectError={onSelectError}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
    />
  );
}