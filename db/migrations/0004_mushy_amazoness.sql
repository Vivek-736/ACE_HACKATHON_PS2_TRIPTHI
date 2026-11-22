ALTER TABLE "rescue_orders" ADD COLUMN "pickup_otp_consumed" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "rescue_orders" ADD COLUMN "delivery_otp_consumed" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "rescue_orders" ADD COLUMN "pickup_attempts" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "rescue_orders" ADD COLUMN "delivery_attempts" integer DEFAULT 0 NOT NULL;