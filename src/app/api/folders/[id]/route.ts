import { storage } from "@/lib/storage/storage";
import getServerSession from "@/lib/get-server-session";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const userId = session.user.id;
    const folderIdNumber = Number((await params).id);
    const folder = await storage.updateFolder(folderIdNumber, userId, body);

    return NextResponse.json(folder);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const folderIdNumber = Number((await params).id);
    await storage.deleteFolder(folderIdNumber, userId);
    return NextResponse.json({ message: "Folder deleted" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
