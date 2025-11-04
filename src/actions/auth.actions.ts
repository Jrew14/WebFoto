'use server';

import { authService } from '@/services';
import { cookies } from 'next/headers';

export async function signInAction(email: string, password: string) {
  return await authService.signIn({ email, password });
}

export async function signUpAction(data: {
  email: string;
  password: string;
  fullName: string;
  phone: string;
}) {
  return await authService.signUp(data);
}

export async function signOutAction() {
  return await authService.signOut();
}

export async function getCurrentUserAction() {
  return await authService.getCurrentUser();
}

export async function resetPasswordAction(email: string) {
  return await authService.resetPassword(email);
}

export async function updatePasswordAction(newPassword: string) {
  return await authService.updatePassword(newPassword);
}

export async function signInWithGoogleAction() {
  return await authService.signInWithGoogle();
}
