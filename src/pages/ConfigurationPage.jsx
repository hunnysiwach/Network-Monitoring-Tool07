import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sliders,
  Folder,
  Shield,
  FileCheck2
} from 'lucide-react';
import { api } from '../services/api';

export default function ConfigurationPage() {
  const [config, setConfig] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [errors, setErrors] = useState([]);

  const loadConfig = async () => {
    try {
      const data = await api.getConfig();
      setConfig(data);
      setFormData(data);
    } catch (err) {
      console.error('Failed to load config:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setErrors([]);

    try {
      const payload = {
        DOWNLOAD_THRESHOLD_MBPS: Number(formData.DOWNLOAD_THRESHOLD_MBPS),
        UPLOAD_THRESHOLD_MBPS: Number(formData.UPLOAD_THRESHOLD_MBPS),
        MONITORING_INTERVAL_SECONDS: Number(formData.MONITORING_INTERVAL_SECONDS),
        LOG_RETENTION_DAYS: Number(formData.LOG_RETENTION_DAYS),
        LOG_MAX_SIZE_MB: Number(formData.LOG_MAX_SIZE_MB),
        PORT: Number(formData.PORT),
        ALERTS_ENABLED: formData.ALERTS_ENABLED === true || formData.ALERTS_ENABLED === 'true',
        FIM_ENABLED: formData.FIM_ENABLED === true || formData.FIM_ENABLED === 'true',
        DEMO_MODE: formData.DEMO_MODE === true || formData.DEMO_MODE === 'true'
      };

      const res = await api.updateConfig(payload);
      if (res.success) {
        setConfig(res.config);
        setMessage('Configuration successfully saved and applied to active daemon!');
      } else {
        setErrors(res.errors || ['Validation failed']);
      }
    } catch (err) {
      setErrors([err.message]);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-mono">Loading configuration...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#111827] border border-[#1f293d] rounded-xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
            <Settings className="w-5 h-5 text-cyan-400" />
            System & Threshold Configuration
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Section 15: Configure alert thresholds, collection frequencies, log retention, and storage parameters.
          </p>
        </div>
      </div>

      {/* Success / Error Messages */}
      {message && (
        <div className="bg-emerald-950/40 border border-emerald-500/40 p-4 rounded-xl flex items-center gap-3 text-xs font-mono text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {errors.length > 0 && (
        <div className="bg-red-950/40 border border-red-500/40 p-4 rounded-xl space-y-1 text-xs font-mono text-red-300">
          <div className="flex items-center gap-2 font-bold text-red-400">
            <AlertTriangle className="w-4 h-4" />
            <span>Configuration Validation Errors:</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-slate-300">
            {errors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Network Thresholds Card */}
        <div className="bg-[#111827] border border-[#1f293d] rounded-xl p-5 shadow-lg space-y-4">
          <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2 border-b border-[#1f293d] pb-3">
            <Sliders className="w-4 h-4 text-cyan-400" />
            Network Bandwidth Thresholds (Objective 3)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5 font-semibold">
                Download Alert Threshold (MB/s)
              </label>
              <input
                type="number"
                min="1"
                max="10000"
                value={formData.DOWNLOAD_THRESHOLD_MBPS || 50}
                onChange={(e) => handleChange('DOWNLOAD_THRESHOLD_MBPS', e.target.value)}
                className="w-full bg-[#0a0f1d] border border-[#1f293d] focus:border-cyan-500 px-3.5 py-2 rounded-lg text-xs font-mono text-white focus:outline-none"
              />
              <p className="text-[11px] text-slate-500 font-mono mt-1">
                Generates <code className="text-cyan-400">HIGH_DOWNLOAD</code> alert when exceeded.
              </p>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5 font-semibold">
                Upload Alert Threshold (MB/s)
              </label>
              <input
                type="number"
                min="1"
                max="10000"
                value={formData.UPLOAD_THRESHOLD_MBPS || 20}
                onChange={(e) => handleChange('UPLOAD_THRESHOLD_MBPS', e.target.value)}
                className="w-full bg-[#0a0f1d] border border-[#1f293d] focus:border-cyan-500 px-3.5 py-2 rounded-lg text-xs font-mono text-white focus:outline-none"
              />
              <p className="text-[11px] text-slate-500 font-mono mt-1">
                Generates <code className="text-cyan-400">HIGH_UPLOAD</code> alert when exceeded.
              </p>
            </div>
          </div>
        </div>

        {/* Engine & Telemetry Parameters */}
        <div className="bg-[#111827] border border-[#1f293d] rounded-xl p-5 shadow-lg space-y-4">
          <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2 border-b border-[#1f293d] pb-3">
            <Settings className="w-4 h-4 text-cyan-400" />
            Collection Engine & Service Parameters
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5 font-semibold">
                Monitoring Interval (Seconds)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={formData.MONITORING_INTERVAL_SECONDS || 2}
                onChange={(e) => handleChange('MONITORING_INTERVAL_SECONDS', e.target.value)}
                className="w-full bg-[#0a0f1d] border border-[#1f293d] focus:border-cyan-500 px-3.5 py-2 rounded-lg text-xs font-mono text-white focus:outline-none"
              />
              <p className="text-[11px] text-slate-500 font-mono mt-1">Default: 2 seconds</p>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5 font-semibold">
                Log Retention (Days)
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={formData.LOG_RETENTION_DAYS || 7}
                onChange={(e) => handleChange('LOG_RETENTION_DAYS', e.target.value)}
                className="w-full bg-[#0a0f1d] border border-[#1f293d] focus:border-cyan-500 px-3.5 py-2 rounded-lg text-xs font-mono text-white focus:outline-none"
              />
              <p className="text-[11px] text-slate-500 font-mono mt-1">Automated log rotation scheme</p>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5 font-semibold">
                Max Log File Size (MB)
              </label>
              <input
                type="number"
                min="1"
                max="500"
                value={formData.LOG_MAX_SIZE_MB || 10}
                onChange={(e) => handleChange('LOG_MAX_SIZE_MB', e.target.value)}
                className="w-full bg-[#0a0f1d] border border-[#1f293d] focus:border-cyan-500 px-3.5 py-2 rounded-lg text-xs font-mono text-white focus:outline-none"
              />
              <p className="text-[11px] text-slate-500 font-mono mt-1">Rotates when size is reached</p>
            </div>
          </div>
        </div>

        {/* Feature Switches */}
        <div className="bg-[#111827] border border-[#1f293d] rounded-xl p-5 shadow-lg space-y-4">
          <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2 border-b border-[#1f293d] pb-3">
            <Shield className="w-4 h-4 text-cyan-400" />
            Security & Telemetry Toggles
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center gap-3 p-3 bg-[#0d1322] border border-[#1f293d] rounded-lg cursor-pointer hover:border-slate-700">
              <input
                type="checkbox"
                checked={formData.ALERTS_ENABLED === true}
                onChange={(e) => handleChange('ALERTS_ENABLED', e.target.checked)}
                className="w-4 h-4 accent-cyan-500 rounded"
              />
              <div>
                <span className="text-xs font-bold text-white font-mono">Enable Threshold Alerts</span>
                <p className="text-[11px] text-slate-400">Generate alerts when network limits or spikes are detected.</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-[#0d1322] border border-[#1f293d] rounded-lg cursor-pointer hover:border-slate-700">
              <input
                type="checkbox"
                checked={formData.FIM_ENABLED === true}
                onChange={(e) => handleChange('FIM_ENABLED', e.target.checked)}
                className="w-4 h-4 accent-cyan-500 rounded"
              />
              <div>
                <span className="text-xs font-bold text-white font-mono">Enable File Integrity Monitoring</span>
                <p className="text-[11px] text-slate-400">Calculate SHA-256 checksums on authorized directories.</p>
              </div>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={loadConfig}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#1f293d] hover:bg-slate-700 text-slate-300 font-mono text-xs rounded-lg border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-1.5 px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-mono font-bold text-xs rounded-lg transition-colors shadow-lg shadow-cyan-500/10"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
