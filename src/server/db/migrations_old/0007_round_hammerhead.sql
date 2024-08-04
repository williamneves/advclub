ALTER TABLE "advclub_parents" ALTER COLUMN "avatar" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "advclub_families" ADD COLUMN "uuid" uuid DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "advclub_parents" ADD COLUMN "driver_license" text DEFAULT '';