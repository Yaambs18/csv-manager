import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import type { CsvFile } from 'wasp/entities';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';
import toast from 'react-hot-toast';

type CsvFileListProps = {
  files: CsvFile[];
  onDelete?: (fileId: string) => Promise<void>;
};

export function CsvFileList({ files, onDelete }: CsvFileListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<CsvFile | null>(null);

  const handleDeleteClick = (file: CsvFile) => {
    setFileToDelete(file);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (fileToDelete && onDelete) {
      try {
        await onDelete(fileToDelete.id);
        toast.success('File deleted successfully');
      } catch (error) {
        toast.error('Failed to delete file');
        console.error('Error deleting file:', error);
      }
    }
    setDeleteDialogOpen(false);
    setFileToDelete(null);
  };

  if (files.length === 0) {
    return (
      <div className='text-center py-12'>
        <div className='mx-auto w-24 h-24 text-gray-400'>
          <svg
            className='w-full h-full'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
            />
          </svg>
        </div>
        <h3 className='mt-2 text-sm font-medium text-gray-900'>No files uploaded</h3>
        <p className='mt-1 text-sm text-gray-500'>Get started by uploading a new CSV file.</p>
      </div>
    );
  }

  return (
    <>
      <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                File Name
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Upload Date
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Row Count
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Columns
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {files.map((file) => (
              <tr key={file.id} className='hover:bg-gray-50'>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='text-sm font-medium text-gray-900'>{file.originalName}</div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='text-sm text-gray-500'>
                    {format(new Date(file.uploadedAt), 'MMM d, yyyy HH:mm')}
                  </div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='text-sm text-gray-500'>{file.rowCount}</div>
                </td>
                <td className='px-6 py-4'>
                  <div className='text-sm text-gray-500'>
                    {(file.columnHeaders as string[]).join(', ')}
                  </div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                  <div className='flex space-x-3'>
                    <Link
                      to={`/csv/${file.id}`}
                      className='text-indigo-600 hover:text-indigo-900'
                    >
                      View Data
                    </Link>
                    {onDelete && (
                      <button
                        onClick={() => handleDeleteClick(file)}
                        className='text-red-600 hover:text-red-900'
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title='Delete CSV File'
        message={`Are you sure you want to delete "${fileToDelete?.originalName}"? This action cannot be undone.`}
      />
    </>
  );
} 