CREATE TABLE "annonce_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"annonce_id" integer NOT NULL,
	"image_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "uniq_annonce_image" UNIQUE("annonce_id","image_id")
);
--> statement-breakpoint
CREATE TABLE "annonce_publication_checklist" (
	"id" serial PRIMARY KEY NOT NULL,
	"annonce_id" integer NOT NULL,
	"is_contact_verified" boolean DEFAULT false NOT NULL,
	"is_annonce_verified_by_ia" boolean DEFAULT false NOT NULL,
	"is_annonce_verified_by_admin" boolean DEFAULT false NOT NULL,
	"is_annonce_verified_by_assistant" boolean DEFAULT false NOT NULL,
	"is_allowed_to_be_published" boolean DEFAULT false NOT NULL,
	CONSTRAINT "annonce_publication_checklist_annonce_id_unique" UNIQUE("annonce_id")
);
--> statement-breakpoint
CREATE TABLE "annonces" (
	"id" serial PRIMARY KEY NOT NULL,
	"type_annonce_id" integer NOT NULL,
	"categorie_id" integer NOT NULL,
	"subcategorie_id" integer,
	"lieu_id" integer,
	"moughataa_id" integer,
	"lieu_str" varchar(255),
	"lieu_str_ar" varchar(255),
	"moughataa_str" varchar(255),
	"moughataa_str_ar" varchar(255),
	"user_id" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"private_description" text,
	"price" numeric(15, 2),
	"contact" varchar(100) NOT NULL,
	"have_image" boolean DEFAULT false NOT NULL,
	"first_image_path" varchar(512),
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"is_sponsored" boolean DEFAULT false NOT NULL,
	"is_price_hidden" boolean DEFAULT false NOT NULL,
	"direct_negotiation" boolean,
	"issmar" boolean,
	"classification_fr" varchar(255),
	"classification_ar" varchar(255),
	"rental_period" varchar(50),
	"rental_period_ar" varchar(100),
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contacts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"contact" varchar(255),
	"contact_type" varchar(20),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"verify_code" varchar(10) DEFAULT '' NOT NULL,
	"verify_token_expires" timestamp,
	"cooldown_until" timestamp
);
--> statement-breakpoint
CREATE TABLE "favorites" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"annonce_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "uniq_favorite" UNIQUE("user_id","annonce_id")
);
--> statement-breakpoint
CREATE TABLE "images" (
	"id" serial PRIMARY KEY NOT NULL,
	"image_path" varchar(512) NOT NULL,
	"alt_text" varchar(255),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "images_image_path_unique" UNIQUE("image_path")
);
--> statement-breakpoint
CREATE TABLE "lieux" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"name_ar" varchar(255) NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"depth" integer NOT NULL,
	"parent_id" integer,
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7)
);
--> statement-breakpoint
CREATE TABLE "options" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"name_ar" varchar(255) NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"depth" integer NOT NULL,
	"tag" varchar(50) NOT NULL,
	"parent_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "password_resets" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "search_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"query" text,
	"filters" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"token" varchar(512) NOT NULL,
	"is_expired" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_accessed" timestamp,
	CONSTRAINT "user_sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"role_id" varchar(50),
	"role_name" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_login" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"verify_token" varchar(255),
	"verify_token_expires" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "annonce_images" ADD CONSTRAINT "annonce_images_annonce_id_annonces_id_fk" FOREIGN KEY ("annonce_id") REFERENCES "public"."annonces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "annonce_images" ADD CONSTRAINT "annonce_images_image_id_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."images"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "annonce_publication_checklist" ADD CONSTRAINT "annonce_publication_checklist_annonce_id_annonces_id_fk" FOREIGN KEY ("annonce_id") REFERENCES "public"."annonces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "annonces" ADD CONSTRAINT "annonces_type_annonce_id_options_id_fk" FOREIGN KEY ("type_annonce_id") REFERENCES "public"."options"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "annonces" ADD CONSTRAINT "annonces_categorie_id_options_id_fk" FOREIGN KEY ("categorie_id") REFERENCES "public"."options"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "annonces" ADD CONSTRAINT "annonces_subcategorie_id_options_id_fk" FOREIGN KEY ("subcategorie_id") REFERENCES "public"."options"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "annonces" ADD CONSTRAINT "annonces_lieu_id_lieux_id_fk" FOREIGN KEY ("lieu_id") REFERENCES "public"."lieux"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "annonces" ADD CONSTRAINT "annonces_moughataa_id_lieux_id_fk" FOREIGN KEY ("moughataa_id") REFERENCES "public"."lieux"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "annonces" ADD CONSTRAINT "annonces_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_annonce_id_annonces_id_fk" FOREIGN KEY ("annonce_id") REFERENCES "public"."annonces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_resets" ADD CONSTRAINT "password_resets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "search_logs" ADD CONSTRAINT "search_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_annonce_images_annonce_id" ON "annonce_images" USING btree ("annonce_id");--> statement-breakpoint
CREATE INDEX "idx_annonce_images_image_id" ON "annonce_images" USING btree ("image_id");--> statement-breakpoint
CREATE INDEX "idx_annonces_published_updated" ON "annonces" USING btree ("is_published","updated_at");--> statement-breakpoint
CREATE INDEX "idx_annonces_type_cat_subcat" ON "annonces" USING btree ("type_annonce_id","categorie_id","subcategorie_id");--> statement-breakpoint
CREATE INDEX "idx_annonces_user_created" ON "annonces" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_annonces_status_published" ON "annonces" USING btree ("status","is_published");--> statement-breakpoint
CREATE INDEX "idx_annonces_price" ON "annonces" USING btree ("price");--> statement-breakpoint
CREATE INDEX "idx_contacts_user_id" ON "contacts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_contacts_is_verified" ON "contacts" USING btree ("is_verified");--> statement-breakpoint
CREATE INDEX "idx_favorites_user_id" ON "favorites" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_images_created_at" ON "images" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_lieux_parent_id" ON "lieux" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "idx_options_tag_priority" ON "options" USING btree ("tag","priority");--> statement-breakpoint
CREATE INDEX "idx_options_parent_id" ON "options" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "idx_password_resets_token" ON "password_resets" USING btree ("token");--> statement-breakpoint
CREATE INDEX "idx_password_resets_expires_at" ON "password_resets" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_user_sessions_user_id" ON "user_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_sessions_last_accessed" ON "user_sessions" USING btree ("last_accessed");--> statement-breakpoint
CREATE INDEX "idx_users_created_at" ON "users" USING btree ("created_at");