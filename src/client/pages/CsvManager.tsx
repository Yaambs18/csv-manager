/**
 * CsvManager Component
 * 
 * A page component that manages CSV file operations including uploading and listing CSV files.
 * It provides a user interface for:
 * - Uploading new CSV files through drag-and-drop or file selection
 * - Viewing a list of previously uploaded CSV files
 * - Deleting uploaded CSV files
 * 
 * The component uses Wasp operations for data fetching and mutations, and displays
 * toast notifications for operation feedback.
 */

import { useState } from 'react';
import { getCsvFiles, useQuery } from 'wasp/client/operations';
import { deleteCsvFile } from 'wasp/client/operations';
import { CsvFileUpload } from '../components/csv/CsvFileUpload';
import { CsvFileList } from '../components/csv/CsvFileList';
import toast from 'react-hot-toast';

export function CsvManager() {
  // Fetch CSV files using Wasp's useQuery hook
  const { data: csvFiles, isLoading, error } = useQuery(getCsvFiles);

  /**
   * Handles the deletion of a CSV file
   * @param fileId - The ID of the file to delete
   */
  const handleDeleteFile = async (fileId: string) => {
    try {
      await deleteCsvFile({ fileId });
      toast.success('File deleted successfully');
    } catch (error) {
      toast.error('Failed to delete file');
      console.error('Error deleting file:', error);
    }
  };

  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='text-3xl font-bold mb-8'>CSV Manager</h1>
      
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        {/* File Upload Section */}
        <div className='lg:col-span-1'>
          <div className='bg-white rounded-lg shadow-md p-6'>
            <h2 className='text-xl font-semibold mb-4'>Upload CSV</h2>
            <CsvFileUpload />
          </div>
        </div>

        {/* File List Section */}
        <div className='lg:col-span-2'>
          <div className='bg-white rounded-lg shadow-md p-6'>
            <h2 className='text-xl font-semibold mb-4'>Uploaded Files</h2>
            {isLoading && <p>Loading files...</p>}
            {error && <p className='text-red-500'>Error loading files: {error.message}</p>}
            {csvFiles && <CsvFileList files={csvFiles} onDelete={handleDeleteFile} />}
          </div>
        </div>
      </div>
    </div>
  );
} 