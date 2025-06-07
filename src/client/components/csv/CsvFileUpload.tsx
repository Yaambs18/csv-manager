/**
 * CsvFileUpload Component
 * 
 * A component that provides a drag-and-drop interface for uploading CSV files.
 * Features:
 * - Drag and drop file upload
 * - File browser selection
 * - File type validation (.csv only)
 * - Error handling and user feedback
 * - Authentication state handling
 * 
 * The component uses Wasp's uploadCsvFile operation to handle file uploads
 * and displays toast notifications for operation feedback.
 */

import { useState, useCallback } from 'react';
import { useAction } from 'wasp/client/operations';
import { uploadCsvFile } from 'wasp/client/operations';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export function CsvFileUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const uploadCsvFileFn = useAction(uploadCsvFile);

  /**
   * Handles the processing and uploading of a CSV file
   * @param file - The File object to be uploaded
   */
  const handleFile = useCallback(async (file: File) => {
    if (!file.type.includes('csv') && !file.name.endsWith('.csv')) {
      setUploadError('Please upload a CSV file');
      toast.error('Please upload a CSV file');
      return;
    }

    try {
      const fileContent = await file.text();
      await uploadCsvFileFn({ fileName: file.name, fileContent });
      toast.success('File uploaded successfully');
      setUploadError(null);
    } catch (error) {
      if (error instanceof Error && error.message === 'Not authorized') {
        setUploadError('Please log in to upload files');
        toast.error('Please log in to upload files');
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Failed to upload file';
        setUploadError(errorMessage);
        toast.error(errorMessage);
      }
    }
  }, [uploadCsvFileFn]);

  /**
   * Handles the drop event for drag-and-drop file upload
   * @param e - The drag event object
   */
  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setUploadError(null);

    const files = Array.from(e.dataTransfer.files);
    const csvFile = files.find(file => file.type === 'text/csv' || file.name.endsWith('.csv'));

    if (!csvFile) {
      setUploadError('Please upload a CSV file');
      toast.error('Please upload a CSV file');
      return;
    }

    await handleFile(csvFile);
  }, [handleFile]);

  /**
   * Handles file selection through the file input
   * @param e - The change event from the file input
   */
  const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await handleFile(files[0]);
  }, [handleFile]);

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
        isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
      }`}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
      onDrop={handleDrop}
    >
      <div className='space-y-4'>
        <div className='text-gray-600'>
          <svg
            className='mx-auto h-12 w-12 text-gray-400'
            stroke='currentColor'
            fill='none'
            viewBox='0 0 48 48'
            aria-hidden='true'
          >
            <path
              d='M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02'
              strokeWidth={2}
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
          <p className='mt-2'>Drag and drop your CSV file here</p>
          <p className='text-sm text-gray-500'>or</p>
        </div>

        <label className='cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'>
          Browse Files
          <input
            type='file'
            className='hidden'
            accept='.csv'
            onChange={handleFileInput}
          />
        </label>

        {uploadError && (
          <div className='text-red-500 text-sm mt-2'>
            {uploadError === 'Please log in to upload files' ? (
              <p>
                Please <Link to='/login' className='underline'>log in</Link> to upload files
              </p>
            ) : (
              <p>{uploadError}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 