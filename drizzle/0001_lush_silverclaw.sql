CREATE TABLE "bookmarks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"photo_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"event_date" date NOT NULL,
	"photographer_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"photographer_id" uuid NOT NULL,
	"name" text NOT NULL,
	"preview_url" text NOT NULL,
	"full_url" text NOT NULL,
	"watermark_url" text,
	"price" integer DEFAULT 0 NOT NULL,
	"sold" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"full_name" text NOT NULL,
	"role" text DEFAULT 'buyer' NOT NULL,
	"phone" text,
	"avatar_url" text,
	"watermark_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "purchases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"buyer_id" uuid NOT NULL,
	"photo_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"total_amount" integer,
	"payment_method" text,
	"payment_status" text DEFAULT 'pending' NOT NULL,
	"transaction_id" text,
	"payment_reference" text,
	"payment_checkout_url" text,
	"payment_code" text,
	"payment_note" text,
	"paid_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"purchased_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "purchases_transaction_id_unique" UNIQUE("transaction_id"),
	CONSTRAINT "purchases_payment_reference_unique" UNIQUE("payment_reference")
);
--> statement-breakpoint
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_photo_id_photos_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."photos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_photographer_id_profiles_id_fk" FOREIGN KEY ("photographer_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "photos" ADD CONSTRAINT "photos_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "photos" ADD CONSTRAINT "photos_photographer_id_profiles_id_fk" FOREIGN KEY ("photographer_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_buyer_id_profiles_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_photo_id_photos_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."photos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_bookmarks_user" ON "bookmarks" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_bookmarks_photo" ON "bookmarks" USING btree ("photo_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_user_photo" ON "bookmarks" USING btree ("user_id","photo_id");--> statement-breakpoint
CREATE INDEX "idx_events_photographer" ON "events" USING btree ("photographer_id");--> statement-breakpoint
CREATE INDEX "idx_events_date" ON "events" USING btree ("event_date");--> statement-breakpoint
CREATE INDEX "idx_photos_event" ON "photos" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "idx_photos_photographer" ON "photos" USING btree ("photographer_id");--> statement-breakpoint
CREATE INDEX "idx_photos_sold" ON "photos" USING btree ("sold");--> statement-breakpoint
CREATE INDEX "idx_profiles_email" ON "profiles" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_profiles_role" ON "profiles" USING btree ("role");--> statement-breakpoint
CREATE INDEX "idx_purchases_buyer" ON "purchases" USING btree ("buyer_id");--> statement-breakpoint
CREATE INDEX "idx_purchases_photo" ON "purchases" USING btree ("photo_id");--> statement-breakpoint
CREATE INDEX "idx_purchases_status" ON "purchases" USING btree ("payment_status");--> statement-breakpoint
CREATE INDEX "idx_purchases_transaction" ON "purchases" USING btree ("transaction_id");--> statement-breakpoint
CREATE INDEX "idx_purchases_payment_reference" ON "purchases" USING btree ("payment_reference");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_buyer_photo" ON "purchases" USING btree ("buyer_id","photo_id");