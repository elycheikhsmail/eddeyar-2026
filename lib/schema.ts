// lib/schema.ts — Drizzle ORM schema (PostgreSQL)
// Remplace les collections MongoDB : users, contacts, user_sessions,
// options, lieux, images, annonces, annonce_publication_checklist,
// annonce_images, favorites, password_resets, search_logs

import {
  pgTable,
  serial,
  varchar,
  text,
  boolean,
  integer,
  decimal,
  timestamp,
  unique,
  index,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// users  (ancienne collection "users")
// ---------------------------------------------------------------------------
export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    password: varchar("password", { length: 255 }).notNull(),
    roleId: varchar("role_id", { length: 50 }),
    roleName: varchar("role_name", { length: 100 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    lastLogin: timestamp("last_login"),
    isActive: boolean("is_active").notNull().default(true),
    emailVerified: boolean("email_verified").notNull().default(false),
    verifyToken: varchar("verify_token", { length: 255 }),
    verifyTokenExpires: timestamp("verify_token_expires"),
  },
  (t) => [index("idx_users_created_at").on(t.createdAt)]
);

// ---------------------------------------------------------------------------
// password_resets  (ancienne collection "password_resets")
// ---------------------------------------------------------------------------
export const passwordResets = pgTable(
  "password_resets",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: varchar("token", { length: 255 }).notNull(),
    contact: varchar("contact", { length: 100 }),
    otpCode: varchar("otp_code", { length: 20 }),
    used: boolean("used").notNull().default(false),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    usedAt: timestamp("used_at"),
    invalidatedAt: timestamp("invalidated_at"),
  },
  (t) => [
    index("idx_password_resets_token").on(t.token),
    index("idx_password_resets_expires_at").on(t.expiresAt),
    index("idx_password_resets_contact").on(t.contact),
  ]
);

// ---------------------------------------------------------------------------
// contacts  (ancienne collection "contacts")
// ---------------------------------------------------------------------------
export const contacts = pgTable(
  "contacts",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    contact: varchar("contact", { length: 255 }),       // téléphone ou email
    contactType: varchar("contact_type", { length: 20 }), // "phone" | "email"
    createdAt: timestamp("created_at").notNull().defaultNow(),
    isActive: boolean("is_active").notNull().default(true),
    isVerified: boolean("is_verified").notNull().default(false),
    verifyCode: varchar("verify_code", { length: 10 }).notNull().default(""),
    verifyTokenExpires: timestamp("verify_token_expires"),
    cooldownUntil: timestamp("cooldown_until"),
    verifyAttempts: integer("verify_attempts").notNull().default(0),
    lastResendAt: timestamp("last_resend_at"),
    resendCount: integer("resend_count").notNull().default(0),
  },
  (t) => [
    index("idx_contacts_user_id").on(t.userId),
    index("idx_contacts_is_verified").on(t.isVerified),
  ]
);

// ---------------------------------------------------------------------------
// user_sessions  (ancienne collection "user_sessions")
// ---------------------------------------------------------------------------
export const userSessions = pgTable(
  "user_sessions",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: varchar("token", { length: 512 }).notNull().unique(),
    isExpired: boolean("is_expired").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    lastAccessed: timestamp("last_accessed"),
  },
  (t) => [
    index("idx_user_sessions_user_id").on(t.userId),
    index("idx_user_sessions_last_accessed").on(t.lastAccessed),
  ]
);

// ---------------------------------------------------------------------------
// options  (ancienne collection "options")
// Contient : type_annonces (depth=1), categories (depth=2), subcategories (depth=3)
// Discriminateur : tag  ("type_annonce" | "categorie" | "subcategorie")
// ---------------------------------------------------------------------------
export const options = pgTable(
  "options",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    nameAr: varchar("name_ar", { length: 255 }).notNull(),
    priority: integer("priority").notNull().default(0),
    depth: integer("depth").notNull(),
    tag: varchar("tag", { length: 50 }).notNull(),
    parentId: integer("parent_id"),  // auto-référence ajoutée après
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("idx_options_tag_priority").on(t.tag, t.priority),
    index("idx_options_parent_id").on(t.parentId),
  ]
);

// ---------------------------------------------------------------------------
// lieux  (ancienne collection "lieux")
// depth=1 → wilaya  |  depth=2 → moughataa
// ---------------------------------------------------------------------------
export const lieux = pgTable(
  "lieux",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    nameAr: varchar("name_ar", { length: 255 }).notNull(),
    priority: integer("priority").notNull().default(0),
    depth: integer("depth").notNull(),   // 1=wilaya, 2=moughataa
    parentId: integer("parent_id"),      // null pour les wilayas
    latitude: decimal("latitude", { precision: 10, scale: 7 }),
    longitude: decimal("longitude", { precision: 10, scale: 7 }),
  },
  (t) => [index("idx_lieux_parent_id").on(t.parentId)]
);

