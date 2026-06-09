-- NearNow: verification, reputation, businesses, misinformation reports

ALTER TABLE "user_profiles"
  ADD COLUMN IF NOT EXISTS "verified" boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "verified_at" timestamp,
  ADD COLUMN IF NOT EXISTS "reputation_points" integer NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS "businesses" (
  "id" serial PRIMARY KEY NOT NULL,
  "owner_id" text NOT NULL,
  "name" varchar(200) NOT NULL,
  "category" varchar(100),
  "description" text,
  "verified" boolean NOT NULL DEFAULT false,
  "verified_at" timestamp,
  "created_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "reputation_events" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "delta" integer NOT NULL,
  "reason" varchar(100) NOT NULL,
  "created_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "misinformation_reports" (
  "id" serial PRIMARY KEY NOT NULL,
  "reporter_id" text NOT NULL,
  "target_type" varchar(30) NOT NULL,
  "target_id" text NOT NULL,
  "reason" text,
  "status" varchar(20) NOT NULL DEFAULT 'pending',
  "created_at" timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_misinfo_target"
  ON "misinformation_reports" ("target_type", "target_id");
CREATE INDEX IF NOT EXISTS "idx_businesses_owner"
  ON "businesses" ("owner_id");
