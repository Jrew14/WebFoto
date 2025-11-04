// Database Types untuk Supabase

export interface Event {
  id: string;
  name: string;
  description: string | null;
  event_date: string;
  created_at: string;
  photographer_id: string;
  photo_count?: number;
}

export interface Photo {
  id: string;
  name: string;
  price: number;
  event_id: string;
  photographer_id: string;
  preview_url: string; // Low-res watermarked
  original_url: string; // High-res original
  file_size: number;
  width: number;
  height: number;
  sold: boolean;
  sold_at: string | null;
  buyer_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: 'photographer' | 'buyer';
  avatar_url: string | null;
  created_at: string;
}

export interface Purchase {
  id: string;
  photo_id: string;
  buyer_id: string;
  photographer_id: string;
  amount: number;
  platform_fee: number;
  photographer_revenue: number;
  status: 'pending' | 'completed' | 'failed';
  payment_method: string | null;
  created_at: string;
  completed_at: string | null;
}

// View Types untuk UI
export interface EventWithPhotos extends Event {
  photos: Photo[];
}

export interface PhotoWithDetails extends Photo {
  event: Event;
  photographer: Profile;
  buyer?: Profile;
}

export interface PurchaseWithDetails extends Purchase {
  photo: PhotoWithDetails;
}
