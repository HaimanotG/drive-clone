import getServerSession from "@/lib/get-server-session";
import { storage } from "@/lib/storage/storage";
import { NextRequest, NextResponse } from "next/server";
import { insertFolderSchema } from "@/shared/schema";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const folderData = insertFolderSchema.parse({
      ...body,
      userId: +userId,
    });

    const folder = await storage.createFolder({
      name: folderData.name,
      userId: folderData.userId,
      parentId: folderData?.parentId || null,
    });

    return NextResponse.json(folder);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const session = await getServerSession();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const parentId = request.nextUrl.searchParams.get("parentId");

  const folders = await storage.getFoldersByParent(
    userId,
    parentId ? +parentId : null
  );

  return NextResponse.json(folders);
}
