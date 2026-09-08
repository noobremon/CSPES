import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Copy, 
  Grid3X3, 
  ShieldCheck, 
  TrendingUp, 
  Target, 
  PieChart,
  RefreshCw
} from 'lucide-react';
import { api } from '../../services/api';
import type { 
  NationalDashboardResponse, 
  DuplicateAnalyticsResponse, 
  CrossCPSEMatrixResponse, 
  CNMCStandardizationAnalyticsResponse, 
  ProcurementOpportunityResponse, 
  RationalizationPriorityResponse, 
  CategoryAnalyticsResponse 
} from '../../types';

import { NationalOverviewDashboard } from './NationalOverviewDashboard';
import { DuplicateIntelligenceView } from './DuplicateIntelligenceView';
import { CrossCPSEOverlapMatrix } from './CrossCPSEOverlapMatrix';
import { CNMCStandardizationView } from './CNMCStandardizationView';
import { ProcurementOpportunitiesView } from './ProcurementOpportunitiesView';
import { RationalizationPriorityView } from './RationalizationPriorityView';
import { CategoryAnalyticsView } from './CategoryAnalyticsView';

export const AnalyticsContainer: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<string>('overview');
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Analytics states
  const [nationalData, setNationalData] = useState<NationalDashboardResponse | null>(null);
  const [duplicateData, setDuplicateData] = useState<DuplicateAnalyticsResponse | null>(null);
  const [matrixData, setMatrixData] = useState<CrossCPSEMatrixResponse | null>(null);
  const [cnmcData, setCnmcData] = useState<CNMCStandardizationAnalyticsResponse | null>(null);
  const [opportunityData, setOpportunityData] = useState<ProcurementOpportunityResponse | null>(null);
  const [priorityData, setPriorityData] = useState<RationalizationPriorityResponse | null>(null);
  const [categoryData, setCategoryData] = useState<CategoryAnalyticsResponse | null>(null);

  const fetchAllAnalytics = async () => {
    try {
      setRefreshing(true);
      const [
        nationalRes,
        dupRes,
        matrixRes,
        cnmcRes,
        oppRes,
        prioRes,
        catRes
      ] = await Promise.all([
        api.getNationalDashboard(),
        api.getDuplicateAnalytics(),
        api.getCrossCPSEMatrix(),
        api.getCNMCStandardizationAnalytics(),
        api.getProcurementOpportunities(),
        api.getRationalizationPriorities(),
        api.getCategoryAnalytics()
      ]);

      setNationalData(nationalRes);
      setDuplicateData(dupRes);
      setMatrixData(matrixRes);
      setCnmcData(cnmcRes);
      setOpportunityData(oppRes);
      setPriorityData(prioRes);
      setCategoryData(catRes);
    } catch (err) {
      console.error('Failed to fetch analytics data', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllAnalytics();
  }, []);

  const subTabs = [
    { id: 'overview', label: 'National Overview', icon: BarChart3 },
    { id: 'duplicates', label: 'Duplicate Intelligence', icon: Copy },
    { id: 'matrix', label: 'Cross-CPSE Matrix', icon: Grid3X3 },
    { id: 'standardization', label: 'CNMC Standardization', icon: ShieldCheck },
    { id: 'opportunities', label: 'Procurement Opportunities', icon: TrendingUp },
    { id: 'rationalization', label: 'Rationalization Priorities', icon: Target },
    { id: 'categories', label: 'Taxonomy Breakdown', icon: PieChart },
  ];

  return (
    <div className="space-y-6">
      {/* Sub-navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div className="flex items-center space-x-1 overflow-x-auto pb-2 sm:pb-0">
          {subTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={fetchAllAnalytics}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shrink-0 self-end sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* View Routing */}
      {activeSubTab === 'overview' && (
        <NationalOverviewDashboard 
          data={nationalData} 
          loading={loading} 
          onNavigateToTab={(tab) => setActiveSubTab(tab)} 
        />
      )}
      {activeSubTab === 'duplicates' && (
        <DuplicateIntelligenceView 
          data={duplicateData} 
          loading={loading} 
        />
      )}
      {activeSubTab === 'matrix' && (
        <CrossCPSEOverlapMatrix 
          data={matrixData} 
          loading={loading} 
        />
      )}
      {activeSubTab === 'standardization' && (
        <CNMCStandardizationView 
          data={cnmcData} 
          loading={loading} 
        />
      )}
      {activeSubTab === 'opportunities' && (
        <ProcurementOpportunitiesView 
          data={opportunityData} 
          loading={loading} 
        />
      )}
      {activeSubTab === 'rationalization' && (
        <RationalizationPriorityView 
          data={priorityData} 
          loading={loading} 
        />
      )}
      {activeSubTab === 'categories' && (
        <CategoryAnalyticsView 
          data={categoryData} 
          loading={loading} 
        />
      )}
    </div>
  );
};
