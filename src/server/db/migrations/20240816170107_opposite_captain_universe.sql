CREATE TABLE IF NOT EXISTS "advclub_forms" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"guardian_id" integer NOT NULL,
	"kid_id" integer NOT NULL,
	"reviewed_by_member_id" integer,
	"fields" jsonb DEFAULT '{}'::jsonb,
	"submitted_at" timestamp with time zone,
	"approved_at" timestamp with time zone,
	"rejected_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "advclub_forms" ADD CONSTRAINT "advclub_forms_guardian_id_advclub_parents_id_fk" FOREIGN KEY ("guardian_id") REFERENCES "public"."advclub_parents"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "advclub_forms" ADD CONSTRAINT "advclub_forms_kid_id_advclub_kids_id_fk" FOREIGN KEY ("kid_id") REFERENCES "public"."advclub_kids"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "advclub_forms" ADD CONSTRAINT "advclub_forms_reviewed_by_member_id_advclub_members_id_fk" FOREIGN KEY ("reviewed_by_member_id") REFERENCES "public"."advclub_members"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "forms_slug_uniq" ON "advclub_forms" USING btree ("slug");