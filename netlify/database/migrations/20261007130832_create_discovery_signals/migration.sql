CREATE TABLE "discovery_signals" (
	"visitor_id" uuid,
	"discovery_id" text,
	"mode" text NOT NULL,
	"topic" text NOT NULL,
	"tags" jsonb NOT NULL,
	"status" text DEFAULT 'shown' NOT NULL,
	"shown_count" integer DEFAULT 1 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "discovery_signals_pkey" PRIMARY KEY("visitor_id","discovery_id")
);
