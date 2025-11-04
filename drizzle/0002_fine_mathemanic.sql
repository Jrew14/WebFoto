CREATE TABLE "manual_payment_methods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"type" text DEFAULT 'bank_transfer' NOT NULL,
	"account_number" text NOT NULL,
	"account_name" text NOT NULL,
	"min_amount" integer DEFAULT 10000 NOT NULL,
	"max_amount" integer DEFAULT 20000000 NOT NULL,
	"fee" integer DEFAULT 0 NOT NULL,
	"fee_percentage" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"instructions" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "idx_manual_payment_active" ON "manual_payment_methods" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_manual_payment_sort" ON "manual_payment_methods" USING btree ("sort_order");