import { storage } from "@/lib/storage/storage";
import getServerSession from "@/lib/get-server-session";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const user = await storage.getUser(session.user.id);
  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  const storageUsed = await storage.getUserStorageUsed(session.user.id);
  const storageTotal = 10 * 1024 * 1024 * 1024; // 10GB

  const storagePercentage = (storageUsed / storageTotal) * 100;

  const userWithStorage = {
    ...user,
    storageUsed,
    storageTotal,
    storagePercentage,
  };

  return NextResponse.json(userWithStorage);
}
