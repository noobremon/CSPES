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
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-sm text-gray-500 font-medium">Computing Category & Taxonomy Analytics...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center bg-gray-50 rounded-xl border border-gray-200">
        <p className="text-gray-500 text-sm">No category analytics data available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category Overview Summary */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-primary-600" />
            <h3 className="text-base font-bold text-gray-900">Taxonomy & Category Intelligence</h3>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Hierarchical distribution of {data.total_categories} standardized material categories
          </p>
        </div>
        <span className="text-xs font-bold px-3 py-1 bg-primary-50 text-primary-700 border border-primary-100 rounded-full">
          {data.total_categories} Active Categories
        </span>
      </div>

      {/* Category Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.categories.map((cat) => (
          <div 
            key={cat.category_code}
            className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 bg-gray-100 text-gray-800 rounded">
                  {cat.category_code}
                </span>
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
                  {cat.overlap_percentage.toFixed(1)}% overlap
                </span>
              </div>
              <h4 className="text-sm font-bold text-gray-900">{cat.category_name}</h4>
              <p className="text-xs text-gray-500 mt-1">
                {cat.distinct_cpses_involved} participating CPSEs
              </p>
            </div>

            <div className="space-y-3 pt-3 border-t border-gray-100 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <span className="text-gray-500 text-[11px]">Total Items</span>
                  <div className="font-bold text-gray-900 mt-0.5">{cat.total_materials}</div>
                </div>
                <div className="p-2 bg-gray-50 rounded-lg">
                  <span className="text-gray-500 text-[11px]">Standardized</span>
                  <div className="font-bold text-emerald-700 mt-0.5">{cat.standardized_master_count} Masters</div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-gray-600 mb-1">
                  <span>Category Standardization</span>
                  <span className="font-bold text-teal-700">{cat.standardization_rate.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-teal-500 h-2 rounded-full transition-all" 
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
