import React, { useState, useEffect } from 'react';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  RefreshCw, 
  Building2, 
  Sparkles,
  Database,
  Lock,
  XCircle,
  Zap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { 
  fetchOrganizations, 
  discoverFileColumns, 
  uploadMaterialCatalog, 
  processIngestionJob, 
  fetchIngestionJobStatus 
} from '../../services/api';
import { 
  CPSEOrganization, 
  ColumnDiscoveryData, 
  IngestionJobStatusData 
} from '../../types';

interface DataIngestionViewProps {
  onNavigateToWorkspace?: () => void;
  onNavigateToAnalytics?: () => void;
}

export const DataIngestionView: React.FC<DataIngestionViewProps> = ({
  onNavigateToWorkspace,
  onNavigateToAnalytics,
}) => {
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState<CPSEOrganization[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');
  const [loadingOrgs, setLoadingOrgs] = useState<boolean>(true);
  
  // File & Discovery State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [discovering, setDiscovering] = useState<boolean>(false);
  const [discoveryData, setDiscoveryData] = useState<ColumnDiscoveryData | null>(null);
  const [discoveryError, setDiscoveryError] = useState<string | null>(null);

  // Ingestion Job Execution State
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<boolean>(false);
  const [jobStatus, setJobStatus] = useState<IngestionJobStatusData | null>(null);
  const [jobError, setJobError] = useState<string | null>(null);
  const [pollingActive, setPollingActive] = useState<boolean>(false);

  // Load organizations on mount
  useEffect(() => {
    async function loadOrgs() {
      try {
        setLoadingOrgs(true);
        const data = await fetchOrganizations();
        const validList = Array.isArray(data) ? data : [];
        setOrganizations(validList);
        if (validList.length > 0) {
          if (user?.organization_id) {
            setSelectedOrgId(user.organization_id);
          } else {
            const defaultOrg = validList.find(o => o.code === 'IOCL') || validList[0];
            setSelectedOrgId(defaultOrg.id);
          }
        }
      } catch (err) {
        console.error('Failed to load organizations:', err);
        setOrganizations([]);
      } finally {
        setLoadingOrgs(false);
      }
    }
    loadOrgs();
  }, [user]);

  // Handle file selection and auto-run discovery
  const handleFileChange = async (file: File) => {
    const name = file.name.toLowerCase();
    if (name.endsWith('.xls')) {
      setDiscoveryError('Legacy Excel (.xls) binary format is rejected for security. Please upload modern .xlsx or RFC 4180 .csv files.');
      setSelectedFile(null);
      setDiscoveryData(null);
      return;
    }

    if (!name.endsWith('.csv') && !name.endsWith('.xlsx')) {
      setDiscoveryError('Unsupported file format. Please upload a standard .csv or .xlsx file.');
      setSelectedFile(null);
      setDiscoveryData(null);
      return;
    }

    setSelectedFile(file);
    setDiscoveryError(null);
    setDiscovering(true);
    setJobStatus(null);
    setJobError(null);

    try {
      const data = await discoverFileColumns(file);
      setDiscoveryData(data);
      setColumnMapping(data.suggested_mapping || {});
    } catch (err: unknown) {
      setDiscoveryError(err instanceof Error ? err.message : 'Failed to inspect file columns.');
      setDiscoveryData(null);
    } finally {
      setDiscovering(false);
    }
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // Quick Demo Catalog Loader
  const loadDemoCatalog = (type: 'fasteners' | 'valves' | 'motors') => {
    let content = '';
    let filename = '';

    if (type === 'fasteners') {
      filename = 'demo_fasteners_catalog.csv';
      content = `local_material_code,item_description,uom,material_grade,standard_code,purchase_price_inr
IOCL-BLT-9001,HEX BOLT M20 X 100 SS304 IS 1363,NOS,SS304,IS 1363,245.00
IOCL-BLT-9002,HEX NUT M20 SS304 GRADE A2-70,NOS,SS304,IS 1364,85.50
IOCL-BLT-9003,STUD BOLT 3/4 INCH X 120MM ASTM A193 B7,NOS,ASTM A193 B7,ASME B18.31.2,410.00
IOCL-BLT-9004,SPRING WASHER M20 HIGH TENSILE ZINC,NOS,EN8,IS 3063,18.00
IOCL-BLT-9005,STAINLESS STEEL SOCKET HEAD CAP SCREW M16X60 SS316,NOS,SS316,DIN 912,185.00`;
    } else if (type === 'valves') {
      filename = 'demo_industrial_valves.csv';
      content = `local_material_code,item_description,uom,material_grade,standard_code,purchase_price_inr
ONGC-VLV-401,GATE VALVE 2 INCH 150 CLASS FLANGED WCB,NOS,ASTM A216 WCB,API 600,12500.00
ONGC-VLV-402,BALL VALVE 1.5 INCH 300 CLASS SS316 3-PIECE,NOS,SS316,API 6D,18900.00
ONGC-VLV-403,GLOBE VALVE 4 INCH 300 CLASS FLANGED CS,NOS,ASTM A216 WCB,BS 1873,34500.00
ONGC-VLV-404,CHECK VALVE 2 INCH CLASS 150 DUAL PLATE WAFER,NOS,CF8M,API 594,9800.00`;
    } else {
      filename = 'demo_electric_motors.csv';
      content = `local_material_code,item_description,uom,material_grade,standard_code,purchase_price_inr
BHEL-MTR-101,3-PHASE SQUIRREL CAGE INDUCTION MOTOR 75KW 1500RPM 415V IE3,NOS,CAST IRON,IS 12615,145000.00
BHEL-MTR-102,FLAMEPROOF MOTOR 45KW 4-POLE EX-D ZONE 1 415V,NOS,EN GJL 250,IS/IEC 60079,210000.00
BHEL-MTR-103,HIGH VOLTAGE INDUCTION MOTOR 350KW 6.6KV 1000RPM,NOS,FABRICATED STEEL,IEC 60034,850000.00`;
    }

    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const file = new File([blob], filename, { type: 'text/csv' });
    handleFileChange(file);
  };

  // Submit Ingestion Upload & Start Processing
  const handleStartIngestion = async () => {
    if (!selectedFile || !selectedOrgId) {
      setJobError('Please select an organization and upload a file.');
      return;
    }

    setUploading(true);
    setJobError(null);

    try {
      // Step 1: Upload catalog file
      const uploadRes = await uploadMaterialCatalog(selectedOrgId, selectedFile);
      const jobId = uploadRes.job_id;

      // Step 2: Trigger processing job with column mappings
      await processIngestionJob(jobId, columnMapping);

      // Step 3: Fetch initial status
      const statusRes = await fetchIngestionJobStatus(jobId);
      setJobStatus(statusRes);

      // Step 4: Poll status until complete
      setPollingActive(true);
      const interval = setInterval(async () => {
        try {
          const updated = await fetchIngestionJobStatus(jobId);
          setJobStatus(updated);
          if (['COMPLETED', 'FAILED', 'PARTIAL_SUCCESS'].includes(updated.status)) {
            clearInterval(interval);
            setPollingActive(false);
          }
        } catch {
          clearInterval(interval);
          setPollingActive(false);
        }
      }, 1500);
    } catch (err: unknown) {
      setJobError(err instanceof Error ? err.message : 'Ingestion execution failed.');
    } finally {
      setUploading(false);
    }
  };

  const orgList = Array.isArray(organizations) ? organizations : [];
  const selectedOrg = orgList.find((o) => o.id === selectedOrgId);

  return (
    <div className="space-y-6 animate-fadeIn text-left">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-brand-50 text-brand-600 rounded-lg border border-brand-200">
              <UploadCloud className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
              Multi-Sector Ingestion Engine
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight sm:text-2xl">
            CPSE Material Master Data Ingestion & Normalization
          </h2>
          <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
            Upload material catalogs in <strong>CSV</strong> or <strong>Excel (.xlsx)</strong> format. The pipeline automatically calculates SHA-256 integrity hashes, detects schemas, segregates confidential commercial pricing into private <strong>Layer 1</strong>, and dispatches normalized engineering attributes to <strong>Layer 2</strong> for AI similarity matching.
          </p>
        </div>

        {/* Quick Demo Preloads */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 shrink-0 space-y-2">
          <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-500" />
            1-Click Demo Catalogs
          </span>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => loadDemoCatalog('fasteners')}
              className="px-2.5 py-1 text-[11px] bg-white hover:bg-slate-100 text-slate-800 font-medium rounded-lg border border-slate-300 shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
            >
              🔩 Fasteners
            </button>
            <button
              onClick={() => loadDemoCatalog('valves')}
              className="px-2.5 py-1 text-[11px] bg-white hover:bg-slate-100 text-slate-800 font-medium rounded-lg border border-slate-300 shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
            >
              🚰 Valves
            </button>
            <button
              onClick={() => loadDemoCatalog('motors')}
              className="px-2.5 py-1 text-[11px] bg-white hover:bg-slate-100 text-slate-800 font-medium rounded-lg border border-slate-300 shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
            >
              ⚡ Motors
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Organization & Upload Area */}
        <div className="lg:col-span-6 space-y-6">
          {/* 1. Target Organization Selector */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-brand-600" />
                1. Select CPSE Organization
              </label>
              {selectedOrg && (
                <span className="text-[10px] font-mono bg-brand-50 text-brand-700 border border-brand-200 px-2 py-0.5 rounded font-semibold">
                  {selectedOrg.organization_type} • {selectedOrg.sector}
                </span>
              )}
            </div>

            {loadingOrgs ? (
              <div className="p-3 text-xs text-slate-500 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Loading CPSE registry...
              </div>
            ) : (
              <select
                value={selectedOrgId}
                onChange={(e) => setSelectedOrgId(e.target.value)}
                disabled={Boolean(user?.organization_id)}
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl p-3 text-xs focus:border-brand-500 focus:outline-hidden font-medium"
              >
                {orgList.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.code} — {org.name} ({org.sector})
                  </option>
                ))}
              </select>
            )}

            {user?.organization_id && (
              <p className="text-[11px] text-slate-500 italic">
                * Locked to your authenticated tenant: <strong>{user.organization_code}</strong>
              </p>
            )}
          </div>

          {/* 2. File Drag & Drop Zone */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4">
            <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-brand-600" />
              2. Upload Material Catalog (.csv / .xlsx)
            </label>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
                isDragging
                  ? 'border-brand-500 bg-brand-50'
                  : 'border-slate-300 hover:border-brand-400 bg-slate-50/70 hover:bg-slate-50'
              }`}
              onClick={() => document.getElementById('catalog-file-input')?.click()}
            >
              <input
                id="catalog-file-input"
                type="file"
                accept=".csv, .xlsx"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
              />

              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="p-3 bg-brand-50 text-brand-600 rounded-full border border-brand-200 shadow-inner">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    {selectedFile ? selectedFile.name : 'Click to browse or drag & drop catalog file'}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Supports <strong>CSV (RFC 4180)</strong> and <strong>Excel (.xlsx)</strong> up to 50 MB
                  </p>
                </div>
                {selectedFile && (
                  <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-semibold">
                    Size: {(selectedFile.size / 1024).toFixed(1)} KB • Ready for Ingestion
                  </span>
                )}
              </div>
            </div>

            {discoveryError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{discoveryError}</span>
              </div>
            )}
          </div>

          {/* 3. Layer 1 Sensitive Data Privacy Guarantee */}
          <div className="p-4 bg-slate-100 border border-slate-200 rounded-xl text-xs space-y-2">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-[11px] uppercase tracking-wider">
              <Lock className="w-3.5 h-3.5" />
              Layer 1 Sensitive Data Sanitization Guarantee
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Commercial purchase prices, vendor details, and purchase order numbers remain <strong>tenant-isolated in Layer 1</strong>. Only normalized engineering specifications (dimensions, metallurgy, standards) are shared for cross-CPSE AI matching.
            </p>
          </div>
        </div>

        {/* Right Column: Schema Preview & Ingestion Monitor */}
        <div className="lg:col-span-6 space-y-6">
          {discovering ? (
            <div className="bg-white border border-slate-200 p-12 rounded-2xl flex flex-col items-center justify-center text-center space-y-3 shadow-xs">
              <div className="w-8 h-8 border-3 border-brand-500/20 border-t-brand-600 rounded-full animate-spin" />
              <p className="text-xs font-bold text-slate-900">Inspecting Schema & Parsing Headers...</p>
              <p className="text-[11px] text-slate-500">Detecting column taxonomy, UOMs, and technical attributes</p>
            </div>
          ) : discoveryData ? (
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="space-y-0.5">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                    3. Column Discovery & Preview
                  </h3>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {discoveryData.filename} • {discoveryData.estimated_row_count} items detected
                  </span>
                </div>
                <span className="text-[10px] bg-brand-50 text-brand-700 border border-brand-200 px-2 py-0.5 rounded font-semibold">
                  Format: {discoveryData.file_type}
                </span>
              </div>

              {/* Sample Rows Preview Table */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-slate-700">Catalog Preview (Top 5 Records):</span>
                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        {discoveryData.detected_columns.map((col) => (
                          <th key={col} className="p-2.5 whitespace-nowrap">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {discoveryData.sample_rows.slice(0, 4).map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          {discoveryData.detected_columns.map((col) => (
                            <td key={col} className="p-2.5 whitespace-nowrap font-mono text-[10px]">
                              {String(row[col] ?? '')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Ingestion Trigger Button */}
              <div className="pt-2">
                <button
                  onClick={handleStartIngestion}
                  disabled={uploading || pollingActive}
                  className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer text-xs"
                >
                  {uploading || pollingActive ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Ingesting & Running AI Normalization...</span>
                    </>
                  ) : (
                    <>
                      <span>Execute Ingestion & Normalization</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 p-12 rounded-2xl flex flex-col items-center justify-center text-center space-y-3 shadow-xs">
              <Database className="w-10 h-10 text-slate-400" />
              <p className="text-xs font-bold text-slate-800">No Catalog File Selected</p>
              <p className="text-[11px] text-slate-500 max-w-sm">
                Upload a CSV or Excel file or click one of the <strong>1-Click Demo Catalogs</strong> on top to preview the schema.
              </p>
            </div>
          )}

          {/* 4. Ingestion Job Execution Status & Results */}
          {jobStatus && (
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  {jobStatus.status === 'COMPLETED' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : jobStatus.status === 'FAILED' ? (
                    <XCircle className="w-4 h-4 text-rose-600" />
                  ) : (
                    <RefreshCw className="w-4 h-4 text-brand-600 animate-spin" />
                  )}
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Ingestion Status: {jobStatus.status}
                  </h3>
                </div>
                <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">
                  Job ID: {jobStatus.job_id.slice(0, 8)}...
                </span>
              </div>

              {/* Progress Summary Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-500 block uppercase font-semibold">Total Items</span>
                  <span className="text-base font-bold text-slate-900">{jobStatus.total_rows}</span>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                  <span className="text-[10px] text-emerald-700 block uppercase font-semibold">Processed</span>
                  <span className="text-base font-bold text-emerald-800">{jobStatus.processed_rows}</span>
                </div>
                <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-center">
                  <span className="text-[10px] text-rose-700 block uppercase font-semibold">Errors / Failed</span>
                  <span className="text-base font-bold text-rose-800">{jobStatus.failed_rows}</span>
                </div>
              </div>

              {jobStatus.status === 'COMPLETED' && (
                <div className="space-y-3 pt-2">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Ingestion & AI Normalization Complete!</strong>
                      <p className="text-[11px] text-emerald-700 mt-0.5">
                        All materials have been normalized, technical attributes extracted, and candidate matching pipelines triggered.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {onNavigateToWorkspace && (
                      <button
                        onClick={onNavigateToWorkspace}
                        className="flex-1 py-2.5 px-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <span>Open CNMC Workspace</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {onNavigateToAnalytics && (
                      <button
                        onClick={onNavigateToAnalytics}
                        className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-slate-300"
                      >
                        <span>View Analytics Matrix</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {jobError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{jobError}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
