import { useState } from 'react';

interface TabProps {
  activeTab: number;
  onTabChange: (tab: number) => void;
  hasServiceReportErrors?: boolean;
  hasLoadBankErrors?: boolean;
}

export function FormTabs({ activeTab, onTabChange, hasServiceReportErrors = false, hasLoadBankErrors = false }: TabProps) {
  return (
    <div className="bg-white rounded-t-lg sm:rounded-t-xl shadow-sm border border-gray-200 border-b-0">
      <div className="flex flex-col sm:flex-row gap-1 p-2">
        <button
          onClick={() => onTabChange(0)}
          className={`px-4 sm:px-8 py-2.5 sm:py-3.5 text-sm sm:text-base font-semibold rounded-lg transition-all ${
            activeTab === 0
              ? 'bg-blue-600 text-white shadow-md'
              : hasServiceReportErrors
              ? 'bg-transparent text-gray-600 hover:bg-gray-100 ring-2 ring-red-500'
              : 'bg-transparent text-gray-600 hover:bg-gray-100'
          }`}
        >
          SERVICE REPORT
        </button>
        <button
          onClick={() => onTabChange(1)}
          className={`px-4 sm:px-8 py-2.5 sm:py-3.5 text-sm sm:text-base font-semibold rounded-lg transition-all ${
            activeTab === 1
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-transparent text-gray-600 hover:bg-gray-100'
          }`}
        >
          Additional ATS
        </button>
        <button
          onClick={() => onTabChange(2)}
          className={`px-4 sm:px-8 py-2.5 sm:py-3.5 text-sm sm:text-base font-semibold rounded-lg transition-all ${
            activeTab === 2
              ? 'bg-blue-600 text-white shadow-md'
              : hasLoadBankErrors
              ? 'bg-transparent text-gray-600 hover:bg-gray-100 ring-2 ring-red-500'
              : 'bg-transparent text-gray-600 hover:bg-gray-100'
          }`}
        >
          LOAD BANK REPORT
        </button>
      </div>
    </div>
  );
}
