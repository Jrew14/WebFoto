import { pgTable, uuid, text, timestamp, integer, boolean, date, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// =====================================================
// PROFILES TABLE
// =====================================================

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(), // References auth.users(id)
  email: text('email').notNull().unique(),
  fullName: text('full_name').notNull(),
  role: text('role', { enum: ['admin', 'buyer'] }).notNull().default('buyer'),
  phone: text('phone'),
  avatarUrl: text('avatar_url'),
  watermarkUrl: text('watermark_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    emailIdx: index('idx_profiles_email').on(table.email),
    roleIdx: index('idx_profiles_role').on(table.role),
  };
});

// =====================================================
// EVENTS TABLE
// =====================================================

export const events = pgTable('events', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  eventDate: date('event_date').notNull(),
  photographerId: uuid('photographer_id')
    .notNull()
    .references(() => profiles.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    photographerIdx: index('idx_events_photographer').on(table.photographerId),
    dateIdx: index('idx_events_date').on(table.eventDate),
  };
});

// =====================================================
// PHOTOS TABLE
// =====================================================

export const photos = pgTable('photos', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventId: uuid('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),
  photographerId: uuid('photographer_id')
    .notNull()
    .references(() => profiles.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  previewUrl: text('preview_url').notNull(),
  fullUrl: text('full_url').notNull(),
  watermarkUrl: text('watermark_url'),
  price: integer('price').notNull().default(0),
  sold: boolean('sold').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    eventIdx: index('idx_photos_event').on(table.eventId),
    photographerIdx: index('idx_photos_photographer').on(table.photographerId),
    soldIdx: index('idx_photos_sold').on(table.sold),
  };
});

// =====================================================
// PURCHASES TABLE
// =====================================================

export const purchases = pgTable('purchases', {
  id: uuid('id').defaultRandom().primaryKey(),
  buyerId: uuid('buyer_id')
    .notNull()
    .references(() => profiles.id, { onDelete: 'cascade' }),
  photoId: uuid('photo_id')
    .notNull()
    .references(() => photos.id, { onDelete: 'cascade' }),
  amount: integer('amount').notNull(),
  paymentMethod: text('payment_method'),
  paymentStatus: text('payment_status', { 
    enum: ['pending', 'paid', 'expired', 'failed'] 
  }).default('pending').notNull(),
  transactionId: text('transaction_id').unique(), // External ID for tracking
  xenditInvoiceId: text('xendit_invoice_id').unique(), // Xendit invoice ID
  xenditInvoiceUrl: text('xendit_invoice_url'), // Payment URL
  paidAt: timestamp('paid_at', { withTimezone: true }), // When payment was completed
  expiresAt: timestamp('expires_at', { withTimezone: true }), // Invoice expiry
  purchasedAt: timestamp('purchased_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    buyerIdx: index('idx_purchases_buyer').on(table.buyerId),
    photoIdx: index('idx_purchases_photo').on(table.photoId),
    statusIdx: index('idx_purchases_status').on(table.paymentStatus),
    transactionIdx: index('idx_purchases_transaction').on(table.transactionId),
    xenditInvoiceIdx: index('idx_purchases_xendit_invoice').on(table.xenditInvoiceId),
    uniqueBuyerPhoto: uniqueIndex('unique_buyer_photo').on(table.buyerId, table.photoId),
  };
});

// =====================================================
// BOOKMARKS TABLE
// =====================================================

export const bookmarks = pgTable('bookmarks', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => profiles.id, { onDelete: 'cascade' }),
  photoId: uuid('photo_id')
    .notNull()
    .references(() => photos.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    userIdx: index('idx_bookmarks_user').on(table.userId),
    photoIdx: index('idx_bookmarks_photo').on(table.photoId),
    uniqueUserPhoto: uniqueIndex('unique_user_photo').on(table.userId, table.photoId),
  };
});

// =====================================================
// RELATIONS
// =====================================================

export const profilesRelations = relations(profiles, ({ many }) => ({
  events: many(events),
  photos: many(photos),
  purchases: many(purchases),
  bookmarks: many(bookmarks),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  photographer: one(profiles, {
    fields: [events.photographerId],
    references: [profiles.id],
  }),
  photos: many(photos),
}));

export const photosRelations = relations(photos, ({ one, many }) => ({
  event: one(events, {
    fields: [photos.eventId],
    references: [events.id],
  }),
  photographer: one(profiles, {
    fields: [photos.photographerId],
    references: [profiles.id],
  }),
  purchases: many(purchases),
  bookmarks: many(bookmarks),
}));

export const purchasesRelations = relations(purchases, ({ one }) => ({
  buyer: one(profiles, {
    fields: [purchases.buyerId],
    references: [profiles.id],
  }),
  photo: one(photos, {
    fields: [purchases.photoId],
    references: [photos.id],
  }),
}));

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  user: one(profiles, {
    fields: [bookmarks.userId],
    references: [profiles.id],
  }),
  photo: one(photos, {
    fields: [bookmarks.photoId],
    references: [photos.id],
  }),
}));

// =====================================================
// TYPE EXPORTS
// =====================================================

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;

export type Photo = typeof photos.$inferSelect;
export type NewPhoto = typeof photos.$inferInsert;

export type Purchase = typeof purchases.$inferSelect;
export type NewPurchase = typeof purchases.$inferInsert;

export type Bookmark = typeof bookmarks.$inferSelect;
export type NewBookmark = typeof bookmarks.$inferInsert;
