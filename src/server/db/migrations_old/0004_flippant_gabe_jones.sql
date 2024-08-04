DROP TABLE "advclub_forms";--> statement-breakpoint
ALTER TABLE "advclub_families" ADD COLUMN "inactive" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "advclub_families" ADD COLUMN "family_avatar" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "advclub_families" ADD COLUMN "street_address" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "advclub_families" ADD COLUMN "city" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "advclub_families" ADD COLUMN "state" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "advclub_families" ADD COLUMN "zip_code" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "advclub_kids" ADD COLUMN "height" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "advclub_kids" ADD COLUMN "weight" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "advclub_parents" ADD COLUMN "street_address" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "advclub_parents" ADD COLUMN "street_address_2" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "advclub_parents" ADD COLUMN "city" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "advclub_parents" ADD COLUMN "state" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "advclub_parents" ADD COLUMN "zip_code" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "advclub_parents" ADD COLUMN "allow_to_pick_up" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "advclub_parents" ADD COLUMN "allow_to_assign_signatures" boolean DEFAULT false;