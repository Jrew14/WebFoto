CREATE TABLE "cart_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"photo_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "purchase_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"purchase_id" uuid,
	"action" text NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "purchases" ADD COLUMN "payment_type" text DEFAULT 'automatic';--> statement-breakpoint
ALTER TABLE "purchases" ADD COLUMN "payment_proof_url" text;--> statement-breakpoint
ALTER TABLE "purchases" ADD COLUMN "manual_payment_method_id" uuid;--> statement-breakpoint
ALTER TABLE "purchases" ADD COLUMN "verified_by" uuid;--> statement-breakpoint
ALTER TABLE "purchases" ADD COLUMN "verified_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_photo_id_photos_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."photos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_logs" ADD CONSTRAINT "purchase_logs_purchase_id_purchases_id_fk" FOREIGN KEY ("purchase_id") REFERENCES "public"."purchases"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_cart_items_user" ON "cart_items" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_cart_items_photo" ON "cart_items" USING btree ("photo_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_cart_user_photo" ON "cart_items" USING btree ("user_id","photo_id");--> statement-breakpoint
CREATE INDEX "idx_purchase_logs_purchase" ON "purchase_logs" USING btree ("purchase_id");--> statement-breakpoint
CREATE INDEX "idx_purchase_logs_created" ON "purchase_logs" USING btree ("created_at");--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_manual_payment_method_id_manual_payment_methods_id_fk" FOREIGN KEY ("manual_payment_method_id") REFERENCES "public"."manual_payment_methods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_verified_by_profiles_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;