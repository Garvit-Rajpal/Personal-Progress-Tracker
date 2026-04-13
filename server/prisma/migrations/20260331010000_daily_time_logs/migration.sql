-- CreateTable
CREATE TABLE "DailyTimeLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "dsaHours" DOUBLE PRECISION NOT NULL,
    "devAiHours" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyTimeLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyTimeLog_userId_date_key" ON "DailyTimeLog"("userId", "date");

-- AddForeignKey
ALTER TABLE "DailyTimeLog" ADD CONSTRAINT "DailyTimeLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
