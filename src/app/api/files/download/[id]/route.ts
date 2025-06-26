import { NextRequest, NextResponse } from "next/server";
import getServerSession from "@/lib/get-server-session";
import { storage } from "@/lib/storage/storage";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const fileId = parseInt((await params).id);
    const file = await storage.getFileById(fileId, session.user.id);

    if (!file) {
      return NextResponse.json({ message: "File not found" }, { status: 404 });
    }

    // Redirect to Cloudinary URL for download
    return NextResponse.redirect(file.path, 302);
  } catch (error) {
    console.error("Error downloading file:", error);
    return NextResponse.json(
      { message: "Failed to download file" },
      { status: 500 }
    );
  }
}
