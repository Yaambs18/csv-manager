import { useState, useMemo } from 'react';
import type { CsvFile, CsvRow } from 'wasp/entities';

type CsvDataViewerProps = {
  file: CsvFile;
  rows: CsvRow[];
  onRowUpdate: (rowId: string, newData: Record<string, string>) => Promise<void>;
};

export function CsvDataViewer({ file, rows, onRowUpdate }: CsvDataViewerProps) {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(file.columnHeaders as string[]);
  const [columnOrder, setColumnOrder] = useState<string[]>(file.columnHeaders as string[]);
  const [filterText, setFilterText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingCell, setEditingCell] = useState<{ rowId: string; column: string } | null>(null);
  const [editValue, setEditValue] = useState('');

  const rowsPerPage = 10;

  // Filter rows based on search text
  const filteredRows = useMemo(() => {
    return rows.filter(row => {
      const rowData = row.rowData as Record<string, string>;
      return Object.values(rowData).some(value => 
        value.toLowerCase().includes(filterText.toLowerCase())
      );
    });
  }, [rows, filterText]);

  // Sort rows
  const sortedRows = useMemo(() => {
    if (!sortConfig) return filteredRows;

    return [...filteredRows].sort((a, b) => {
      const aValue = (a.rowData as Record<string, string>)[sortConfig.key] || '';
      const bValue = (b.rowData as Record<string, string>)[sortConfig.key] || '';

      if (sortConfig.direction === 'asc') {
        return aValue.localeCompare(bValue);
      }
      return bValue.localeCompare(aValue);
    });
  }, [filteredRows, sortConfig]);

  // Paginate rows
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return sortedRows.slice(start, start + rowsPerPage);
  }, [sortedRows, currentPage]);

  const totalPages = Math.ceil(sortedRows.length / rowsPerPage);

  const handleSort = (column: string) => {
    setSortConfig(current => ({
      key: column,
      direction: current?.key === column && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleColumnToggle = (column: string) => {
    setVisibleColumns(current => 
      current.includes(column)
        ? current.filter(c => c !== column)
        : [...current, column]
    );
  };

  const handleColumnReorder = (dragIndex: number, dropIndex: number) => {
    const newOrder = [...columnOrder];
    const [removed] = newOrder.splice(dragIndex, 1);
    newOrder.splice(dropIndex, 0, removed);
    setColumnOrder(newOrder);
  };

  const handleCellEdit = (rowId: string, column: string, value: string) => {
    setEditingCell({ rowId, column });
    setEditValue(value);
  };

  const handleCellSave = async () => {
    if (!editingCell) return;
    
    const row = rows.find(r => r.id === editingCell.rowId);
    if (!row) return;

    const newData = { ...(row.rowData as Record<string, string>) };
    newData[editingCell.column] = editValue;

    await onRowUpdate(editingCell.rowId, newData);
    setEditingCell(null);
  };

  return (
    <div className='space-y-4'>
      {/* Controls */}
      <div className='flex flex-wrap gap-4 items-center'>
        <input
          type='text'
          placeholder='Filter rows...'
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className='px-3 py-2 border rounded-md'
        />
        
        <div className='flex items-center gap-2'>
          <span className='text-sm font-medium'>Columns:</span>
          <div className='flex flex-wrap gap-2'>
            {columnOrder.map((column, index) => (
              <label key={column} className='flex items-center gap-1'>
                <input
                  type='checkbox'
                  checked={visibleColumns.includes(column)}
                  onChange={() => handleColumnToggle(column)}
                  className='rounded'
                />
                <span className='text-sm'>{column}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-4 py-2'>
                <input
                  type='checkbox'
                  checked={selectedRows.size === paginatedRows.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedRows(new Set(paginatedRows.map(row => row.id)));
                    } else {
                      setSelectedRows(new Set());
                    }
                  }}
                  className='rounded'
                />
              </th>
              {columnOrder
                .filter(column => visibleColumns.includes(column))
                .map(column => (
                  <th
                    key={column}
                    className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100'
                    onClick={() => handleSort(column)}
                  >
                    <div className='flex items-center gap-1'>
                      {column}
                      {sortConfig?.key === column && (
                        <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                ))}
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {paginatedRows.map(row => (
              <tr key={row.id} className='hover:bg-gray-50'>
                <td className='px-4 py-2'>
                  <input
                    type='checkbox'
                    checked={selectedRows.has(row.id)}
                    onChange={(e) => {
                      const newSelected = new Set(selectedRows);
                      if (e.target.checked) {
                        newSelected.add(row.id);
                      } else {
                        newSelected.delete(row.id);
                      }
                      setSelectedRows(newSelected);
                    }}
                    className='rounded'
                  />
                </td>
                {columnOrder
                  .filter(column => visibleColumns.includes(column))
                  .map(column => {
                    const value = (row.rowData as Record<string, string>)[column] || '';
                    const isEditing = editingCell?.rowId === row.id && editingCell?.column === column;

                    return (
                      <td
                        key={column}
                        className='px-4 py-2 text-sm text-gray-900'
                        onClick={() => handleCellEdit(row.id, column, value)}
                      >
                        {isEditing ? (
                          <input
                            type='text'
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={handleCellSave}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleCellSave();
                              }
                            }}
                            className='w-full px-2 py-1 border rounded'
                            autoFocus
                          />
                        ) : (
                          value
                        )}
                      </td>
                    );
                  })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className='flex items-center justify-between'>
        <div className='text-sm text-gray-700'>
          Showing {((currentPage - 1) * rowsPerPage) + 1} to {Math.min(currentPage * rowsPerPage, sortedRows.length)} of {sortedRows.length} rows
        </div>
        <div className='flex gap-2'>
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className='px-3 py-1 border rounded disabled:opacity-50'
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className='px-3 py-1 border rounded disabled:opacity-50'
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
} 