-- CreateTable
CREATE TABLE "auth_rate_limits" (
    "id" TEXT NOT NULL,
    "subject_hash" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "window_started_at" TIMESTAMP(3) NOT NULL,
    "blocked_until" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auth_rate_limits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "auth_rate_limits_subject_hash_key" ON "auth_rate_limits"("subject_hash");

-- CreateIndex
CREATE INDEX "auth_rate_limits_blocked_until_idx" ON "auth_rate_limits"("blocked_until");

