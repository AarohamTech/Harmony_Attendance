import React from 'react';

export interface Column<T> {
  header: string;
  accessor?: keyof T | ((row: T) => React.ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
  isLoading?: boolean;
  emptyText?: string;
  pagination?: {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyText = 'No records found in database.',
  pagination,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl border border-[#c3c6d7]/70 p-12 text-center shadow-xs">
        <div className="inline-block animate-spin rounded-full h-9 w-9 border-4 border-[#ededf9] border-t-[#2563eb] mb-3" />
        <p className="text-sm font-extrabold text-[#191b23]">Loading PostgreSQL Records...</p>
        <p className="text-xs font-semibold text-[#434655] mt-1">Connecting to live Supabase backend</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-[#c3c6d7]/70 p-12 text-center shadow-xs">
        <p className="text-base font-extrabold text-[#191b23] mb-1">{emptyText}</p>
        <p className="text-xs font-semibold text-[#434655]">Try adjusting your search terms or filters.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-[#c3c6d7]/70 shadow-xs overflow-hidden">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-sm text-[#191b23]">
          <thead className="bg-slate-50/80 border-b border-[#c3c6d7]/60 text-[11px] font-extrabold uppercase tracking-wider text-[#434655]">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className={`px-5 py-3.5 ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row) => (
              <tr key={keyExtractor(row)} className="hover:bg-[#ededf9]/40 transition-colors">
                {columns.map((col, idx) => (
                  <td key={idx} className={`px-5 py-4 whitespace-nowrap text-sm font-medium ${col.className || ''}`}>
                    {typeof col.accessor === 'function'
                      ? col.accessor(row)
                      : col.accessor
                      ? (row[col.accessor] as React.ReactNode)
                      : null}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#c3c6d7]/60 bg-slate-50/50 text-xs font-bold text-[#434655]">
          <div>
            Page <span className="font-extrabold text-[#2563eb]">{pagination.page}</span> of{' '}
            <span className="font-extrabold text-[#191b23]">{pagination.totalPages}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-4 py-1.5 rounded-full border border-[#c3c6d7] bg-white text-[#191b23] hover:bg-[#ededf9] disabled:opacity-40 disabled:cursor-not-allowed transition-all font-bold"
            >
              Previous
            </button>
            <button
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="px-4 py-1.5 rounded-full border border-[#c3c6d7] bg-white text-[#191b23] hover:bg-[#ededf9] disabled:opacity-40 disabled:cursor-not-allowed transition-all font-bold"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
