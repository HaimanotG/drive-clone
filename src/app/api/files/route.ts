import { NextRequest, NextResponse } from "next/server";
import { insertFileSchema } from "@/shared/schema";
import { storage } from "@/lib/storage/storage";
import { cloudinary, CloudinaryUploadApiResponse } from "@/lib/cloudinary";
import getServerSession from "@/lib/get-server-session";
import { z } from "zod";

const uploadRequestSchema = z.object({
  files: z.array(z.instanceof(File)).min(1, "At least one file is required"),
  folderId: z.number().optional().nullable(),
});

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_FILES_PER_REQUEST = 10;

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized", code: "AUTH_REQUIRED" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const folderId = formData.get("folderId")
      ? parseInt(formData.get("folderId") as string)
      : null;

    const validationResult = uploadRequestSchema.safeParse({ files, folderId });
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          code: "VALIDATION_ERROR",
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    if (files.length > MAX_FILES_PER_REQUEST) {
      return NextResponse.json(
        {
          error: `Maximum ${MAX_FILES_PER_REQUEST} files allowed per request`,
          code: "TOO_MANY_FILES",
        },
        { status: 400 }
      );
    }

    const invalidFiles = files.filter(
      (file) =>
        file.size > MAX_FILE_SIZE || !ALLOWED_MIME_TYPES.includes(file.type)
    );

    if (invalidFiles.length > 0) {
      return NextResponse.json(
        {
          error: "Invalid files detected",
          code: "INVALID_FILES",
          details: invalidFiles.map((file) => ({
            name: file.name,
            issues: [
              ...(file.size > MAX_FILE_SIZE ? ["File too large"] : []),
              ...(!ALLOWED_MIME_TYPES.includes(file.type)
                ? ["Unsupported file type"]
                : []),
            ],
          })),
        },
        { status: 400 }
      );
    }

    const currentUsage = await storage.getUserStorageUsed(session.user.id);
    const totalNewSize = files.reduce((sum, file) => sum + file.size, 0);
    const USER_STORAGE_LIMIT = 5 * 1024 * 1024 * 1024; // 5GB

    if (currentUsage + totalNewSize > USER_STORAGE_LIMIT) {
      return NextResponse.json(
        {
          error: "Storage quota exceeded",
          code: "QUOTA_EXCEEDED",
          currentUsage,
          limit: USER_STORAGE_LIMIT,
        },
        { status: 413 }
      );
    }

    const createdFiles = [];
    const errors = [];

    for (const [, file] of files.entries()) {
      try {
        const buffer = await file.arrayBuffer();

        // Upload to Cloudinary with retry logic
        const uploadResult = await uploadToCloudinaryWithRetry(
          buffer,
          file,
          session.user.id
        );

        const fileData = insertFileSchema.parse({
          name: file.name,
          originalName: file.name,
          mimeType: file.type,
          size: file.size,
          path: uploadResult.secure_url,
          folderId,
          userId: session.user.id,
        });

        const createdFile = await storage.createFile(fileData);
        createdFiles.push(createdFile);
      } catch (error) {
        console.error(`Error uploading file ${file.name}:`, error);
        errors.push({
          fileName: file.name,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    // Return partial success if some files failed
    if (errors.length > 0 && createdFiles.length > 0) {
      return NextResponse.json(
        {
          message: "Partial upload success",
          uploadedFiles: createdFiles,
          errors,
        },
        { status: 207 } // Multi-status
      );
    }

    if (errors.length > 0) {
      return NextResponse.json(
        {
          error: "All uploads failed",
          code: "UPLOAD_FAILED",
          errors,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Files uploaded successfully",
      files: createdFiles,
    });
  } catch (error) {
    console.error("Error uploading files:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}

// Helper function with retry logic
async function uploadToCloudinaryWithRetry(
  buffer: ArrayBuffer,
  file: File,
  userId: string,
  maxRetries = 3
): Promise<CloudinaryUploadApiResponse> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return (await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              resource_type: "auto",
              folder: `drive-clone/${userId}`,
              public_id: `${Date.now()}-${file.name.replace(/\.[^/.]+$/, "")}`,
              overwrite: false,
              unique_filename: true,
            },
            (error, result) => {
              if (error) reject(error);
              else if (result) resolve(result);
            }
          )
          .end(Buffer.from(buffer));
      })) as CloudinaryUploadApiResponse;
    } catch (error) {
      if (attempt === maxRetries) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
    }
  }
  throw new Error("Upload failed after all retries");
}

// GET /api/files - Enhanced with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized", code: "AUTH_REQUIRED" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get("folderId")
      ? parseInt(searchParams.get("folderId")!)
      : null;
    const view = searchParams.get("view") || "My Drive";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const sortBy = searchParams.get("sortBy") || "name";
    const sortOrder = searchParams.get("sortOrder") as
      | "asc"
      | "desc"
      | undefined;
    const searchQuery = searchParams.get("search");

    let files;
    let totalCount = 0;

    // Handle search queries
    if (searchQuery && searchQuery.trim()) {
      files = await storage.searchFiles(session.user.id, searchQuery.trim(), {
        page,
        limit,
        sortBy,
        sortOrder,
      });
      totalCount = await storage.getSearchFilesCount(session.user.id, searchQuery.trim());
    } else {
      // Existing logic for different views
      switch (view) {
        case "Recent":
          files = await storage.getRecentFiles(session.user.id, {
            page,
            limit,
            sortBy,
            sortOrder,
          });
          break;
        case "Starred":
          files = await storage.getStarredFiles(session.user.id, {
            page,
            limit,
            sortBy,
            sortOrder,
          });
          break;
        case "Trash":
          files = await storage.getTrashedFiles(session.user.id, {
            page,
            limit,
            sortBy,
            sortOrder,
          });
          break;
        case "My Drive":
        default:
          files = await storage.getFilesByFolder(session.user.id, folderId, {
            page,
            limit,
            sortBy,
            sortOrder,
          });
          break;
      }

      // Get total count for pagination
      totalCount = await storage.getFilesCount(
        session.user.id,
        view,
        folderId || 0
      );
    }

    return NextResponse.json({
      files,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
      },
      view,
      searchQuery: searchQuery || null,
    });
  } catch (error) {
    console.error("Error fetching files:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch files",
        code: "FETCH_ERROR",
      },
      { status: 500 }
    );
  }
}
