// File: app/api/leaderboard/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();
import { clerkClient } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic"; // Data hamesha naya rahe

export async function GET() {
  try {
    // 1. Apne database se top 5 users ko points ke hisaab se fetch karo
    //    (Assume kar raha hoon aapke model ka naam 'user' hai)
    const topUsersByPoints = await db.user.findMany({
      orderBy: {
        points: "desc", // Points ko descending order (sabse zyada pehle)
      },
      take: 5, // Sirf top 5
      select: {
        id: true, // Clerk User ID (jo aapne DB me save ki hai)
        points: true,
      },
    });

    // 2. Clerk se un users ki profile info (naam, image) nikalo
    const userIds = topUsersByPoints.map((user) => user.id);

    if (userIds.length === 0) {
      return NextResponse.json([]); // Agar koi user nahi hai toh empty array bhejo
    }

    const client = await clerkClient();
    const { data: clerkUsers } = await client.users.getUserList({
      userId: userIds,
      limit: 5,
    });

    // 3. Dono data ko combine karo
    const leaderboard = topUsersByPoints.map((dbUser) => {
      const clerkUser = clerkUsers.find((u) => u.id === dbUser.id);
      
      return {
        id: dbUser.id,
        points: dbUser.points,
        // Clerk se full name banao
        fullName: clerkUser 
          ? `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() 
          : "Unnamed User",
        // Clerk se image URL lo
        imageUrl: clerkUser 
          ? clerkUser.imageUrl 
          : "/default-avatar.png", // Ek default image ka path daal dein
      };
    });

    return NextResponse.json(leaderboard);

  } catch (error) {
    console.error("[LEADERBOARD_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}