import { NextRequest, NextResponse } from "next/server";
import { insertFileSchema } from "@/shared/schema";
import { storage } from "@/lib/storage/storage";

import getServerSession from "@/lib/get-server-session";

// POST /api/files - Upload files
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const folderId = formData.get("folderId")
      ? parseInt(formData.get("folderId") as string)
      : null;

    if (!files || files.length === 0) {
      return NextResponse.json(
        { message: "No files uploaded" },
        { status: 400 }
      );
    }

    const createdFiles = [];

    for (const file of files) {
      // Save file to disk (you'll need to implement file saving logic)
      // const buffer = await file.arrayBuffer();
      const filePath = `uploads/${Date.now()}-${file.name}`;

      // Save buffer to file system or cloud storage
      // await fs.writeFile(filePath, Buffer.from(buffer));

      const fileData = insertFileSchema.parse({
        name: file.name,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        path: filePath,
        folderId,
        userId: session.user.id,
      });

      const createdFile = await storage.createFile(fileData);
      createdFiles.push(createdFile);
    }

    return NextResponse.json(createdFiles);
  } catch (error) {
    console.error("Error uploading files:", error);
    return NextResponse.json(
      { message: "Failed to upload files" },
      { status: 400 }
    );
  }
}

// GET /api/files - Get files by folder
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get("folderId")
      ? parseInt(searchParams.get("folderId")!)
      : null;

    const files = await storage.getFilesByFolder(session.user.id, folderId);
    return NextResponse.json(files);
  } catch (error) {
    console.error("Error fetching files:", error);
    return NextResponse.json(
      { message: "Failed to fetch files" },
      { status: 500 }
    );
  }
}
