-- CreateTable
CREATE TABLE "NextDayPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "briefPlan" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NextDayPlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NextDayPlan_userId_key" ON "NextDayPlan"("userId");

-- AddForeignKey
ALTER TABLE "NextDayPlan" ADD CONSTRAINT "NextDayPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
