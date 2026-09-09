import React from 'react';
import { 
  PieChart, 
  Layers, 
  Building2, 
  Copy, 
  CheckCircle2, 
  Sparkles 
} from 'lucide-react';
import type { CategoryAnalyticsResponse } from '../../types';

interface CategoryAnalyticsViewProps {
  data: CategoryAnalyticsResponse | null;
  loading: boolean;
}

export const CategoryAnalyticsView: React.FC<CategoryAnalyticsViewProps> = ({
  data,
  loading
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gov-navy"></div>
        <span className="ml-3 text-sm text-slate-600 font-medium">Computing Category & Taxonomy Analytics...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <p className="text-slate-500 text-sm">No category analytics data available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category Overview Summary */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-gov-navy" />
            <h3 className="text-base font-bold text-slate-900">Taxonomy & Category Intelligence</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Hierarchical distribution of {data.total_categories} standardized material categories
          </p>
        </div>
        <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-gov-navy border border-slate-300 rounded-full">
          {data.total_categories} Active Categories
        </span>
      </div>

      {/* Category Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.categories.map((cat) => (
          <div 
            key={cat.category_code}
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-800 rounded">
                  {cat.category_code}
                </span>
                <span className="text-xs font-bold text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                  {cat.overlap_percentage.toFixed(1)}% overlap
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900">{cat.category_name}</h4>
              <p className="text-xs text-slate-500 mt-1">
                {cat.distinct_cpses_involved} participating CPSEs
              </p>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-200/60">
                  <span className="text-slate-500 text-[11px]">Total Items</span>
                  <div className="font-bold text-slate-900 mt-0.5">{cat.total_materials}</div>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-200/60">
                  <span className="text-slate-500 text-[11px]">Standardized</span>
                  <div className="font-bold text-emerald-800 mt-0.5">{cat.standardized_master_count} Masters</div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-600 mb-1 font-medium">
                  <span>Category Standardization</span>
                  <span className="font-bold text-teal-800">{cat.standardization_rate.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/60">
                  <div 
                    className="bg-teal-600 h-2 rounded-full transition-all" 
                    style={{ width: `${Math.min(100, cat.standardization_rate)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
