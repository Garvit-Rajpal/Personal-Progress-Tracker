-- CreateEnum
CREATE TYPE "RoadmapLinkKind" AS ENUM ('DEFAULT', 'CUSTOM');

-- CreateTable
CREATE TABLE "UserRoadmapLink" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "notes" TEXT,
    "kind" "RoadmapLinkKind" NOT NULL DEFAULT 'CUSTOM',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserRoadmapLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserRoadmapLink_userId_idx" ON "UserRoadmapLink"("userId");

-- AddForeignKey
ALTER TABLE "UserRoadmapLink" ADD CONSTRAINT "UserRoadmapLink_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;