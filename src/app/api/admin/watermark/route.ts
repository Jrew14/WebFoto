/**
 * Get Admin Watermark API
 * 
 * Returns the admin's watermark image URL
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get profile with watermark
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('watermark_url')
      .eq('id', user.id)
      .eq('role', 'admin')
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found or not admin' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      watermarkUrl: profile.watermark_url || null,
    });
  } catch (error) {
    console.error('Get watermark error:', error);
    return NextResponse.json(
      { error: 'Failed to get watermark' },
      { status: 500 }
    );
  }
}
