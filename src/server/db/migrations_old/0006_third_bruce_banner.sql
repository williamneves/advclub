ALTER TABLE "advclub_parents" ADD COLUMN "use_family_address" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "advclub_parents" DROP COLUMN IF EXISTS "street_address_2";