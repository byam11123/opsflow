import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { PurchaseFMSSummary, PurchasePipelineItem, PurchasePipelineStatus } from '../types';
import {
  LayoutDashboard,
  Search,
  RefreshCw,
  PackageSearch,
  ShoppingCart,
  Truck,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Filter,
  User,
  Clock,
  Calendar,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';


import { 
  BellRing,
  MessageSquareWarning,
  Upload,
  FileText
} from 'lucide-react';

function DelayedTaskReport({ items }: { items: PurchasePipelineItem[] }) {
  const delayedItems = items.filter(i => i.currentBottleneck && parseInt(i.currentBottleneck.delay || '0') > 0);
  
  const summaryByStage = delayedItems.reduce((acc, item) => {
    const stage = item.currentBottleneck!.stageName;
    const owner = item.currentBottleneck!.responsible;
    const key = `${stage}-${owner}`;
    if (!acc[key]) {
      acc[key] = { stage, owner, count: 0, maxDelay: 0, sheet: item.currentBottleneck!.sheet };
    }
    acc[key].count += 1;
    acc[key].maxDelay = Math.max(acc[key].maxDelay, parseInt(item.currentBottleneck!.delay || '0'));
    return acc;
  }, {} as Record<string, any>);

  return (
    <div className="flex flex-col gap-8">
      {/* Detail Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/60 overflow-hidden">
        <div className="bg-slate-800 px-6 py-3 border-b border-slate-700">
          <h3 className="text-white font-bold text-sm tracking-wide uppercase">Pending / Delayed Task Report — All FMS</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">S.No</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">FMS Name</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Stage / Checkpoint</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Stage Owner (Who)</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">PO / Indent No.</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Site</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Delay (Days)</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-600">Priority</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {delayedItems.length === 0 ? (
                 <tr>
                   <td colSpan={9} className="px-4 py-8 text-center text-slate-500 font-medium">No delayed tasks found.</td>
                 </tr>
              ) : (
                delayedItems.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-rose-50/30 transition-colors">
                    <td className="px-4 py-3 text-slate-500 font-medium">{idx + 1}</td>
                    <td className="px-4 py-3 text-slate-700 font-semibold">{item.currentBottleneck?.sheet} to {item.currentBottleneck?.sheet === 'Indent' ? 'PO' : 'Dispatch'}</td>
                    <td className="px-4 py-3 text-slate-900 font-medium max-w-[200px] truncate" title={item.currentBottleneck?.stageName}>
                      {item.currentBottleneck?.stageName}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{item.currentBottleneck?.responsible}</td>
                    <td className="px-4 py-3 font-mono text-slate-600">{item.poNumber || item.indentNo}</td>
                    <td className="px-4 py-3 text-slate-600">{item.siteName}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-rose-100 text-rose-700 font-bold">
                         {item.currentBottleneck?.delay}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-amber-600">{item.priority}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 mx-auto bg-indigo-50 px-2 py-1 rounded">
                        <BellRing className="h-3 w-3" /> Remind
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Summary Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/60 overflow-hidden w-full max-w-4xl">
        <div className="bg-slate-700 px-6 py-3 border-b border-slate-600">
          <h3 className="text-white font-bold text-sm tracking-wide uppercase">Pending Task Count By FMS / Stage</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">FMS Name</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Stage / Checkpoint</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Stage Owner (Who)</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-600">Pending Count</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-600">Max Delay (Days)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {Object.values(summaryByStage).length === 0 ? (
                 <tr>
                   <td colSpan={5} className="px-4 py-8 text-center text-slate-500 font-medium">No delayed tasks summary.</td>
                 </tr>
              ) : (
                Object.values(summaryByStage).map((row: any, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-700 font-semibold">{row.sheet} to {row.sheet === 'Indent' ? 'PO' : 'Dispatch'}</td>
                    <td className="px-4 py-3 text-slate-900 font-medium">{row.stage}</td>
                    <td className="px-4 py-3 text-slate-700">{row.owner}</td>
                    <td className="px-4 py-3 text-center font-bold text-slate-700">{row.count}</td>
                    <td className="px-4 py-3 text-center font-bold text-rose-600">{row.maxDelay}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function PurchaseFMSView() {
  const { user } = useAuth();
  
  const [summary, setSummary] = useState<PurchaseFMSSummary | null>(null);
  const [items, setItems] = useState<PurchasePipelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);

  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'pipeline' | 'report'>('pipeline');

  // Filters
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PurchasePipelineStatus | 'ALL'>('ALL');
  const [page, setPage] = useState(1);
  const pageSize = 25;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchData();
  }, [debouncedSearch, statusFilter, page]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sumRes, pipeRes] = await Promise.all([
        api.getPurchaseFMSSummary(),
        api.getPurchaseFMSPipeline({
          search: debouncedSearch,
          status: statusFilter === 'ALL' ? undefined : statusFilter,
          page,
          pageSize
        })
      ]);
      setSummary(sumRes);
      setItems(pipeRes.items);
      setTotalItems(pipeRes.pagination.totalItems);
    } catch (error) {
      console.error('Failed to fetch Purchase FMS data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: PurchasePipelineStatus) => {
    switch (status) {
      case 'Pending PO':
        return <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-amber-50 text-amber-600 border border-amber-200">Pending PO</span>;
      case 'Pending Material':
        return <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-blue-50 text-blue-600 border border-blue-200">Pending Material</span>;
      case 'Pending Dispatch':
        return <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-indigo-50 text-indigo-600 border border-indigo-200">Pending Dispatch</span>;
      case 'Completed':
        return <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-emerald-50 text-emerald-600 border border-emerald-200">Completed</span>;
      default:
        return null;
    }
  };

  const handleStatusToggle = (status: PurchasePipelineStatus) => {
    setStatusFilter(prev => prev === status ? 'ALL' : status);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Purchase FMS Pipeline</h2>
              <p className="text-sm text-slate-500 mt-1">End-to-End Tracking: Indent → PO → Material → Dispatch</p>
            </div>
          </div>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 text-sm font-medium rounded-xl transition-colors border border-slate-200"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Metrics */}
      {/* View Toggle */}
      <div className="flex items-center gap-4 mb-6 border-b border-slate-200 pb-4">
        <button onClick={() => setViewMode('pipeline')} className={`text-sm font-bold px-4 py-2 rounded-lg transition-colors ${viewMode === 'pipeline' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}>Pipeline Flow</button>
        <button onClick={() => setViewMode('report')} className={`text-sm font-bold px-4 py-2 rounded-lg transition-colors ${viewMode === 'report' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}>Delayed Task Report</button>
      </div>

      {viewMode === 'pipeline' && summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-100/60 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full translate-x-8 -translate-y-8 opacity-50"></div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                <PackageSearch className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Total Indents</p>
                <p className="text-2xl font-bold text-slate-800 mt-0.5">{summary.totalIndents}</p>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => handleStatusToggle('Pending PO')}
            className={`bg-white p-5 rounded-2xl border transition-all text-left relative overflow-hidden ${statusFilter === 'Pending PO' ? 'border-amber-400 ring-4 ring-amber-50 shadow-sm' : 'border-slate-100/60 shadow-xs hover:border-amber-200'}`}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-full translate-x-8 -translate-y-8 opacity-50"></div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Pending PO</p>
                <p className="text-2xl font-bold text-amber-600 mt-0.5">{summary.pendingPO}</p>
              </div>
            </div>
          </button>

          <button 
            onClick={() => handleStatusToggle('Pending Material')}
            className={`bg-white p-5 rounded-2xl border transition-all text-left relative overflow-hidden ${statusFilter === 'Pending Material' ? 'border-blue-400 ring-4 ring-blue-50 shadow-sm' : 'border-slate-100/60 shadow-xs hover:border-blue-200'}`}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full translate-x-8 -translate-y-8 opacity-50"></div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Pending Material</p>
                <p className="text-2xl font-bold text-blue-600 mt-0.5">{summary.pendingMaterial}</p>
              </div>
            </div>
          </button>

          <button 
            onClick={() => handleStatusToggle('Pending Dispatch')}
            className={`bg-white p-5 rounded-2xl border transition-all text-left relative overflow-hidden ${statusFilter === 'Pending Dispatch' ? 'border-indigo-400 ring-4 ring-indigo-50 shadow-sm' : 'border-slate-100/60 shadow-xs hover:border-indigo-200'}`}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full translate-x-8 -translate-y-8 opacity-50"></div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Ready / Dispatched</p>
                <p className="text-2xl font-bold text-indigo-600 mt-0.5">{summary.pendingDispatch + summary.dispatched}</p>
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/60 flex flex-col">
        {/* Filters */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50 rounded-t-2xl">
          <div className="relative w-full sm:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search by Indent No, PO No, Vendor..."
              className="block w-full pl-10 pr-3 py-2 text-sm border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
              <Filter className="h-3.5 w-3.5" />
              Total Items: <strong className="text-slate-700">{totalItems}</strong>
            </span>
            {statusFilter !== 'ALL' && (
              <button
                onClick={() => setStatusFilter('ALL')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Clear Filter
              </button>
            )}
          </div>
        </div>

        {/* Data Table */}
        {loading && items.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-slate-500">
            <RefreshCw className="h-8 w-8 animate-spin text-indigo-500 mb-4" />
            <p className="text-sm font-medium">Loading Pipeline Data...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="p-16 text-center">
            <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800 mb-1">No matches found</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              We couldn't find any records matching your current filter criteria.
            </p>
            {(search || statusFilter !== 'ALL') && (
              <button
                onClick={() => {
                  setSearch('');
                  setStatusFilter('ALL');
                }}
                className="mt-4 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-medium hover:bg-indigo-100 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-1/4">
    Indent & Requisition
  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-1/4">
                    PO & Vendor
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-1/4">
    Current Bottleneck
  </th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider w-1/4">
                    Current Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {items.map((item) => (
                  <React.Fragment key={item.id}>
                    <tr 
                      className={`hover:bg-slate-50 transition-colors group cursor-pointer ${expandedRow === item.id ? 'bg-indigo-50/30' : ''}`}
                      onClick={() => setExpandedRow(prev => prev === item.id ? null : item.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${expandedRow === item.id ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-indigo-50 text-indigo-600 border-indigo-100/50'}`}>
                            {expandedRow === item.id ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">#{item.indentNo}</p>
   {item.requisitionNo && <p className="text-[11px] font-medium text-slate-500 mt-0.5 uppercase tracking-wider">REQ: {item.requisitionNo}</p>}
   <p className="text-xs text-slate-500 mt-0.5">{item.siteName} • {item.indentDate}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {item.poGenerated ? (
                          <div>
                            <p className="text-sm font-semibold text-slate-700">{item.poNumber || 'PO Generated'}</p>
                            {item.vendorName && <p className="text-xs text-slate-500 mt-1 truncate max-w-xs" title={item.vendorName}>{item.vendorName}</p>}
                          </div>
                        ) : (
                          <p className="text-sm text-slate-400 italic">Not Generated</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
    {item.currentBottleneck ? (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
           <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
           <span className="text-xs font-bold text-slate-700 truncate max-w-[200px]" title={item.currentBottleneck.stageName}>{item.currentBottleneck.stageName}</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-500 ml-3.5">
           <User className="h-3 w-3" />
           <span className="truncate max-w-[150px]">{item.currentBottleneck.responsible}</span>
        </div>
        {item.currentBottleneck.delay && parseInt(item.currentBottleneck.delay) > 0 && (
           <span className="text-[10px] text-rose-600 font-semibold ml-3.5 mt-0.5 flex items-center gap-1">
             <AlertTriangle className="h-3 w-3" /> Delay: {item.currentBottleneck.delay} days
           </span>
        )}
      </div>
    ) : (
      <div className="flex items-center gap-2 text-emerald-600 text-xs font-semibold">
        <CheckCircle2 className="h-4 w-4" /> Fully Completed
      </div>
    )}
  </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        {getStatusBadge(item.status)}
                      </td>
                    </tr>
                    <AnimatePresence>
                      {expandedRow === item.id && (
                        <tr>
                          <td colSpan={4} className="p-0 border-b border-slate-200">
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden bg-slate-50/80"
                            >
                              
                              <div className="p-6 bg-slate-50 border-t border-slate-200">
                                <h4 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
                                  <Truck className="h-4 w-4 text-indigo-500" />
                                  Process Flow & Accountability
                                </h4>
                                <div className="flex flex-wrap items-start gap-y-8 gap-x-2 relative">
                                  {item.stages && item.stages.length > 0 ? (
                                    item.stages.map((stage, idx) => {
                                      const isDiamond = stage.name.startsWith('IS ') || stage.name.endsWith('?');
                                      const completedStatuses = ['Done', 'Yes', 'Y', 'No', 'N', 'NA', 'N/A'];
                                      const isDone = completedStatuses.includes(stage.status);
                                      const isDelay = stage.delay && parseInt(stage.delay) > 0;
                                      const bgClass = isDone ? 'bg-emerald-50 border-emerald-200' : (isDelay ? 'bg-rose-50 border-rose-200 shadow-sm shadow-rose-100' : 'bg-white border-slate-200');
                                      const iconClass = isDone ? 'text-emerald-500' : (isDelay ? 'text-rose-500' : 'text-slate-400');
                                      
                                      return (
                                      <React.Fragment key={stage.id}>
                                        <div className={`relative flex flex-col items-center group w-[220px] shrink-0`}>
                                          {/* Connecting Line */}
                                          {idx !== item.stages.length - 1 && (
                                            <div className="hidden md:block absolute top-10 -right-2 w-4 h-0.5 bg-slate-300 z-0" />
                                          )}
                                          
                                          {/* Flowchart Node Shape */}
                                          <div className={`relative z-10 p-3 flex flex-col items-center justify-center text-center transition-all ${bgClass} ${isDiamond ? 'border-2 transform rotate-45 w-24 h-24 mt-2 mb-8 rounded-lg' : 'border-2 w-full rounded-xl min-h-[90px]'}`}>
                                            <div className={`${isDiamond ? '-rotate-45 w-[120px] absolute' : 'w-full'}`}>
                                              <p className={`text-[10px] font-bold leading-tight ${isDone ? 'text-emerald-800' : 'text-slate-700'}`}>
                                                {stage.name}
                                              </p>
                                            </div>
                                            {!isDiamond && (
    <React.Fragment>
      <React.Fragment>{item.currentBottleneck?.stageName === stage.name {item.currentBottleneck?.stageName === stage.name && !isDone && ({item.currentBottleneck?.stageName === stage.name && !isDone && ( !isDone {item.currentBottleneck?.stageName === stage.name && !isDone && ({item.currentBottleneck?.stageName === stage.name && !isDone && ( (
      <div className="w-full mt-2 p-2 bg-rose-50 border border-rose-200 rounded-lg shadow-sm flex flex-col gap-2">
         <div className="flex items-center gap-1 text-[9px] font-bold text-rose-700">
           <MessageSquareWarning className="h-3 w-3" /> Action Required
         </div>
         <input type="text" placeholder="Reason for delay..." className="w-full text-[10px] px-2 py-1 rounded border border-rose-200 bg-white placeholder-slate-400 focus:outline-none focus:border-rose-400" />
         <div className="flex items-center gap-1">
           <button className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-[9px] font-bold py-1 rounded flex items-center justify-center gap-1 transition-colors">
             <BellRing className="h-2.5 w-2.5" /> Remind
           </button>
           <button className="flex-1 bg-white hover:bg-slate-50 text-slate-600 border border-slate-300 text-[9px] font-bold py-1 rounded flex items-center justify-center gap-1 transition-colors" title="Upload proof (coming soon)">
             <Upload className="h-2.5 w-2.5" /> Upload
           </button>
         </div>
      </div>
    )}
  <div className="mt-2 w-full pt-2 border-t border-slate-200/60 flex flex-col items-center gap-1">
                                                <div className="flex items-center gap-1 text-[9px] font-semibold text-slate-500 max-w-full px-1">
                                                  <User className="h-3 w-3 shrink-0" />
                                                  <span className="truncate">{stage.responsible || 'Unassigned'}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-[9px] mt-1 w-full justify-center">
                                                  <span className="text-slate-400">P: {stage.plannedDate || '-'}</span>
                                                  <span className={`font-semibold ${isDone ? 'text-emerald-600' : 'text-slate-600'}`}>A: {stage.actualDate || '-'}</span>
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                          
                                          {isDiamond && (
                                            {item.currentBottleneck?.stageName === stage.name && !isDone && isDiamond && (
      <div className="w-[180px] -mt-2 mb-4 p-2 bg-rose-50 border border-rose-200 rounded-lg shadow-sm flex flex-col gap-2 relative z-20">
         <div className="flex items-center gap-1 text-[9px] font-bold text-rose-700">
           <MessageSquareWarning className="h-3 w-3" /> Action Required
         </div>
         <input type="text" placeholder="Reason for delay..." className="w-full text-[10px] px-2 py-1 rounded border border-rose-200 bg-white placeholder-slate-400 focus:outline-none focus:border-rose-400" />
         <div className="flex items-center gap-1">
           <button className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-[9px] font-bold py-1 rounded flex items-center justify-center gap-1 transition-colors">
             <BellRing className="h-2.5 w-2.5" /> Remind
           </button>
           <button className="flex-1 bg-white hover:bg-slate-50 text-slate-600 border border-slate-300 text-[9px] font-bold py-1 rounded flex items-center justify-center gap-1 transition-colors" title="Upload proof (coming soon)">
             <Upload className="h-2.5 w-2.5" /> Upload
           </button>
         </div>
      </div>
  )}
  <div className="mt-4 flex flex-col items-center text-[9px]">
                                                <div className="flex flex-col items-center gap-1 text-[9px] font-semibold text-slate-500 max-w-full px-1">
                                                  <User className="h-3 w-3 shrink-0" />
                                                  <span className="truncate">{stage.responsible || 'Unassigned'}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-[9px] mt-1 w-full justify-center">
                                                  <span className="text-slate-400">P: {stage.plannedDate || '-'}</span>
                                                  <span className={`font-semibold ${isDone ? 'text-emerald-600' : 'text-slate-600'}`}>A: {stage.actualDate || '-'}</span>
                                                </div>
                                            </div>
                                          )}

                                          {/* Status Badge */}
                                          {!isDiamond && (
                                          <div className={`absolute -top-2.5 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase border ${isDone ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : (isDelay ? 'bg-rose-100 text-rose-700 border-rose-200' : 'bg-slate-100 text-slate-500 border-slate-200')}`}>
                                            {isDone ? 'Done' : (stage.status || 'Pending')}
                                          </div>
                                          )}
                                        </div>
                                        {idx !== item.stages.length - 1 && (
                                           <div className="hidden md:flex items-center justify-center shrink-0 w-8 h-20 text-slate-300">
                                              <ChevronRight className="h-6 w-6" />
                                           </div>
                                        )}
                                      </React.Fragment>
                                      );
                                    })
                                  ) : (
                                    <div className="text-sm text-slate-500 py-4 text-center border border-dashed border-slate-300 rounded-xl bg-white w-full">
                                      No detailed stage tracking available for this record.
                                    </div>
                                  )}
                                </div>
                              </div>

                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalItems > pageSize && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-b-2xl">
            <p className="text-sm text-slate-500">
              Showing <span className="font-medium text-slate-700">{(page - 1) * pageSize + 1}</span> to{' '}
              <span className="font-medium text-slate-700">{Math.min(page * pageSize, totalItems)}</span> of{' '}
              <span className="font-medium text-slate-700">{totalItems}</span> results
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page * pageSize >= totalItems}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
      )}
      
      {viewMode === 'report' && (
        <DelayedTaskReport items={items} />
      )}
    </div>
  );
}
