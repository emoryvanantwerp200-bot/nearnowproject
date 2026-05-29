CREATE TABLE "family_members" (
	"id" serial PRIMARY KEY,
	"user_id" text NOT NULL,
	"name" varchar(120) NOT NULL,
	"status" varchar(200) DEFAULT '' NOT NULL,
	"note" varchar(200) DEFAULT '' NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "neighbor_board_items" (
	"id" serial PRIMARY KEY,
	"author_id" text NOT NULL,
	"title" varchar(200) NOT NULL,
	"zone" varchar(120) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" serial PRIMARY KEY,
	"author_id" text NOT NULL,
	"author_name" varchar(120) NOT NULL,
	"type" varchar(20) DEFAULT 'social' NOT NULL,
	"text" text NOT NULL,
	"reactions" integer DEFAULT 0 NOT NULL,
	"replies" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now()
);
