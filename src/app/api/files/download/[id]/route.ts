import { NextRequest, NextResponse } from "next/server";

import fs from "fs";
import path from "path";
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

    const filePath = path.resolve(file.path);
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { message: "File not found on disk" },
        { status: 404 }
      );
    }

    const fileBuffer = fs.readFileSync(filePath);

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${file.originalName}"`,
        "Content-Length": file.size.toString(),
      },
    });
  } catch (error) {
    console.error("Error downloading file:", error);
    return NextResponse.json(
      { message: "Failed to download file" },
      { status: 500 }
    );
  }
}
