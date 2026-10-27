import React, { useState } from 'react';
import { UploadCloud, FileText, AlertTriangle, ArrowRight } from 'lucide-react';
import { predictionsApi } from '../services/api';
import type { FileUploadResponse } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';

export const UploadPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<FileUploadResponse | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (!selected.name.endsWith('.csv')) {
        setError('Please select a valid .csv network traffic file.');
        setFile(null);
        return;
      }
      setFile(selected);
      setError('');
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError('');

    try {
      const res = await predictionsApi.uploadCsv(file);
      setResult(res);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to analyze CSV. Please ensure formatting matches dataset schema.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Network Flow CSV Inspection</h1>
        <p className="text-sm text-slate-400 mt-1">
          Upload network traffic packet flow CSV logs to run real-time Machine Learning anomaly classification.
        </p>
      </div>

      {/* Upload Box */}
      <div className="glass-panel p-8 rounded-2xl border border-slate-800 text-center">
        <div className="max-w-xl mx-auto space-y-6">
          <div className="p-4 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 w-16 h-16 mx-auto flex items-center justify-center glow-cyan">
            <UploadCloud className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-200">Select Network CSV File</h3>
            <p className="text-xs text-slate-400 mt-1">
              Supports CICIDS2017 flow statistics or standard network telemetry CSVs
            </p>
          </div>

          <div className="relative">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="p-6 border-2 border-dashed border-slate-700 hover:border-cyan-500/50 rounded-xl bg-slate-900/50 transition-colors flex flex-col items-center justify-center gap-2">
              <FileText className="w-8 h-8 text-slate-500" />
              <span className="text-sm font-medium text-slate-300">
                {file ? file.name : 'Click or Drag & Drop .CSV file here'}
              </span>
              {file && (
                <span className="text-xs text-cyan-400 font-mono">
                  {(file.size / 1024).toFixed(1)} KB
                </span>
              )}
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-3 text-left">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="w-full py-3.5 px-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Running ML Inference Pipeline...</span>
              </div>
            ) : (
              <>
                <span>Execute Intrusion Detection</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results View */}
      {result && (
        <div className="space-y-6">
          <div className="p-6 glass-panel rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                Analysis Complete
              </span>
              <h3 className="text-xl font-bold text-slate-100 mt-1">{result.filename}</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Timestamp: {new Date(result.uploaded_at).toLocaleString()}
              </p>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-center px-4 py-2 rounded-xl bg-slate-900 border border-slate-800">
                <p className="text-xs text-slate-400">Total Flows</p>
                <p className="text-xl font-extrabold text-slate-200">{result.total_flows}</p>
              </div>

              <div className="text-center px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20">
                <p className="text-xs text-red-400">Attacks</p>
                <p className="text-xl font-extrabold text-red-400">{result.attack_count}</p>
              </div>

              <div className="text-center px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-xs text-emerald-400">Normal</p>
                <p className="text-xl font-extrabold text-emerald-400">{result.normal_count}</p>
              </div>
            </div>
          </div>

          {/* Sample Flows Preview */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800">
            <h3 className="font-semibold text-slate-200 mb-4">Sample Inferred Flow Predictions</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="text-xs text-slate-400 uppercase bg-slate-900/80 border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Flow #</th>
                    <th className="px-4 py-3">Source IP</th>
                    <th className="px-4 py-3">Dest IP</th>
                    <th className="px-4 py-3">Attack Classification</th>
                    <th className="px-4 py-3 text-right">Confidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {result.sample_predictions.map((rec, i) => (
                    <tr key={i} className="hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-mono text-xs text-slate-400">#{rec.flow_index + 1}</td>
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
      )}
    </div>
  );
};
