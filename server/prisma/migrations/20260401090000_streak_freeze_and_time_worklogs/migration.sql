-- AlterTable
ALTER TABLE "User"
ADD COLUMN "streakFreezeDays" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "streakAwardedWeeks" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "DailyTimeLog"
ADD COLUMN "dsaWorkLog" TEXT,
ADD COLUMN "devAiWorkLog" TEXT;
