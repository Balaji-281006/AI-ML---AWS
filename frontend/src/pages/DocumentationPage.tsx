const sections = [
  ['Problem and solution', 'SkyGuard AI monitors Automatic Weather Stations and separates sensor faults from genuine meteorological events using temperature, pressure, and humidity.'],
  ['AI/ML pipeline', 'Ingestion is validated, cleaned, enriched with temporal and spatial context, scored with statistical and multivariate detectors, and classified with confidence and severity.'],
  ['Explainable AI', 'Every anomaly retains its observed value, expected value, deviation, detection methods, reason, and recommended field action. Neighboring stations help distinguish weather events from isolated sensor faults.'],
  ['Real-time processing', 'The simulator exposes start, stop, and anomaly injection controls. WebSocket clients receive telemetry updates without a page refresh, while REST endpoints support historical and analytical views.'],
  ['Use cases', 'Weather forecast quality control, disaster management, flood monitoring, agriculture, aviation, climate monitoring, remote AWS operations, sensor maintenance, data assurance, and large-scale network management.'],
  ['Edge AI and energy efficiency', 'The detector is modular so compact range, trend, and consistency models can later run at the station edge, reducing network traffic, cloud processing, and power consumption.'],
  ['Architecture', 'AWS sensors -> ingestion -> validation -> preprocessing -> feature engineering -> AI detection -> temporal and multivariate analysis -> spatial consistency -> explainability -> alerting -> database -> WebSocket dashboard.'],
  ['Future scope', 'Production deployment can add PostgreSQL persistence, authenticated IMD ingestion, model registry, SHAP explanations, role-specific workflows, and Kubernetes-scale streaming.'],
];

export function DocumentationPage() {
  return (
    <div className="space-y-5">
      <div><p className="text-xs uppercase tracking-[0.28em] text-cyan-300">Documentation</p><h1 className="mt-2 text-3xl font-semibold text-white">SkyGuard AI operating guide</h1><p className="mt-3 max-w-3xl text-slate-300">A concise reference for the platform, detection workflow, operational decisions, and disaster-management use cases.</p></div>
      <div className="grid gap-4 md:grid-cols-2">{sections.map(([title, content]) => <article key={title} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5"><h2 className="text-lg font-semibold text-white">{title}</h2><p className="mt-3 text-sm leading-6 text-slate-300">{content}</p></article>)}</div>
    </div>
  );
}
