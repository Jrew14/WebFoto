import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { fullName, phone, role, password } = body;

    // Update profile in database
    const updates: Partial<typeof profiles.$inferInsert> = {};
    
    if (fullName !== undefined) updates.fullName = fullName;
    if (phone !== undefined) updates.phone = phone;
    if (role !== undefined) updates.role = role;

    if (Object.keys(updates).length > 0) {
      await db
        .update(profiles)
        .set(updates)
        .where(eq(profiles.id, id));
    }

    // Update password in Supabase Auth if provided
    if (password && password.trim() !== "") {
      const { error: passwordError } = await supabaseAdmin.auth.admin.updateUserById(
        id,
        { password }
      );

      if (passwordError) {
        console.error("Failed to update password:", passwordError);
        return NextResponse.json(
          { error: "Failed to update password" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ 
      success: true,
      message: "User updated successfully" 
    });
  } catch (error) {
    console.error("Failed to update user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Delete user from Supabase Auth
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);
    
    if (authError) {
      console.error("Failed to delete user from auth:", authError);
      return NextResponse.json(
        { error: "Failed to delete user" },
        { status: 500 }
      );
    }

    // Delete profile from database (cascade will handle related records)
    await db.delete(profiles).where(eq(profiles.id, id));

    return NextResponse.json({ 
      success: true,
      message: "User deleted successfully" 
    });
  } catch (error) {
    console.error("Failed to delete user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
