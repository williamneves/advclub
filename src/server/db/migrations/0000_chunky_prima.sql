DO $$ BEGIN
 CREATE TYPE "public"."sex" AS ENUM('male', 'female', '');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "advclub_families" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	"phone_number" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "advclub_forms" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text DEFAULT '' NOT NULL,
	"family_id" serial NOT NULL,
	"slug" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'DRAFT',
	"fields" jsonb DEFAULT '{}' NOT NULL,
	"submitted_at" timestamp with time zone,
	"closed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "advclub_forms_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "advclub_kids" (
	"id" serial PRIMARY KEY NOT NULL,
	"family_id" serial NOT NULL,
	"inactive" boolean DEFAULT false,
	"first_name" text DEFAULT '' NOT NULL,
	"last_name" text DEFAULT '' NOT NULL,
	"alias" text DEFAULT '',
	"phone_number" text DEFAULT '' NOT NULL,
	"sex" "sex",
	"avatar" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "advclub_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"auth_id" text NOT NULL,
	"inactive" boolean DEFAULT false,
	"type" text NOT NULL,
	"first_name" text DEFAULT '',
	"last_name" text DEFAULT '',
	"sex" "sex" DEFAULT '',
	"avatar" text,
	"phone" text DEFAULT '',
	"email" text DEFAULT '',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "advclub_parents" (
	"id" serial PRIMARY KEY NOT NULL,
	"inactive" boolean DEFAULT false,
	"main" boolean DEFAULT false,
	"family_id" serial NOT NULL,
	"type" text NOT NULL,
	"first_name" text DEFAULT '',
	"last_name" text DEFAULT '',
	"sex" "sex" DEFAULT '',
	"avatar" text,
	"phone" text DEFAULT '',
	"email" text DEFAULT '',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "advclub_forms" ADD CONSTRAINT "advclub_forms_family_id_advclub_families_id_fk" FOREIGN KEY ("family_id") REFERENCES "public"."advclub_families"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "advclub_kids" ADD CONSTRAINT "advclub_kids_family_id_advclub_families_id_fk" FOREIGN KEY ("family_id") REFERENCES "public"."advclub_families"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "advclub_parents" ADD CONSTRAINT "advclub_parents_family_id_advclub_families_id_fk" FOREIGN KEY ("family_id") REFERENCES "public"."advclub_families"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
