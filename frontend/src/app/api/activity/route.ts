// src/app/api/activity/route.ts
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";

// Prisma singleton to avoid too many clients during dev/hot-reload
const globalForPrisma = global as unknown as { prisma?: PrismaClient };
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["error", "warn"],
  });
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// GET → fetch latest 10 user activities
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      console.error("User is not authenticated (GET /api/activity)");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const activities = await prisma.activity.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json(activities);
  } catch (error) {
    console.error("[ACTIVITY_GET_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// POST → add new activity & return updated list
export async function POST(req: Request) {
  try {
    const { userId, sessionClaims } = await auth();
    const body = await req.json();
    const { type, details } = body ?? {};

    if (!userId) {
      console.error("User is not authenticated (POST /api/activity)");
      return new NextResponse("Unauthorized", { status: 401 });
    }
    if (!type) {
      console.error("Activity type missing in POST /api/activity");
      return new NextResponse("Activity type is required", { status: 400 });
    }

    const userEmail =
      typeof (sessionClaims as any)?.email === "string"
        ? (sessionClaims as any).email
        : (sessionClaims as any)?.primaryEmail || `user_${userId}@example.com`;

    // ensure user exists
    await prisma.user.upsert({
      where: { id: userId },
      update: { email: userEmail },
      create: { id: userId, email: userEmail },
    });

    await prisma.activity.create({
      data: { userId, type, details },
    });

    // Return updated list (latest first)
    const updatedActivities = await prisma.activity.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json(updatedActivities, { status: 201 });
  } catch (error) {
    console.error("[ACTIVITY_POST_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
