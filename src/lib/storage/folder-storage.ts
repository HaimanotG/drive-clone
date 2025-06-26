import { folders, type Folder, type InsertFolder } from "../../shared/schema";
import { db } from "./db";
import { eq, and, isNull } from "drizzle-orm";
import { IFolderStorage } from "./types";

export class FolderStorage implements IFolderStorage {
  async createFolder(folder: InsertFolder): Promise<Folder> {
    const [newFolder] = await db.insert(folders).values(folder).returning();
    return newFolder;
  }

  async getFoldersByParent(
    userId: string,
    parentId: number | null
  ): Promise<Folder[]> {
    return await db
      .select()
      .from(folders)
      .where(
        and(
          eq(folders.userId, userId),
          parentId ? eq(folders.parentId, parentId) : isNull(folders.parentId)
        )
      )
      .orderBy(folders.name);
  }

  async getFolderById(id: number, userId: string): Promise<Folder | undefined> {
    const [folder] = await db
      .select()
      .from(folders)
      .where(and(eq(folders.id, id), eq(folders.userId, userId)));
    return folder;
  }

  async updateFolder(
    id: number,
    userId: string,
    data: Partial<InsertFolder>
  ): Promise<Folder | undefined> {
    const [folder] = await db
      .update(folders)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(folders.id, id), eq(folders.userId, userId)))
      .returning();
    return folder;
  }

  async deleteFolder(id: number, userId: string): Promise<boolean> {
    const result = await db
      .delete(folders)
      .where(and(eq(folders.id, id), eq(folders.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }
}
