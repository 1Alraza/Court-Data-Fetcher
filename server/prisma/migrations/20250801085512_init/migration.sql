-- CreateTable
CREATE TABLE "public"."CourtQuery" (
    "id" SERIAL NOT NULL,
    "caseType" TEXT NOT NULL,
    "caseNumber" TEXT NOT NULL,
    "filingYear" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rawHtml" TEXT NOT NULL,
    "metadataId" INTEGER,

    CONSTRAINT "CourtQuery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ParsedCaseMetadata" (
    "id" SERIAL NOT NULL,
    "petitioner" TEXT NOT NULL,
    "respondent" TEXT NOT NULL,
    "filingDate" TEXT NOT NULL,
    "nextHearing" TEXT NOT NULL,
    "courtName" TEXT NOT NULL,
    "judgeName" TEXT,

    CONSTRAINT "ParsedCaseMetadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OrderDocument" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "queryId" INTEGER NOT NULL,

    CONSTRAINT "OrderDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CourtQuery_metadataId_key" ON "public"."CourtQuery"("metadataId");

-- AddForeignKey
ALTER TABLE "public"."CourtQuery" ADD CONSTRAINT "CourtQuery_metadataId_fkey" FOREIGN KEY ("metadataId") REFERENCES "public"."ParsedCaseMetadata"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderDocument" ADD CONSTRAINT "OrderDocument_queryId_fkey" FOREIGN KEY ("queryId") REFERENCES "public"."CourtQuery"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
