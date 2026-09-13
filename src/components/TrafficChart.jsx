import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

export default function TrafficChart({ data = [], range = '15m', onRangeChange, dlThreshold = 50, ulThreshold = 20 }) {
  const ranges = [
    { label: '1 min', value: '1m' },
    { label: '5 min', value: '5m' },
    { label: '15 min', value: '15m' },
    { label: '1 hour', value: '1h' }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0d1322] border border-[#1f293d] rounded-lg p-3 shadow-xl font-mono text-xs">
          <p className="text-slate-400 mb-1.5 font-sans font-medium">{label}</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4 text-cyan-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span> Download:
              </span>
              <span className="font-bold">{payload[0]?.value} Mbps</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-emerald-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Upload:
              </span>
              <span className="font-bold">{payload[1]?.value} Mbps</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#111827] border border-[#1f293d] rounded-xl p-5 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            Real-Time Network Bandwidth Telemetry
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Throughput measurement in Megabits per second (Mbps) • Limits: DL {dlThreshold} Mbps / UL {ulThreshold} Mbps
          </p>
        </div>

        {onRangeChange && (
          <div className="flex items-center gap-1 bg-[#0a0f1d] border border-[#1f293d] p-1 rounded-lg">
            {ranges.map((r) => (
              <button
                key={r.value}
                onClick={() => onRangeChange(r.value)}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-all ${
                  range === r.value
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="dlGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="ulGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="time"
              stroke="#64748b"
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickLine={false}
              axisLine={{ stroke: '#1e293b' }}
            />
            <YAxis
              stroke="#64748b"
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickLine={false}
              axisLine={{ stroke: '#1e293b' }}
              unit=" Mbps"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: '10px', fontSize: '12px' }}
            />
            <Area
              type="monotone"
              dataKey="download_mbps"
              name="Download (Mbps)"
              stroke="#06b6d4"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#dlGradient)"
            />
            <Area
              type="monotone"
              dataKey="upload_mbps"
              name="Upload (Mbps)"
              stroke="#10b981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#ulGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
