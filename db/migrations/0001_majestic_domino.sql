CREATE TABLE "food_listings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"donor_id" uuid NOT NULL,
	"organisation_name" text,
	"title" text NOT NULL,
	"food_category" text NOT NULL,
	"diet_type" text NOT NULL,
	"quantity_portions" integer NOT NULL,
	"remaining_portions" integer NOT NULL,
	"weight_kg" numeric(8, 2),
	"prepared_at" timestamp with time zone NOT NULL,
	"pickup_by" timestamp with time zone NOT NULL,
	"storage_instructions" text NOT NULL,
	"allergen_info" text NOT NULL,
	"handling_notes" text,
	"location_name" text NOT NULL,
	"latitude" numeric(10, 7) NOT NULL,
	"longitude" numeric(10, 7) NOT NULL,
	"status" text DEFAULT 'available' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "food_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"receiver_id" uuid NOT NULL,
	"organisation_name" text,
	"title" text NOT NULL,
	"requested_portions" integer NOT NULL,
	"food_preferences" text NOT NULL,
	"dietary_constraints" text,
	"needed_by" timestamp with time zone NOT NULL,
	"preferred_radius_km" integer DEFAULT 10 NOT NULL,
	"location_name" text NOT NULL,
	"latitude" numeric(10, 7) NOT NULL,
	"longitude" numeric(10, 7) NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listing_reservations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" uuid NOT NULL,
	"receiver_id" uuid NOT NULL,
	"portions_reserved" integer NOT NULL,
	"notes" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "receiver_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"daily_capacity_portions" integer DEFAULT 100 NOT NULL,
	"current_capacity_portions" integer DEFAULT 100 NOT NULL,
	"dietary_preferences" text,
	"service_radius_km" integer DEFAULT 10 NOT NULL,
	"operating_hours" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "receiver_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "food_listings" ADD CONSTRAINT "food_listings_donor_id_users_id_fk" FOREIGN KEY ("donor_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "food_requests" ADD CONSTRAINT "food_requests_receiver_id_users_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_reservations" ADD CONSTRAINT "listing_reservations_listing_id_food_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."food_listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_reservations" ADD CONSTRAINT "listing_reservations_receiver_id_users_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "receiver_profiles" ADD CONSTRAINT "receiver_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;