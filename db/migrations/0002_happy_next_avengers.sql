CREATE TABLE "volunteer_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"availability_status" text DEFAULT 'available' NOT NULL,
	"preferred_radius_km" integer DEFAULT 10 NOT NULL,
	"transport_mode" text DEFAULT 'motorcycle' NOT NULL,
	"location_name" text DEFAULT 'Cyber Pearl, Madhapur' NOT NULL,
	"latitude" numeric(10, 6) DEFAULT '17.4483' NOT NULL,
	"longitude" numeric(10, 6) DEFAULT '78.3815' NOT NULL,
	"rescue_credits" integer DEFAULT 0 NOT NULL,
	"total_deliveries" integer DEFAULT 0 NOT NULL,
	"on_time_rate" numeric(5, 2) DEFAULT '100.00' NOT NULL,
	"location_updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "volunteer_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "volunteer_profiles" ADD CONSTRAINT "volunteer_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;