// ---------------------------------------------------------------------------
// images  (ancienne collection "images")
// ---------------------------------------------------------------------------
export const images = pgTable(
  "images",
  {
    id: serial("id").primaryKey(),
    imagePath: varchar("image_path", { length: 512 }).notNull().unique(),
    altText: varchar("alt_text", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => [index("idx_images_created_at").on(t.createdAt)]
);

// ---------------------------------------------------------------------------
// annonces  (ancienne collection "annonces")
// ---------------------------------------------------------------------------
export const annonces = pgTable(
  "annonces",
  {
    id: serial("id").primaryKey(),

    // Relations options
    typeAnnonceId: integer("type_annonce_id")
      .notNull()
      .references(() => options.id),
    categorieId: integer("categorie_id")
      .notNull()
      .references(() => options.id),
    subcategorieId: integer("subcategorie_id").references(() => options.id),

    // Relations lieux (dénormalisé pour perf + historique)
    lieuId: integer("lieu_id").references(() => lieux.id),
    moughataaId: integer("moughataa_id").references(() => lieux.id),
    lieuStr: varchar("lieu_str", { length: 255 }),
    lieuStrAr: varchar("lieu_str_ar", { length: 255 }),
    moughataaStr: varchar("moughataa_str", { length: 255 }),
    moughataaStrAr: varchar("moughataa_str_ar", { length: 255 }),

    // Propriétaire
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),

    // Contenu
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description").notNull(),
    privateDescription: text("private_description"),
    price: decimal("price", { precision: 15, scale: 2 }),
    contact: varchar("contact", { length: 100 }).notNull(),

    // Flags
    haveImage: boolean("have_image").notNull().default(false),
    firstImagePath: varchar("first_image_path", { length: 512 }),
    status: varchar("status", { length: 50 }).notNull().default("active"),
    isPublished: boolean("is_published").notNull().default(false),
    isSponsored: boolean("is_sponsored").notNull().default(false),
    isPriceHidden: boolean("is_price_hidden").notNull().default(false),
    directNegotiation: boolean("direct_negotiation"),
    issmar: boolean("issmar"),

    // Classification IA
    classificationFr: varchar("classification_fr", { length: 255 }),
    classificationAr: varchar("classification_ar", { length: 255 }),

    // Location
    rentalPeriod: varchar("rental_period", { length: 50 }),
    rentalPeriodAr: varchar("rental_period_ar", { length: 100 }),

    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("idx_annonces_published_updated").on(t.isPublished, t.updatedAt),
    index("idx_annonces_type_cat_subcat").on(
      t.typeAnnonceId,
      t.categorieId,
      t.subcategorieId
    ),
    index("idx_annonces_user_created").on(t.userId, t.createdAt),
    index("idx_annonces_status_published").on(t.status, t.isPublished),
    index("idx_annonces_price").on(t.price),
  ]
);

// ---------------------------------------------------------------------------
// annonce_publication_checklist  (même nom)
// ---------------------------------------------------------------------------
export const annoncePublicationChecklist = pgTable(
  "annonce_publication_checklist",
  {
    id: serial("id").primaryKey(),
    annonceId: integer("annonce_id")
      .notNull()
      .unique()
      .references(() => annonces.id, { onDelete: "cascade" }),
    isContactVerified: boolean("is_contact_verified").notNull().default(false),
    isAnnonceVerifiedByIa: boolean("is_annonce_verified_by_ia")
      .notNull()
      .default(false),
    isAnnonceVerifiedByAdmin: boolean("is_annonce_verified_by_admin")
      .notNull()
      .default(false),
    isAnnonceVerifiedByAssistant: boolean("is_annonce_verified_by_assistant")
      .notNull()
      .default(false),
    isAllowedToBePublished: boolean("is_allowed_to_be_published")
      .notNull()
      .default(false),
  }
);

// ---------------------------------------------------------------------------
// annonce_images  (table de jonction many-to-many)
// ---------------------------------------------------------------------------
export const annonceImages = pgTable(
  "annonce_images",
  {
    id: serial("id").primaryKey(),
    annonceId: integer("annonce_id")
      .notNull()
      .references(() => annonces.id, { onDelete: "cascade" }),
    imageId: integer("image_id")
      .notNull()
      .references(() => images.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    unique("uniq_annonce_image").on(t.annonceId, t.imageId),
    index("idx_annonce_images_annonce_id").on(t.annonceId),
    index("idx_annonce_images_image_id").on(t.imageId),
  ]
);

// ---------------------------------------------------------------------------
// favorites
// ---------------------------------------------------------------------------
export const favorites = pgTable(
  "favorites",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    annonceId: integer("annonce_id")
      .notNull()
      .references(() => annonces.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    unique("uniq_favorite").on(t.userId, t.annonceId),
    index("idx_favorites_user_id").on(t.userId),
  ]
);

// ---------------------------------------------------------------------------
// search_logs  (ancienne collection "search")
// ---------------------------------------------------------------------------
export const searchLogs = pgTable("search_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  query: text("query"),
  filters: text("filters"),  // JSON stringifié
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Types inférés depuis le schéma (utiles dans les handlers)
// ---------------------------------------------------------------------------
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Contact = typeof contacts.$inferSelect;
export type NewContact = typeof contacts.$inferInsert;

export type UserSession = typeof userSessions.$inferSelect;
export type NewUserSession = typeof userSessions.$inferInsert;

export type Option = typeof options.$inferSelect;
export type NewOption = typeof options.$inferInsert;

export type Lieu = typeof lieux.$inferSelect;
export type NewLieu = typeof lieux.$inferInsert;

export type Image = typeof images.$inferSelect;
export type NewImage = typeof images.$inferInsert;

export type Annonce = typeof annonces.$inferSelect;
export type NewAnnonce = typeof annonces.$inferInsert;

export type AnnoncePublicationChecklist =
  typeof annoncePublicationChecklist.$inferSelect;

export type AnnonceImage = typeof annonceImages.$inferSelect;
export type NewAnnonceImage = typeof annonceImages.$inferInsert;

export type Favorite = typeof favorites.$inferSelect;
export type NewFavorite = typeof favorites.$inferInsert;
