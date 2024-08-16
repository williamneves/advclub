DO $$ BEGIN
 CREATE TYPE "public"."sex" AS ENUM('male', 'female', '');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "advclub_families" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"inactive" boolean DEFAULT false,
	"user_id" text NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	"family_avatar" text DEFAULT '',
	"phone_number" text DEFAULT '' NOT NULL,
	"email" text DEFAULT '' NOT NULL,
	"street_address" text DEFAULT '',
	"city" text DEFAULT '',
	"state" text DEFAULT '',
	"zip_code" text DEFAULT '',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
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
	"height" text DEFAULT '',
	"weight" text DEFAULT '',
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
	"avatar" text DEFAULT '',
	"driver_license" text DEFAULT '',
	"phone" text DEFAULT '',
	"email" text DEFAULT '',
	"use_family_address" boolean DEFAULT true,
	"street_address" text DEFAULT '',
	"city" text DEFAULT '',
	"state" text DEFAULT '',
	"zip_code" text DEFAULT '',
	"allow_to_pick_up" boolean DEFAULT false,
	"allow_to_assign_signatures" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "advclub_kids" ADD CONSTRAINT "advclub_kids_family_id_advclub_families_id_fk" FOREIGN KEY ("family_id") REFERENCES "public"."advclub_families"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "advclub_parents" ADD CONSTRAINT "advclub_parents_family_id_advclub_families_id_fk" FOREIGN KEY ("family_id") REFERENCES "public"."advclub_families"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
