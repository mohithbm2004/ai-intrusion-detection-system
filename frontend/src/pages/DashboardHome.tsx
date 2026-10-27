import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Activity,
  Cpu,
  TrendingUp,
  BarChart2,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  LineChart,
  Line,
} from 'recharts';

import { predictionsApi } from '../services/api';
import type { DashboardStats } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';

export const DashboardHome: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await predictionsApi.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-sm">Gathering Security Telemetry...</p>
        </div>
      </div>
    );
  }

  const attackDistData = stats
    ? Object.entries(stats.attack_distribution).map(([name, count]) => ({
        name,
        count,
      }))
    : [];

  const confidenceData = stats
    ? Object.entries(stats.confidence_histogram).map(([range, count]) => ({
        range,
        count,
      }))
    : [];

  const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#a855f7', '#06b6d4', '#ec4899'];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Security Command Center</h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time Machine Learning Network Intrusion Telemetry
          </p>
        </div>
        <button
          onClick={fetchStats}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold rounded-xl border border-slate-700 transition-all"
        >
          Refresh Telemetry
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-[#090d16] grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Predictions */}
        <div className="glass-panel p-6 rounded-2xl glass-panel-hover relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Predictions
              </p>
              <h3 className="text-3xl font-extrabold text-slate-100 mt-1">
                {stats?.total_predictions.toLocaleString()}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 glow-cyan">
              <Activity className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-slate-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" /> Processed flow records
          </p>
        </div>

        {/* Total Attacks Detected */}
        <div className="glass-panel p-6 rounded-2xl glass-panel-hover relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Attacks Detected
              </p>
              <h3 className="text-3xl font-extrabold text-red-400 mt-1">
                {stats?.total_attacks.toLocaleString()}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 glow-red">
              <ShieldAlert className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-red-400/80 font-medium">
            {stats?.attack_percentage}% of total network traffic
          </p>
        </div>

        {/* Normal Traffic */}
        <div className="glass-panel p-6 rounded-2xl glass-panel-hover relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Normal Traffic
              </p>
              <h3 className="text-3xl font-extrabold text-emerald-400 mt-1">
                {stats?.total_normal.toLocaleString()}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-slate-400">Clean benign flows</p>
        </div>

        {/* Model Accuracy */}
        <div className="glass-panel p-6 rounded-2xl glass-panel-hover relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Model Accuracy
              </p>
              <h3 className="text-3xl font-extrabold text-indigo-400 mt-1">
                {stats?.model_accuracy}%
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Cpu className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-indigo-400/80 font-medium">Random Forest Classifier</p>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Attack Distribution Bar Chart */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-cyan-400" />
              <h3 className="font-semibold text-slate-200">Attack Type Distribution</h3>
            </div>
            <span className="text-xs text-slate-400">Categorized Threats</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attackDistData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} interval={0} angle={-15} textAnchor="end" />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#f8fafc',
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {attackDistData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Predictions Trend */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              <h3 className="font-semibold text-slate-200">Daily Traffic Volume Trend</h3>
            </div>
            <span className="text-xs text-slate-400">Last 7 Days</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.daily_predictions || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#f8fafc',
                  }}
                />
                <Line type="monotone" dataKey="total" stroke="#38bdf8" strokeWidth={3} dot={{ r: 4 }} name="Total Flows" />
                <Line type="monotone" dataKey="attacks" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} name="Attacks" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Confidence Histogram & Recent Predictions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Confidence Histogram */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 lg:col-span-1">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-400" />
              <h3 className="font-semibold text-slate-200">Confidence Score Histogram</h3>
            </div>
          </div>

          <div className="space-y-4">
            {confidenceData.map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-300">Confidence {item.range}</span>
                  <span className="text-cyan-400 font-bold">{item.count} flows</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full"
                    style={{
                      width: `${
                        stats?.total_predictions
                          ? Math.min(100, (item.count / stats.total_predictions) * 100)
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Predictions Table */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              <h3 className="font-semibold text-slate-200">Recent Prediction Stream</h3>
            </div>
            <span className="text-xs text-slate-400">Live Feeds</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs text-slate-400 uppercase bg-slate-900/60 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Source IP</th>
                  <th className="px-4 py-3">Dest IP</th>
                  <th className="px-4 py-3">Attack Category</th>
                  <th className="px-4 py-3 text-right">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {stats?.recent_predictions.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-cyan-300">{rec.source_ip}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">{rec.destination_ip}</td>
                    <td className="px-4 py-3">
                      <StatusBadge attackType={rec.attack_type} isAttack={rec.is_attack} />
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-200">
                      {rec.confidence}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
