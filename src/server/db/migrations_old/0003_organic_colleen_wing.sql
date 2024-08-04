ALTER TABLE "advclub_forms" ADD COLUMN "kid_id" serial NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "advclub_forms" ADD CONSTRAINT "advclub_forms_kid_id_advclub_kids_id_fk" FOREIGN KEY ("kid_id") REFERENCES "public"."advclub_kids"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
