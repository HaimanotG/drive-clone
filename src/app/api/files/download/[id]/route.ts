import { NextRequest, NextResponse } from "next/server";
import getServerSession from "@/lib/get-server-session";
import { storage } from "@/lib/storage/storage";
import { cloudinary } from "@/lib/cloudinary";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized", code: "AUTH_REQUIRED" },
        { status: 401 }
      );
    }

    const fileId = parseInt((await params).id);
    if (isNaN(fileId)) {
      return NextResponse.json(
        { error: "Invalid file ID", code: "INVALID_ID" },
        { status: 400 }
      );
    }

    const file = await storage.getFileById(fileId, session.user.id);

    if (!file) {
      return NextResponse.json(
        { error: "File not found", code: "FILE_NOT_FOUND" },
        { status: 404 }
      );
    }

    if (file.isTrashed) {
      return NextResponse.json(
        { error: "File is in trash", code: "FILE_TRASHED" },
        { status: 410 }
      );
    }

    // Generate signed URL for secure download
    const signedUrl = cloudinary.utils.private_download_url(
      file.path.split("/").pop()?.split(".")[0] || "",
      file.mimeType.startsWith("image/") ? "image" : "raw",
      {
        expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiry
        attachment: true,
      }
    );

    return NextResponse.redirect(signedUrl, 302);
  } catch (error) {
    console.error("Error downloading file:", error);
    return NextResponse.json(
      {
        error: "Failed to download file",
        code: "DOWNLOAD_ERROR",
      },
      { status: 500 }
    );
  }
}
