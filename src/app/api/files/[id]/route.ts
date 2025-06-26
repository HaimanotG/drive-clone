import { NextRequest, NextResponse } from "next/server";

import fs from "fs";
import getServerSession from "@/lib/get-server-session";
import { storage } from "@/lib/storage/storage";

// PUT /api/files/[id] - Update file
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const fileId = parseInt(id);
    const body = await request.json();

    const file = await storage.updateFile(fileId, session.user.id, body);
    if (!file) {
      return NextResponse.json({ message: "File not found" }, { status: 404 });
    }

    return NextResponse.json(file);
  } catch (error) {
    console.error("Error updating file:", error);
    return NextResponse.json(
      { message: "Failed to update file" },
      { status: 400 }
    );
  }
}

// DELETE /api/files/[id] - Delete file
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const fileId = parseInt(id);
    const file = await storage.getFileById(fileId, session.user.id);

    if (!file) {
      return NextResponse.json({ message: "File not found" }, { status: 404 });
    }

    // Delete file from disk
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    const deleted = await storage.deleteFile(fileId, session.user.id);
    if (!deleted) {
      return NextResponse.json({ message: "File not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      { message: "Failed to delete file" },
      { status: 500 }
    );
  }
}
