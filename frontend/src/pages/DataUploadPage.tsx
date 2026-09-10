import { useRef, useState } from 'react';
import { api } from '../services/api';

export function DataUploadPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState('No file validated yet');
  const [busy, setBusy] = useState(false);
  const [pipelineResult, setPipelineResult] = useState('');

  const validate = async (file: File) => {
    setBusy(true);
    try {
      const response = await api.validateUpload(file);
      setResult(`${response.filename}: ${response.records} records validated at ${response.schemaConfidence}% schema confidence`);
    } catch (error) {
      setResult(error instanceof Error ? error.message : 'Upload validation failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">Data Upload</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Sensor data intake</h1>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
          <div className="rounded-2xl border border-dashed border-cyan-500/40 bg-cyan-500/5 p-8 text-center">
            <p className="text-lg font-medium text-white">Drop CSV or JSON files</p>
            <p className="mt-2 text-sm text-slate-300">Station snapshots, hourly observations, and telemetry exports</p>
            <input ref={inputRef} type="file" accept=".csv,.json" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void validate(file); }} />
            <button onClick={() => inputRef.current?.click()} className="mt-5 rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950">
              Select files
            </button>
            <button onClick={() => { const csv = 'timestamp,station_id,temperature,pressure,humidity\n2026-09-09T05:00:00Z,AWS-001,31.2,1012,67\n2026-09-09T05:05:00Z,AWS-001,55,1001,95'; const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'skyguard-sample.csv'; anchor.click(); URL.revokeObjectURL(url); }} className="ml-3 mt-5 rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200">
              Download sample CSV
            </button>
            <button onClick={() => setResult('Demo dataset is already loaded: 30 stations, 10,000+ readings, 100+ anomalies, and 30+ alerts.')} className="mt-3 block w-full text-xs text-cyan-300 underline underline-offset-4">
              Load demo data
            </button>
          </div>

          <div className="mt-5 space-y-3 text-sm text-slate-300">
            {[
              ['Raw station data', '12 files validated'],
              ['Hourly weather feed', '2 batches queued'],
              ['ML anomaly pipeline', busy ? 'Validating upload' : 'Ready for processing'],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                <span>{label}</span>
                <span className="text-cyan-300">{value}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-cyan-200">{result}</p>
          <button onClick={() => { setPipelineResult('Running backend anomaly pipeline...'); void api.runAnomalyPipeline().then((response) => setPipelineResult(`${response.detectedAnomalies} anomalies detected from ${response.processedRecords} records.`)).catch(() => setPipelineResult('Pipeline execution failed; review backend logs.')); }} className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm font-medium text-amber-200">
            Run anomaly pipeline
          </button>
          {pipelineResult && <p className="mt-3 text-sm text-amber-200">{pipelineResult}</p>}
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
          <h3 className="text-lg font-semibold text-white">Latest validation</h3>
          <div className="mt-4 space-y-4 text-sm text-slate-300">
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <p className="text-cyan-300">92.4%</p>
              <p className="mt-1">Schema match confidence</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <p className="text-emerald-300">34 records</p>
              <p className="mt-1">Successfully parsed in latest batch</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <p className="text-amber-300">2 warnings</p>
              <p className="mt-1">Minor timestamp and missing field issues flagged</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
