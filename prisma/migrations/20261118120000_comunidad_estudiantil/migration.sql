-- CreateEnum
CREATE TYPE "CommunityRole" AS ENUM ('MEMBER', 'ADMIN');

-- CreateEnum
CREATE TYPE "CommunityKind" AS ENUM ('PLAN', 'STUDY', 'BENEFIT', 'GROUP', 'EXCHANGE');

-- CreateEnum
CREATE TYPE "CommunityStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CLOSED');

-- CreateTable
CREATE TABLE "CommunityUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "province" TEXT,
    "role" "CommunityRole" NOT NULL DEFAULT 'MEMBER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunityUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunitySession" (
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunitySession_pkey" PRIMARY KEY ("tokenHash")
);

-- CreateTable
CREATE TABLE "CommunityPost" (
    "id" TEXT NOT NULL,
    "kind" "CommunityKind" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "searchText" TEXT NOT NULL DEFAULT '',
    "university" TEXT,
    "career" TEXT,
    "subject" TEXT,
    "province" TEXT,
    "cost" INTEGER,
    "eventAt" TIMESTAMP(3),
    "submissionKey" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "contact" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "status" "CommunityStatus" NOT NULL DEFAULT 'PENDING',
    "reviewNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "imageId" TEXT,

    CONSTRAINT "CommunityPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityParticipation" (
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunityParticipation_pkey" PRIMARY KEY ("postId","userId")
);

-- CreateTable
CREATE TABLE "CommunityReport" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunityReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityReview" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "decision" "CommunityStatus" NOT NULL,
    "note" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunityReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityAsset" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunityAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityRateLimit" (
    "key" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 1,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunityRateLimit_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "CommunityUser_email_key" ON "CommunityUser"("email");

-- CreateIndex
CREATE INDEX "CommunitySession_userId_idx" ON "CommunitySession"("userId");

-- CreateIndex
CREATE INDEX "CommunitySession_expiresAt_idx" ON "CommunitySession"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "CommunityPost_submissionKey_key" ON "CommunityPost"("submissionKey");

-- CreateIndex
CREATE UNIQUE INDEX "CommunityPost_imageId_key" ON "CommunityPost"("imageId");

-- CreateIndex
CREATE INDEX "CommunityPost_kind_status_expiresAt_idx" ON "CommunityPost"("kind", "status", "expiresAt");

-- CreateIndex
CREATE INDEX "CommunityPost_authorId_createdAt_idx" ON "CommunityPost"("authorId", "createdAt");

-- CreateIndex
CREATE INDEX "CommunityParticipation_userId_idx" ON "CommunityParticipation"("userId");

-- CreateIndex
CREATE INDEX "CommunityReport_resolvedAt_idx" ON "CommunityReport"("resolvedAt");

-- CreateIndex
CREATE UNIQUE INDEX "CommunityReport_postId_userId_key" ON "CommunityReport"("postId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "CommunityAsset_publicId_key" ON "CommunityAsset"("publicId");

-- CreateIndex
CREATE INDEX "CommunityRateLimit_expiresAt_idx" ON "CommunityRateLimit"("expiresAt");

-- AddForeignKey
ALTER TABLE "CommunitySession" ADD CONSTRAINT "CommunitySession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "CommunityUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityPost" ADD CONSTRAINT "CommunityPost_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "CommunityAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityPost" ADD CONSTRAINT "CommunityPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "CommunityUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityParticipation" ADD CONSTRAINT "CommunityParticipation_postId_fkey" FOREIGN KEY ("postId") REFERENCES "CommunityPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityParticipation" ADD CONSTRAINT "CommunityParticipation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "CommunityUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityReport" ADD CONSTRAINT "CommunityReport_postId_fkey" FOREIGN KEY ("postId") REFERENCES "CommunityPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityReport" ADD CONSTRAINT "CommunityReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "CommunityUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityReview" ADD CONSTRAINT "CommunityReview_postId_fkey" FOREIGN KEY ("postId") REFERENCES "CommunityPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityReview" ADD CONSTRAINT "CommunityReview_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "CommunityUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityAsset" ADD CONSTRAINT "CommunityAsset_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "CommunityUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

