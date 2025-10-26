import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = "force-dynamic"; // Ensure no caching
const prisma = new PrismaClient();

/**
 * API route to get the current user's profile data (Forcing Request usage)
 */
export async function GET(request: Request) { // Explicitly use request parameter
  console.log("\n--- PROFILE API CALLED (Attempt 3) ---");
  // Optional: Log the request URL to see if it's being hit correctly
  console.log("Request URL:", request.url); 
  try {
    const { userId } = await auth(); 
    if (!userId) {
      console.error("Profile API Error: Unauthorized - No userId found.");
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }
    console.log("Authenticated User ID:", userId);

    console.log("Attempting to fetch user from DB...");
    const userProfile = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        points: true,
      },
    });

    if (!userProfile) {
      console.warn("Profile API Warning: User profile not found in DB for userId:", userId);
      return NextResponse.json({ id: userId, email: "N/A", points: 0 }, { status: 200 });
    }

    console.log("User profile fetched successfully:", userProfile);
    return NextResponse.json(userProfile, { status: 200 });

  } catch (error: any) {
    console.error("--- ERROR IN PROFILE API ---");
    console.error(error);
    if (error.message && error.message.includes('signed out')) {
       return new NextResponse(JSON.stringify({ error: "Unauthorized - Clerk Error" }), { status: 401 });
    }
    return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  } finally {
     console.log("--- PROFILE API FINISHED ---");
  }
}