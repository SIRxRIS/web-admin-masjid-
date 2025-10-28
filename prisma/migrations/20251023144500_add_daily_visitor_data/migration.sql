-- CreateTable
CREATE TABLE "daily_visitor_data" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "visitors" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_visitor_data_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "daily_visitor_data_date_key" ON "daily_visitor_data"("date");

-- CreateIndex
CREATE INDEX "daily_visitor_data_date_idx" ON "daily_visitor_data"("date");
