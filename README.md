# CSV Management System Documentation

## Overview
The CSV Management System is a full-stack web application built with Wasp that allows users to upload, manage, and process CSV files. The system provides a modern, user-friendly interface with drag-and-drop functionality and real-time feedback.

## Tech Stack
- **Framework**: Wasp (v0.16.0)
- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Wasp's built-in state management
- **Authentication**: Wasp's built-in authentication system
- **Database**: Prisma ORM
- **CSV Processing**: csv-parse/sync
- **Notifications**: react-hot-toast

## Features
1. **File Upload**
   - Drag-and-drop interface
   - File browser selection
   - CSV file validation
   - Real-time upload feedback
   - Authentication protection

2. **File Management**
   - List all uploaded CSV files
   - View file details
   - Delete files
   - Secure file access (user-specific)

3. **Data Processing**
   - Automatic CSV parsing
   - Column header detection
   - Row data storage
   - Data validation

## Project Structure
```
src/
├── client/
│   ├── pages/
│   │   └── CsvManager.tsx        # Main CSV management page
│   └── components/
│       └── csv/
│           ├── CsvFileUpload.tsx # File upload component
│           └── CsvFileList.tsx   # File listing component
├── server/
│   └── csv/
│       └── operations.ts         # Server-side CSV operations
└── schema.prisma                 # Database schema
```

## Database Schema
```prisma
model CsvFile {
  id            String    @id @default(autoincrement())
  userId        Int
  fileName      String
  originalName  String
  columnHeaders String[]
  rowCount      Int
  uploadedAt    DateTime  @default(now())
  rows          CsvRow[]
  user          User      @relation(fields: [userId], references: [id])
}

model CsvRow {
  id         String   @id @default(autoincrement())
  csvFileId  String
  rowIndex   Int
  rowData    Json
  csvFile    CsvFile  @relation(fields: [csvFileId], references: [id])
}
```

## API Operations

### Client Operations
1. `getCsvFiles`: Fetch all CSV files for the authenticated user
2. `getCsvFile`: Fetch a specific CSV file with its rows
3. `uploadCsvFile`: Upload and process a new CSV file
4. `updateCsvRow`: Update data in a specific row
5. `deleteCsvFile`: Delete a CSV file and its associated rows

### Security
- All operations require authentication
- Users can only access their own files
- File operations are protected by user-specific authorization checks

## Installation and Setup

1. **Prerequisites**
   - Node.js (v16 or higher)
   - npm or yarn
   - Wasp CLI

2. **Installation**
   ```bash
   # Install Wasp CLI
   curl -sSL https://get.wasp-lang.dev/installer.sh | sh

   # Clone the repository
   git clone <repository-url>
   cd csv-management-system

   # Install dependencies
   npm install
   ```

3. **Configuration**
   - Set up your database connection in `schema.prisma`
   - Configure environment variables if needed

4. **Running the Application**
   ```bash
   # Start the development server
   wasp start
   ```

## Usage Guide

1. **Uploading Files**
   - Navigate to the CSV Manager page
   - Drag and drop a CSV file or click "Browse Files"
   - Wait for the upload confirmation

2. **Managing Files**
   - View all uploaded files in the list
   - Click delete to remove a file
   - View file details by clicking on a file

3. **Error Handling**
   - Invalid file types are rejected
   - Empty files are not accepted
   - Authentication errors are handled gracefully
   - User-friendly error messages are displayed

## Best Practices

1. **File Upload**
   - Validate file type before upload
   - Check file size limits
   - Handle upload errors gracefully
   - Provide clear user feedback

2. **Data Processing**
   - Validate CSV structure
   - Handle empty files
   - Process large files efficiently
   - Maintain data integrity

3. **Security**
   - Implement proper authentication
   - Validate user permissions
   - Sanitize file names
   - Protect against malicious files

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
[Specify your license here]

## Support
For support, please [specify contact information or support channels]

