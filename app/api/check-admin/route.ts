import { NextResponse } from "next/server";
import { getSelf } from "@/lib/auth-service";

export async function GET() {
  try {
    const self = await getSelf();
    
    const isAdmin = 
      self.role === "ADMIN" || 
      self.role === "SUPER_ADMIN" || 
      self.role === "MODERATOR";

    return NextResponse.json({ 
      isAdmin,
      role: self.role,
      username: self.username 
    });
  } catch (error) {
    // Usuario no autenticado o error
    return NextResponse.json({ 
      isAdmin: false 
    });
  }
}