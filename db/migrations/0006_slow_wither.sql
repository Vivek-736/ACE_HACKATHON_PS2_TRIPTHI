CREATE TABLE "rescue_credit_ledger" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"volunteer_id" uuid NOT NULL,
	"order_id" uuid,
	"amount" integer NOT NULL,
	"type" text NOT NULL,
	"description" text NOT NULL,
	"balance_after" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"organisation_name" text,
	"amount" integer NOT NULL,
	"currency" text DEFAULT 'INR' NOT NULL,
	"purpose" text NOT NULL,
	"plan_name" text NOT NULL,
	"status" text DEFAULT 'created' NOT NULL,
	"is_simulated" boolean DEFAULT true NOT NULL,
	"razorpay_order_id" text,
	"razorpay_payment_id" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "verification_status" text DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "rescue_credit_ledger" ADD CONSTRAINT "rescue_credit_ledger_volunteer_id_users_id_fk" FOREIGN KEY ("volunteer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rescue_credit_ledger" ADD CONSTRAINT "rescue_credit_ledger_order_id_rescue_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."rescue_orders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_records" ADD CONSTRAINT "payment_records_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "credit_ledger_volunteer_id_idx" ON "rescue_credit_ledger" USING btree ("volunteer_id");--> statement-breakpoint
CREATE INDEX "credit_ledger_order_id_idx" ON "rescue_credit_ledger" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "credit_ledger_created_at_idx" ON "rescue_credit_ledger" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "payment_records_user_id_idx" ON "payment_records" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "payment_records_status_idx" ON "payment_records" USING btree ("status");--> statement-breakpoint
CREATE INDEX "payment_records_created_at_idx" ON "payment_records" USING btree ("created_at");