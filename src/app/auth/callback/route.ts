import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/db';
import { profiles } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createClient();
    
    // Exchange code for session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Check if profile exists in database
      const [existingProfile] = await db
        .select()
        .from(profiles)
        .where(eq(profiles.id, data.user.id))
        .limit(1);

      // If profile doesn't exist, create it
      if (!existingProfile) {
        const metadata = data.user.user_metadata;
        
        await db.insert(profiles).values({
          id: data.user.id,
          email: data.user.email!,
          fullName: metadata?.full_name || metadata?.name || data.user.email!.split('@')[0],
          role: 'buyer', // OAuth users are buyers by default
          phone: metadata?.phone || null,
          avatarUrl: metadata?.avatar_url || metadata?.picture || null,
        });
      }

      // Check user role and redirect accordingly
      const [profile] = await db
        .select()
        .from(profiles)
        .where(eq(profiles.id, data.user.id))
        .limit(1);

      if (profile?.role === 'admin') {
        return NextResponse.redirect(`${origin}/admin/dashboard`);
      }

      // Regular user redirect to shop
      return NextResponse.redirect(`${origin}/shop`);
    }
  }

  // If there's an error or no code, redirect to sign in
  return NextResponse.redirect(`${origin}/auth/signin?error=oauth_failed`);
}
