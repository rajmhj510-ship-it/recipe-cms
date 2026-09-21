-- Repair migration: recreate the subscriber table if the database is missing it.
-- Safe when the table already exists, including databases where the previous
-- migration was recorded as applied but the table was later removed.
CREATE TABLE IF NOT EXISTS "Subscriber" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Subscriber_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Subscriber_email_key" ON "Subscriber"("email");
