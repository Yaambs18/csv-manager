-- CreateTable
CREATE TABLE "CsvFile" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "columnHeaders" JSONB NOT NULL,
    "rowCount" INTEGER NOT NULL,

    CONSTRAINT "CsvFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CsvRow" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "csvFileId" TEXT NOT NULL,
    "rowData" JSONB NOT NULL,
    "rowIndex" INTEGER NOT NULL,

    CONSTRAINT "CsvRow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CsvRow_csvFileId_idx" ON "CsvRow"("csvFileId");

-- AddForeignKey
ALTER TABLE "CsvFile" ADD CONSTRAINT "CsvFile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CsvRow" ADD CONSTRAINT "CsvRow_csvFileId_fkey" FOREIGN KEY ("csvFileId") REFERENCES "CsvFile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
