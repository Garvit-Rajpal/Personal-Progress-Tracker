-- CreateTable
CREATE TABLE "LearningTarget" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dailyDsaTarget" TEXT NOT NULL,
    "dailyWebDevAiTarget" TEXT NOT NULL,
    "weekendProjectBuildTarget" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningTarget_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LearningTarget_userId_key" ON "LearningTarget"("userId");

-- AddForeignKey
ALTER TABLE "LearningTarget" ADD CONSTRAINT "LearningTarget_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
