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
  emptyText = 'No records found.',
  pagination,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden p-8 text-center text-slate-500">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-sky-600 mb-3" />
        <p className="text-sm font-medium text-slate-600">Loading PostgreSQL records...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden p-12 text-center text-slate-500">
        <p className="text-base font-semibold text-slate-700 mb-1">{emptyText}</p>
        <p className="text-xs text-slate-400">Try adjusting search or filters to see results.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className={`px-6 py-3.5 ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row) => (
              <tr key={keyExtractor(row)} className="hover:bg-slate-50/70 transition-colors">
                {columns.map((col, idx) => (
                  <td key={idx} className={`px-6 py-4 whitespace-nowrap ${col.className || ''}`}>
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
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-200 bg-slate-50/50 text-xs text-slate-500">
          <div>
            Page <span className="font-semibold text-slate-700">{pagination.page}</span> of{' '}
            <span className="font-semibold text-slate-700">{pagination.totalPages}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Previous
            </button>
            <button
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
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
