'use server';

import { photoService, eventService } from '@/services';

export async function getPhotosAction(filters?: {
  eventId?: string;
  photographerId?: string;
  sold?: boolean;
  minPrice?: number;
  maxPrice?: number;
}) {
  return await photoService.getPhotos(filters);
}

export async function searchPhotosAction(query: string) {
  return await photoService.searchPhotos(query);
}

export async function getPhotoByIdAction(photoId: string) {
  return await photoService.getPhoto(photoId);
}

export async function createPhotoAction(photo: {
  name: string;
  price: number;
  eventId: string;
  photographerId: string;
  previewUrl: string;
  fullUrl: string;
  watermarkUrl?: string;
}) {
  try {
    console.log('[createPhotoAction] Creating photo:', { 
      name: photo.name, 
      eventId: photo.eventId,
      photographerId: photo.photographerId 
    });
    
    const result = await photoService.createPhoto(photo);
    
    console.log('[createPhotoAction] Photo created successfully:', result.id);
    
    return result;
  } catch (error) {
    console.error('[createPhotoAction] Failed to create photo:', error);
    throw error;
  }
}

export async function updatePhotoAction(photoId: string, updates: {
  name?: string;
  price?: number;
  sold?: boolean;
}) {
  return await photoService.updatePhoto(photoId, updates);
}

export async function deletePhotoAction(photoId: string) {
  return await photoService.deletePhoto(photoId);
}

export async function getEventsAction() {
  return await eventService.getEvents();
}

export async function getEventWithPhotosAction(eventId: string) {
  return await eventService.getEventWithPhotos(eventId);
}

export async function createEventAction(event: {
  name: string;
  description?: string;
  eventDate: string;
  photographerId: string;
}) {
  return await eventService.createEvent(event);
}

export async function updateEventAction(eventId: string, updates: {
  name?: string;
  description?: string;
  eventDate?: string;
}) {
  return await eventService.updateEvent(eventId, updates);
}

export async function deleteEventAction(eventId: string) {
  return await eventService.deleteEvent(eventId);
}
