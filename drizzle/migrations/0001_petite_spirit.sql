ALTER TABLE "contacts" ADD COLUMN "verify_attempts" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "last_resend_at" timestamp;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "resend_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "password_resets" ADD COLUMN "contact" varchar(100);--> statement-breakpoint
ALTER TABLE "password_resets" ADD COLUMN "otp_code" varchar(20);--> statement-breakpoint
ALTER TABLE "password_resets" ADD COLUMN "used" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "password_resets" ADD COLUMN "used_at" timestamp;--> statement-breakpoint
ALTER TABLE "password_resets" ADD COLUMN "invalidated_at" timestamp;--> statement-breakpoint
CREATE INDEX "idx_password_resets_contact" ON "password_resets" USING btree ("contact");