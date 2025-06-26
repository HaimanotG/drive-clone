import { files, type File, type InsertFile } from "../../shared/schema";
import { db } from "./db";
import { eq, and, isNull, desc } from "drizzle-orm";
import { IFileStorage } from "./types";

export class FileStorage implements IFileStorage {
  async createFile(file: InsertFile): Promise<File> {
    const [newFile] = await db.insert(files).values(file).returning();
    return newFile;
  }

  async getFilesByFolder(
    userId: string,
    folderId: number | null
  ): Promise<File[]> {
    return await db
      .select()
      .from(files)
      .where(
        and(
          eq(files.userId, userId),
          eq(files.isTrashed, false),
          folderId ? eq(files.folderId, folderId) : isNull(files.folderId)
        )
      )
      .orderBy(files.name);
  }

  async getFileById(id: number, userId: string): Promise<File | undefined> {
    const [file] = await db
      .select()
      .from(files)
      .where(and(eq(files.id, id), eq(files.userId, userId)));
    return file;
  }

  async updateFile(
    id: number,
    userId: string,
    data: Partial<InsertFile>
  ): Promise<File | undefined> {
    const [file] = await db
      .update(files)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(files.id, id), eq(files.userId, userId)))
      .returning();
    return file;
  }

  async deleteFile(id: number, userId: string): Promise<boolean> {
    const result = await db
      .delete(files)
      .where(and(eq(files.id, id), eq(files.userId, userId)));
    return (result?.rowCount ?? 0) > 0;
  }

  async getRecentFiles(userId: string): Promise<File[]> {
    return await db
      .select()
      .from(files)
      .where(and(eq(files.userId, userId), eq(files.isTrashed, false)))
      .orderBy(desc(files.updatedAt))
      .limit(20);
  }

  async getStarredFiles(userId: string): Promise<File[]> {
    return await db
      .select()
      .from(files)
      .where(
        and(
          eq(files.userId, userId),
          eq(files.isStarred, true),
          eq(files.isTrashed, false)
        )
      )
      .orderBy(files.name);
  }

  async getTrashedFiles(userId: string): Promise<File[]> {
    return await db
      .select()
      .from(files)
      .where(and(eq(files.userId, userId), eq(files.isTrashed, true)))
      .orderBy(desc(files.updatedAt));
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async searchFiles(userId: string, _query: string): Promise<File[]> {
    return await db
      .select()
      .from(files)
      .where(and(eq(files.userId, userId), eq(files.isTrashed, false)))
      .orderBy(files.name);
  }

  async getUserStorageUsed(userId: string): Promise<number> {
    const result = await db
      .select()
      .from(files)
      .where(and(eq(files.userId, userId), eq(files.isTrashed, false)));

    return result.reduce((total, file) => total + file.size, 0);
  }
}
