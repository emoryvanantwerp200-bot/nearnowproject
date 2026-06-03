CREATE TABLE "feed_items" (
	"id" serial PRIMARY KEY,
	"category" varchar(20) DEFAULT 'community' NOT NULL,
	"title" varchar(200) NOT NULL,
	"body" text DEFAULT '' NOT NULL,
	"area" varchar(60) DEFAULT 'mobile' NOT NULL,
	"source" varchar(160) DEFAULT 'Community report' NOT NULL,
	"source_url" text,
	"trust" varchar(20) DEFAULT 'unverified' NOT NULL,
	"status" varchar(20) DEFAULT 'published' NOT NULL,
	"latitude" double precision,
	"longitude" double precision,
	"created_at" timestamp DEFAULT now()
);
