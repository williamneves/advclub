ALTER TABLE "advclub_kids" DROP CONSTRAINT "advclub_kids_family_id_advclub_families_id_fk";
--> statement-breakpoint
ALTER TABLE "advclub_parents" DROP CONSTRAINT "advclub_parents_family_id_advclub_families_id_fk";
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
