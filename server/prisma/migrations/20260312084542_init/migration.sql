-- CreateEnum
CREATE TYPE "PhaseType" AS ENUM ('FS', 'AI', 'BOTH');

-- CreateEnum
CREATE TYPE "BadgeType" AS ENUM ('CORE', 'AI', 'PROJECT', 'JOB');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "lastActive" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoadmapPhase" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "PhaseType" NOT NULL,
    "duration" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "resources" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoadmapPhase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoadmapItem" (
    "id" TEXT NOT NULL,
    "phaseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "badge" "BadgeType" NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "RoadmapItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "UserProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DSAQuestion" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "difficulty" "Difficulty" NOT NULL,
    "link" TEXT NOT NULL,

    CONSTRAINT "DSAQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyDSASet" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,

    CONSTRAINT "DailyDSASet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserDSAProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "solved" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "solvedAt" TIMESTAMP(3),

    CONSTRAINT "UserDSAProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DSAQuestionToDailyDSASet" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_DSAQuestionToDailyDSASet_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_refreshToken_key" ON "Session"("refreshToken");

-- CreateIndex
CREATE UNIQUE INDEX "UserProgress_userId_itemId_key" ON "UserProgress"("userId", "itemId");

-- CreateIndex
CREATE UNIQUE INDEX "DailyDSASet_date_key" ON "DailyDSASet"("date");

-- CreateIndex
CREATE UNIQUE INDEX "UserDSAProgress_userId_questionId_key" ON "UserDSAProgress"("userId", "questionId");

-- CreateIndex
CREATE INDEX "_DSAQuestionToDailyDSASet_B_index" ON "_DSAQuestionToDailyDSASet"("B");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoadmapItem" ADD CONSTRAINT "RoadmapItem_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "RoadmapPhase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProgress" ADD CONSTRAINT "UserProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProgress" ADD CONSTRAINT "UserProgress_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "RoadmapItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDSAProgress" ADD CONSTRAINT "UserDSAProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDSAProgress" ADD CONSTRAINT "UserDSAProgress_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "DSAQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DSAQuestionToDailyDSASet" ADD CONSTRAINT "_DSAQuestionToDailyDSASet_A_fkey" FOREIGN KEY ("A") REFERENCES "DSAQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DSAQuestionToDailyDSASet" ADD CONSTRAINT "_DSAQuestionToDailyDSASet_B_fkey" FOREIGN KEY ("B") REFERENCES "DailyDSASet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
