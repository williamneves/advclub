ALTER TABLE "advclub_families" ALTER COLUMN "phone_number" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "advclub_families" ADD COLUMN "email" text DEFAULT '' NOT NULL;