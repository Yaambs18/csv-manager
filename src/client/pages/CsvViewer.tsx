import { useParams } from 'react-router-dom';
import { useQuery } from 'wasp/client/operations';
import { useAction } from 'wasp/client/operations';
import { CsvDataViewer } from '../components/csv/CsvDataViewer';
import { getCsvFile } from 'wasp/client/operations';
import { updateCsvRow } from 'wasp/client/operations';

export function CsvViewer() {
  const { fileId } = useParams<{ fileId: string }>();
  const { data: file, isLoading, error } = useQuery(getCsvFile, { fileId: fileId! });
  const updateRowFn = useAction(updateCsvRow);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!file) return <div>File not found</div>;

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold'>{file.originalName}</h1>
        <p className='text-gray-600'>
          {file.rowCount} rows • Uploaded on {new Date(file.uploadedAt).toLocaleDateString()}
        </p>
      </div>

      <CsvDataViewer
        file={file}
        rows={file.rows}
        onRowUpdate={async (rowId, newData) => {
          await updateRowFn({ rowId, newData });
        }}
      />
    </div>
  );
} 