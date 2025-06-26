import { storage } from "@/lib/storage/storage";
import getServerSession from "@/lib/get-server-session";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const files = await storage.getRecentFiles(session.user.id);
    return NextResponse.json(files);
  } catch (error) {
    console.error("Error fetching recent files:", error);
    return NextResponse.json(
      { message: "Failed to fetch recent files" },
      { status: 500 }
    );
  }
}
