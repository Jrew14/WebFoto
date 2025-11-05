'use server';

import { purchaseService, bookmarkService, profileService } from '@/services';

// Profile Actions
export async function getProfileAction(userId: string) {
  return await profileService.getProfile(userId);
}

export async function updateProfileAction(userId: string, updates: {
  fullName?: string;
  phone?: string;
  avatarUrl?: string;
  watermarkUrl?: string;
}) {
  return await profileService.updateProfile(userId, updates);
}

// Purchase Actions
export async function createPurchaseAction(purchase: {
  buyerId: string;
  photoId: string;
  amount: number;
  paymentMethod?: string;
  transactionId?: string;
}) {
  return await purchaseService.createPurchase(purchase);
}

export async function getUserPurchasesAction(userId: string) {
  return await purchaseService.getUserPurchases(userId);
}

export async function getUserOwnedPhotoIdsAction(userId: string, includePending = true) {
  return await purchaseService.getUserOwnedPhotoIds(userId, includePending);
}

export async function getTotalRevenueAction() {
  return await purchaseService.getTotalRevenue();
}

// Bookmark Actions
export async function toggleBookmarkAction(userId: string, photoId: string) {
  return await bookmarkService.toggleBookmark(userId, photoId);
}

export async function getUserBookmarksAction(userId: string) {
  return await bookmarkService.getUserBookmarks(userId);
}

export async function getUserBookmarkIdsAction(userId: string) {
  return await bookmarkService.getUserBookmarkIds(userId);
}
