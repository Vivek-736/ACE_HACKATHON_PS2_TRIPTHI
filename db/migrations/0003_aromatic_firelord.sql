CREATE TABLE "delivery_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"event_type" text NOT NULL,
	"actor_id" uuid NOT NULL,
	"actor_role" text NOT NULL,
	"notes" text,
	"proof_photo_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rescue_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" uuid NOT NULL,
	"receiver_id" uuid NOT NULL,
	"volunteer_id" uuid,
	"allocated_portions" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"pickup_otp" text NOT NULL,
	"delivery_otp" text NOT NULL,
	"pickup_deadline" timestamp with time zone NOT NULL,
	"collected_at" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	"cancellation_reason" text,
	"match_score" numeric(5, 2) DEFAULT '85.00',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "delivery_events" ADD CONSTRAINT "delivery_events_order_id_rescue_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."rescue_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_events" ADD CONSTRAINT "delivery_events_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rescue_orders" ADD CONSTRAINT "rescue_orders_listing_id_food_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."food_listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rescue_orders" ADD CONSTRAINT "rescue_orders_receiver_id_users_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rescue_orders" ADD CONSTRAINT "rescue_orders_volunteer_id_users_id_fk" FOREIGN KEY ("volunteer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;