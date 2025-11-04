"use client";

import { redirect } from "next/navigation";

export default function UserHomePage() {
  // TODO: Check if user is authenticated
  // For now, redirect to sign in
  redirect("/auth/signin");
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">User Home</h1>
      <p>Welcome to your dashboard!</p>
    </div>
  );
}
