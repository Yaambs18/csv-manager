/**
 * CSV File Operations
 * 
 * This module contains server-side operations for managing CSV files and their data.
 * All operations require user authentication and perform appropriate authorization checks.
 */

import { CsvFile, CsvRow } from 'wasp/entities';
import { GetCsvFiles, UploadCsvFile, UpdateCsvRow, GetCsvFile, DeleteCsvFile } from 'wasp/server/operations';
import { parse } from 'csv-parse/sync';

/**
 * Retrieves all CSV files for the authenticated user
 * @returns Array of CSV files sorted by upload date (newest first)
 * @throws Error if user is not authenticated
 */
export const getCsvFiles: GetCsvFiles<void, CsvFile[]> = async (args, context) => {
  if (!context.user) {
    throw new Error('Not authorized');
  }

  return context.entities.CsvFile.findMany({
    where: { userId: context.user.id },
    orderBy: { uploadedAt: 'desc' }
  });
};

/**
 * Retrieves a specific CSV file and its rows
 * @param fileId - The ID of the file to retrieve
 * @returns The CSV file with its associated rows
 * @throws Error if file not found or user not authorized
 */
export const getCsvFile: GetCsvFile<{ fileId: string }, CsvFile> = async ({ fileId }, context) => {
  if (!context.user) {
    throw new Error('Not authorized');
  }

  const file = await context.entities.CsvFile.findUnique({
    where: { id: fileId },
    include: { rows: true }
  });

  if (!file) {
    throw new Error('File not found');
  }

  if (file.userId !== context.user.id) {
    throw new Error('Not authorized to access this file');
  }

  return file;
};

/**
 * Uploads and processes a new CSV file
 * @param fileName - The name of the file
 * @param fileContent - The content of the CSV file as a string
 * @returns The created CSV file record
 * @throws Error if file is invalid, empty, or user not authorized
 */
export const uploadCsvFile: UploadCsvFile<{ fileName: string, fileContent: string }, CsvFile> = async ({ fileName, fileContent }, context) => {
  if (!context.user) {
    throw new Error('Not authorized');
  }
  
  try {
    // Parse CSV content
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    });

    if (records.length === 0) {
      throw new Error('CSV file is empty');
    }

    // Get column headers from the first record
    const columnHeaders = Object.keys(records[0] || {});

    if (columnHeaders.length === 0) {
      throw new Error('CSV file has no columns');
    }

    // Create the CSV file record
    const csvFile = await context.entities.CsvFile.create({
      data: {
        userId: context.user.id,
        fileName: fileName,
        originalName: fileName,
        columnHeaders: columnHeaders,
        rowCount: records.length,
        rows: {
          create: records.map((record: any, index: number) => ({
            rowData: record,
            rowIndex: index
          }))
        }
      }
    });

    return csvFile;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error('Invalid CSV file format');
  }
};

/**
 * Updates a specific row in a CSV file
 * @param rowId - The ID of the row to update
 * @param newData - The new data for the row
 * @returns The updated row
 * @throws Error if row not found or user not authorized
 */
export const updateCsvRow: UpdateCsvRow<{ rowId: string, newData: Record<string, string> }, CsvRow> = async ({ rowId, newData }, context) => {
  if (!context.user) {
    throw new Error('Not authorized');
  }

  const row = await context.entities.CsvRow.findUnique({
    where: { id: rowId },
    include: { csvFile: true }
  });

  if (!row) {
    throw new Error('Row not found');
  }

  if (row.csvFile.userId !== context.user.id) {
    throw new Error('Not authorized to modify this row');
  }

  return context.entities.CsvRow.update({
    where: { id: rowId },
    data: { rowData: newData }
  });
};

/**
 * Deletes a CSV file and all its associated rows
 * @param fileId - The ID of the file to delete
 * @returns The deleted file
 * @throws Error if file not found or user not authorized
 */
export const deleteCsvFile: DeleteCsvFile<{ fileId: string }, CsvFile> = async ({ fileId }, context) => {
  if (!context.user) {
    throw new Error('Not authorized');
  }

  const file = await context.entities.CsvFile.findUnique({
    where: { id: fileId },
    include: { rows: true }
  });

  if (!file) {
    throw new Error('File not found');
  }

  if (file.userId !== context.user.id) {
    throw new Error('Not authorized to delete this file');
  }

  // Delete all associated rows first
  await context.entities.CsvRow.deleteMany({
    where: { csvFileId: fileId }
  });

  // Then delete the file
  return context.entities.CsvFile.delete({
    where: { id: fileId }
  });
}; 