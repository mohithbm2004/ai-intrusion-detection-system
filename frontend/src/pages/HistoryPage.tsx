import React, { useEffect, useState } from 'react';
import { Search, ChevronLeft, ChevronRight, FileSpreadsheet, FileText, FileCode } from 'lucide-react';
import { predictionsApi } from '../services/api';
import type { FlowPrediction } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';

export const HistoryPage: React.FC = () => {
  const [records, setRecords] = useState<FlowPrediction[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [attackType, setAttackType] = useState('ALL');
  const [isAttackFilter, setIsAttackFilter] = useState<string>('ALL');

  useEffect(() => {
    fetchHistory();
  }, [page, attackType, isAttackFilter]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      let isAttackParam: boolean | undefined = undefined;
      if (isAttackFilter === 'ATTACK') isAttackParam = true;
      if (isAttackFilter === 'NORMAL') isAttackParam = false;

      const res = await predictionsApi.getHistory(page, 15, search, attackType, isAttackParam);
      setRecords(res.records);
      setTotal(res.total);
      setPages(res.pages);
    } catch (err) {
      console.error('Failed to load prediction history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchHistory();
  };

  const handleExport = (format: 'csv' | 'xlsx' | 'pdf') => {
    predictionsApi.exportReport(format);
  };

  return (
    <div className="space-y-6">
      {/* Header & Export Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Prediction History & Auditing</h1>
          <p className="text-sm text-slate-400 mt-1">
            Searchable, paginated audit records for all network intrusion predictions.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('csv')}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-2 transition-all"
          >
            <FileCode className="w-3.5 h-3.5 text-cyan-400" /> Export CSV
          </button>

          <button
            onClick={() => handleExport('xlsx')}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-2 transition-all"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" /> Export Excel
          </button>

          <button
            onClick={() => handleExport('pdf')}
            className="px-3.5 py-2 bg-gradient-to-r from-red-500/80 to-rose-600/80 hover:from-red-500 hover:to-rose-600 text-white text-xs font-semibold rounded-xl shadow-md flex items-center gap-2 transition-all"
          >
            <FileText className="w-3.5 h-3.5 text-white" /> Export PDF
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Source IP, Destination IP, or Attack Type..."
            className="w-full bg-slate-900/80 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Traffic Type Selector */}
          <select
            value={isAttackFilter}
            onChange={(e) => {
              setIsAttackFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Traffic Types</option>
            <option value="ATTACK">Attacks Only</option>
            <option value="NORMAL">Normal BENIGN Only</option>
          </select>

          {/* Attack Category Dropdown */}
          <select
            value={attackType}
            onChange={(e) => {
              setAttackType(e.target.value);
              setPage(1);
            }}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Attack Classes</option>
            <option value="DoS">DoS / DDoS</option>
            <option value="PortScan">PortScan</option>
            <option value="BruteForce">BruteForce / Patator</option>
            <option value="Bot">Botnet</option>
            <option value="Web">Web Attack</option>
          </select>
        </div>
      </div>

      {/* Prediction History Data Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs text-slate-400 uppercase bg-slate-900/90 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3.5">ID</th>
                  <th className="px-6 py-3.5">Timestamp</th>
                  <th className="px-6 py-3.5">Source IP</th>
                  <th className="px-6 py-3.5">Destination IP</th>
                  <th className="px-6 py-3.5">Attack Classification</th>
                  <th className="px-6 py-3.5 text-right">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-500 text-sm">
                      No prediction audit records match your query.
                    </td>
                  </tr>
                ) : (
                  records.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-slate-500">#{rec.id}</td>
                      <td className="px-6 py-4 text-xs text-slate-400">
                        {new Date(rec.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-cyan-300 font-semibold">
                        {rec.source_ip}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-400">
                        {rec.destination_ip}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge attackType={rec.attack_type} isAttack={rec.is_attack} />
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-slate-200">
                        {rec.confidence}%
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/40 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            Showing Page <span className="font-semibold text-slate-200">{page}</span> of{' '}
            <span className="font-semibold text-slate-200">{pages}</span> ({total} Total Records)
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page === pages}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
