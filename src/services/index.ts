/**
 * Services Index
 * 
 * Central export point for all services
 */

// Export all services
export * from './auth.service';
export * from './event.service';
export * from './photo.service';
export * from './purchase.service';
export * from './bookmark.service';
export * from './profile.service';

// Re-export singleton instances for convenience
export { authService } from './auth.service';
export { eventService } from './event.service';
export { photoService } from './photo.service';
export { purchaseService } from './purchase.service';
export { bookmarkService } from './bookmark.service';
export { profileService } from './profile.service';
