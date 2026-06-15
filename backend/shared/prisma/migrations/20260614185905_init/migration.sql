-- CreateEnum
CREATE TYPE "Role" AS ENUM ('MSME', 'INVESTOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "UMKMStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "POSProvider" AS ENUM ('MOKA', 'PAWOON', 'MAJOO', 'GOBIZ', 'CUSTOM');

-- CreateEnum
CREATE TYPE "TxnType" AS ENUM ('INCOME', 'EXPENSE');

-- CreateEnum
CREATE TYPE "TxnSource" AS ENUM ('POS', 'EXCEL_UPLOAD', 'MANUAL');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('BUSINESS_PROFILE', 'FINANCIAL_STATEMENT', 'PITCH_SUMMARY');

-- CreateEnum
CREATE TYPE "InterestStatus" AS ENUM ('INTERESTED', 'CONTACTED', 'MEETING', 'DEAL', 'PASSED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'MSME',
    "fullName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UMKM" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ownerName" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'Food and Beverages',
    "description" TEXT,
    "yearEstablished" INTEGER,
    "city" TEXT,
    "address" TEXT,
    "contactPerson" TEXT,
    "logoUrl" TEXT,
    "status" "UMKMStatus" NOT NULL DEFAULT 'DRAFT',
    "adminApproved" BOOLEAN NOT NULL DEFAULT false,
    "prospectScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UMKM_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "POSIntegration" (
    "id" TEXT NOT NULL,
    "umkmId" TEXT NOT NULL,
    "provider" "POSProvider" NOT NULL DEFAULT 'CUSTOM',
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "lastSyncAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "POSIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "umkmId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "type" "TxnType" NOT NULL,
    "category" TEXT,
    "source" "TxnSource" NOT NULL DEFAULT 'MANUAL',
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinanceReport" (
    "id" TEXT NOT NULL,
    "umkmId" TEXT NOT NULL,
    "periodMonth" INTEGER NOT NULL,
    "periodYear" INTEGER NOT NULL,
    "totalRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalExpense" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "grossProfit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "netIncome" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sourceFiles" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinanceReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "umkmId" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "title" TEXT NOT NULL,
    "generatedContent" JSONB,
    "status" TEXT NOT NULL DEFAULT 'READY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvestorInterest" (
    "id" TEXT NOT NULL,
    "investorId" TEXT NOT NULL,
    "umkmId" TEXT NOT NULL,
    "status" "InterestStatus" NOT NULL DEFAULT 'INTERESTED',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvestorInterest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UMKM_ownerId_key" ON "UMKM"("ownerId");

-- CreateIndex
CREATE INDEX "UMKM_status_adminApproved_idx" ON "UMKM"("status", "adminApproved");

-- CreateIndex
CREATE INDEX "UMKM_category_idx" ON "UMKM"("category");

-- CreateIndex
CREATE UNIQUE INDEX "POSIntegration_umkmId_provider_key" ON "POSIntegration"("umkmId", "provider");

-- CreateIndex
CREATE INDEX "Transaction_umkmId_date_idx" ON "Transaction"("umkmId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "FinanceReport_umkmId_periodYear_periodMonth_key" ON "FinanceReport"("umkmId", "periodYear", "periodMonth");

-- CreateIndex
CREATE UNIQUE INDEX "InvestorInterest_investorId_umkmId_key" ON "InvestorInterest"("investorId", "umkmId");

-- AddForeignKey
ALTER TABLE "UMKM" ADD CONSTRAINT "UMKM_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "POSIntegration" ADD CONSTRAINT "POSIntegration_umkmId_fkey" FOREIGN KEY ("umkmId") REFERENCES "UMKM"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_umkmId_fkey" FOREIGN KEY ("umkmId") REFERENCES "UMKM"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceReport" ADD CONSTRAINT "FinanceReport_umkmId_fkey" FOREIGN KEY ("umkmId") REFERENCES "UMKM"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_umkmId_fkey" FOREIGN KEY ("umkmId") REFERENCES "UMKM"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvestorInterest" ADD CONSTRAINT "InvestorInterest_investorId_fkey" FOREIGN KEY ("investorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvestorInterest" ADD CONSTRAINT "InvestorInterest_umkmId_fkey" FOREIGN KEY ("umkmId") REFERENCES "UMKM"("id") ON DELETE CASCADE ON UPDATE CASCADE;
