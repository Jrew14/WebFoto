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
  totalAmount: integer('total_amount'),
  paymentMethod: text('payment_method'),
  paymentType: text('payment_type', {
    enum: ['manual', 'automatic'],
  }).default('automatic'),
  paymentStatus: text('payment_status', {
    enum: ['pending', 'paid', 'expired', 'failed'],
  }).default('pending').notNull(),
  transactionId: text('transaction_id').unique(), // Merchant reference
  paymentReference: text('payment_reference').unique(), // Tripay reference
  paymentCheckoutUrl: text('payment_checkout_url'),
  paymentCode: text('payment_code'),
  paymentNote: text('payment_note'),
  paymentProofUrl: text('payment_proof_url'), // Manual payment proof
  manualPaymentMethodId: uuid('manual_payment_method_id').references(() => manualPaymentMethods.id),
  verifiedBy: uuid('verified_by').references(() => profiles.id), // Admin who verified
  verifiedAt: timestamp('verified_at', { withTimezone: true }), // When admin verified
  paidAt: timestamp('paid_at', { withTimezone: true }), // When payment was completed
  expiresAt: timestamp('expires_at', { withTimezone: true }), // Payment expiry
  purchasedAt: timestamp('purchased_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    buyerIdx: index('idx_purchases_buyer').on(table.buyerId),
    photoIdx: index('idx_purchases_photo').on(table.photoId),
    statusIdx: index('idx_purchases_status').on(table.paymentStatus),
    transactionIdx: index('idx_purchases_transaction').on(table.transactionId),
    paymentReferenceIdx: index('idx_purchases_payment_reference').on(table.paymentReference),
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

// =====================================================
// MANUAL PAYMENT METHODS TABLE
// =====================================================

export const manualPaymentMethods = pgTable('manual_payment_methods', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(), // e.g., "BCA", "BNI", "DANA"
  type: text('type', { enum: ['bank_transfer', 'e_wallet', 'other'] }).notNull().default('bank_transfer'),
  accountNumber: text('account_number').notNull(), // Account number or wallet number
  accountName: text('account_name').notNull(), // Account holder name
  minAmount: integer('min_amount').notNull().default(10000),
  maxAmount: integer('max_amount').notNull().default(20000000),
  fee: integer('fee').notNull().default(0), // Fixed fee
  feePercentage: integer('fee_percentage').notNull().default(0), // Percentage fee (in basis points, e.g., 100 = 1%)
  isActive: boolean('is_active').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  instructions: text('instructions'), // Payment instructions for users
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    activeIdx: index('idx_manual_payment_active').on(table.isActive),
    sortIdx: index('idx_manual_payment_sort').on(table.sortOrder),
  };
});

export type Photo = typeof photos.$inferSelect;
export type NewPhoto = typeof photos.$inferInsert;

export type Purchase = typeof purchases.$inferSelect;
export type NewPurchase = typeof purchases.$inferInsert;

export type Bookmark = typeof bookmarks.$inferSelect;
export type NewBookmark = typeof bookmarks.$inferInsert;

export type ManualPaymentMethod = typeof manualPaymentMethods.$inferSelect;
export type NewManualPaymentMethod = typeof manualPaymentMethods.$inferInsert;
