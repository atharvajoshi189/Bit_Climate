import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const dynamic = "force-dynamic"; // Ensure no caching

/**
 * API route to add points AND log the activity (NOW WITH UPSERT + NO EXTRA CLERK CALL)
 * Expects { pointsToAdd: number, activityType: string, activityDetails?: string }
 */
export async function POST(request: Request) {
  console.log("\n--- ADD-POINTS API CALLED ---");
  const { userId } = await auth();
  if (!userId) {
    console.error("Add-Points Error: Unauthorized - No userId found.");
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  console.log("Authenticated User ID:", userId);

  try {
    const body = await request.json();
    const { pointsToAdd, activityType, activityDetails } = body;
    console.log("Request Body:", body);

    if (typeof pointsToAdd !== 'number' || !activityType) {
      console.error("Add-Points Error: Invalid request body.");
      return new NextResponse(JSON.stringify({ error: "Invalid request body" }), { status: 400 });
    }

    // --- YEH PART SIMPLIFY HO GAYA HAI ---
    // Ab hum email fetch nahi kar rahe, agar user naya hai toh email initially null/placeholder hoga
    const placeholderEmail = `user_${userId.substring(5)}@example.com`; // Ek temporary email bana do
    // --- END SIMPLIFICATION ---


    // Prisma Transaction
    console.log("Starting Prisma transaction...");
    const [updatedUser, newActivity] = await prisma.$transaction([
      prisma.user.upsert({
        where: { id: userId },
        update: {
          points: {
            increment: pointsToAdd > 0 ? pointsToAdd : 0,
          },
        },
        create: { // Agar user naya hai toh...
          id: userId,
          email: placeholderEmail, // Temporary email use karo
          points: pointsToAdd > 0 ? pointsToAdd : 0,
        },
      }),
      prisma.activity.create({
        data: {
          userId: userId,
          type: activityType,
          details: activityDetails || null,
        },
      }),
    ]);
    console.log("Prisma transaction successful.");
    console.log("Updated User Data:", updatedUser); // Points yahan dikhne chahiye
    console.log("New Activity Created:", newActivity);

    // Success response
    return NextResponse.json(
      {
        message: "Points and activity logged successfully",
        newTotalPoints: updatedUser.points
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("--- ERROR IN ADD-POINTS API ---");
    console.error(error);
    return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  } finally {
     console.log("--- ADD-POINTS API FINISHED ---");
  }
}

// Add GET handler to prevent caching issues if needed, though POST shouldn't cache
export async function GET(request: Request) {
  return new NextResponse(JSON.stringify({ error: "Method Not Allowed" }), { status: 405 });
}