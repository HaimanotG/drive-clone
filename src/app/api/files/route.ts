import { NextRequest, NextResponse } from "next/server";
import { insertFileSchema } from "@/shared/schema";
import { storage } from "@/lib/storage/storage";
import { cloudinary, CloudinaryUploadApiResponse } from "@/lib/cloudinary";
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
      const buffer = await file.arrayBuffer();

      // Upload to Cloudinary
      const uploadResult = (await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              resource_type: "auto", // Automatically detect file type
              folder: `drive-clone/${session.user.id}`, // Organize by user
              public_id: `${Date.now()}-${file.name.replace(/\.[^/.]+$/, "")}`, // Remove extension, Cloudinary will add it
            },
            (error, result) => {
              if (error) reject(error);
              else if (result) resolve(result);
            }
          )
          .end(Buffer.from(buffer));
      })) as CloudinaryUploadApiResponse;

      const fileData = insertFileSchema.parse({
        name: file.name,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        path: uploadResult.secure_url, // Store Cloudinary URL instead of local path
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
