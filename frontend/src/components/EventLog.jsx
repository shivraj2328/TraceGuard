import React from 'react';

const events = [
  { id: 'EVT-9042', timestamp: '17:32:01', source: 'Node-US-East-1', type: 'Packet Inspection', status: 'Passed', severity: 'info' },
  { id: 'EVT-9041', timestamp: '17:31:58', source: 'Node-EU-West-3', type: 'Anomaly Detected', status: 'Mitigated', severity: 'warning' },
  { id: 'EVT-9040', timestamp: '17:31:45', source: 'Node-AP-South-1', type: 'Handshake Sync', status: 'Passed', severity: 'info' },
  { id: 'EVT-9039', timestamp: '17:31:12', source: 'Node-US-West-2', type: 'DDoS Burst Alert', status: 'Blocked', severity: 'critical' },
];

export default function EventLog() {
  return (
    <div className="w-full max-w-7xl px-6 mb-8">
      <div className="bg-[#0f1d2e] border border-slate-800/80 rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <h2 className="text-sm font-mono font-semibold uppercase tracking-wider text-slate-300">
            Live Telemetry Streams
          </h2>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2.5 py-1 rounded-full">
            ● Realtime Active
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-[#0b1724]/60 text-xs font-mono text-slate-400 uppercase border-b border-slate-800/80">
              <tr>
                <th className="px-6 py-3">Event ID</th>
                <th className="px-6 py-3">Timestamp</th>
                <th className="px-6 py-3">Source</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 font-mono">
              {events.map((evt) => (
                <tr key={evt.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-semibold text-indigo-400">{evt.id}</td>
                  <td className="px-6 py-4 text-slate-400">{evt.timestamp}</td>
                  <td className="px-6 py-4">{evt.source}</td>
                  <td className="px-6 py-4">{evt.type}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs rounded-md font-medium ${
                      evt.severity === 'critical' ? 'bg-rose-950/80 text-rose-400 border border-rose-800/50' :
                      evt.severity === 'warning' ? 'bg-amber-950/80 text-amber-400 border border-amber-800/50' :
                      'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50'
                    }`}>
                      {evt.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}