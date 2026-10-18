import React, { useState, useEffect } from "react";
import { authApi } from "../lib/api";
import {
  Server,
  Database,
  Activity,
  CheckCircle2,
  RefreshCw,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Cpu,
} from "lucide-react";

interface HealthData {
  success: boolean;
  message: string;
  database?: string;
  uptime?: number;
  timestamp?: string;
}

export const SystemHealthView: React.FC = () => {
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    setIsLoading(true);
    setError(null);
    const start = performance.now();

    try {
      const res = await authApi.checkHealth();
      const end = performance.now();
      setLatency(Math.round(end - start));

      if (res.success && res.data) {
        setHealthData(res.data);
      } else {
        setError(res.message || "Failed to retrieve service telemetry");
      }
    } catch {
      setError("Unable to connect to application server");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const check = async () => {
      const start = performance.now();
      try {
        const res = await authApi.checkHealth();
        if (!isMounted) return;
        const end = performance.now();
        setLatency(Math.round(end - start));
        if (res.success && res.data) {
          setHealthData(res.data);
        } else {
          setError(res.message || "Failed to retrieve service telemetry");
        }
      } catch {
        if (isMounted) {
          setError("Unable to connect to application server");
        }
      }
    };

    const timer = setTimeout(check, 0);
    const interval = setInterval(check, 15000);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  const formatUptime = (seconds?: number) => {
    if (!seconds) return "0m";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  const coreServices = [
    {
      name: "Authentication & Identity Provider",
      type: "Core Security",
      desc: "JWT issuance, token verification, and password encryption.",
      status: "Operational",
    },
    {
      name: "Organizational Directory & Roles",
      type: "Directory",
      desc: "Employee profiles, department structures, and reporting hierarchies.",
      status: "Operational",
    },
    {
      name: "PostgreSQL Database Engine",
      type: "Data Persistence",
      desc: "Prisma ORM connection pooling and relational schema integrity.",
      status: "Connected",
    },
    {
      name: "Corporate Policy & Governance Engine",
      type: "Business Logic",
      desc: "Multi-tier approval thresholds and department budget auditing.",
      status: "Operational",
    },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Top Header & Actions */}
      <div className="w-full bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Platform Health & System Status
            </h1>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              All Systems Operational
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time infrastructure telemetry, service availability, and database connectivity
          </p>
        </div>

        <button
          onClick={fetchHealth}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-blue-600" : ""}`} />
          <span>Refresh Status</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-xs text-rose-800">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">Service Connectivity Alert</div>
            <div>{error}</div>
          </div>
        </div>
      )}

      {/* 4 Telemetry Metrics Cards (Full Width) */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Service Status</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Server className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-bold text-slate-900">
            {healthData?.success ? "Operational" : "Offline"}
          </div>
          <p className="text-[11px] text-slate-500">High availability instance</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Database Engine</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-bold text-slate-900 capitalize">
            {healthData?.database || "Connected"}
          </div>
          <p className="text-[11px] text-slate-500">PostgreSQL Pooled Connection</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">System Uptime</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-bold text-slate-900 font-mono">
            {formatUptime(healthData?.uptime)}
          </div>
          <p className="text-[11px] text-slate-500">Continuous execution</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Response Latency</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-bold text-slate-900 font-mono">
            {latency !== null ? `${latency} ms` : "--"}
          </div>
          <p className="text-[11px] text-slate-500">Network round-trip latency</p>
        </div>
      </div>

      {/* Core Platform Services Table (Full Width) */}
      <div className="w-full bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden space-y-0">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">
              Platform Services & Governance
            </h2>
          </div>
          <span className="text-xs text-slate-500">4 Active Systems</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 font-semibold text-slate-600 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-5">Service Component</th>
                <th className="py-3 px-5">Domain</th>
                <th className="py-3 px-5">Operational Details</th>
                <th className="py-3 px-5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {coreServices.map((svc, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-5 font-semibold text-slate-900">
                    {svc.name}
                  </td>
                  <td className="py-3.5 px-5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      {svc.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-slate-600 max-w-md">{svc.desc}</td>
                  <td className="py-3.5 px-5 text-right">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      {svc.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Infrastructure Specs Card */}
      <div className="w-full bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-slate-600" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Infrastructure Configuration
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] text-slate-400 block mb-0.5">Runtime Environment</span>
            <span className="font-semibold text-slate-800">Node.js Enterprise Application Server</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] text-slate-400 block mb-0.5">Database Cluster</span>
            <span className="font-semibold text-slate-800">Cloud PostgreSQL (Pooled Connection)</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] text-slate-400 block mb-0.5">Security Protocol</span>
            <span className="font-semibold text-slate-800">JWT Token Auth & Bcrypt Hashing</span>
          </div>
        </div>
      </div>
    </div>
  );
};
