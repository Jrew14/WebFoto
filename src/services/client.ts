/**
 * Client Services Index
 * 
 * Only exports services that are safe to use in client components
 * (Services that don't directly use database/postgres)
 */

// Export client-safe auth service (uses only Supabase Auth, no database)
export { authService } from './auth.client';
export type { AuthService, User, SignUpData, SignInData } from './auth.client';
