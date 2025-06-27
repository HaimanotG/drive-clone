import { db } from "./db";
import { files } from "@/shared/schema";
import { and, eq, count, or, ilike, desc, asc, isNull } from "drizzle-orm";
import { File, InsertFile } from "@/shared/schema";
import { IFileStorage, PaginationOptions } from "./types";

export class FileStorage implements IFileStorage {
  async createFile(file: InsertFile): Promise<File> {
    const [newFile] = await db.insert(files).values(file).returning();
    return newFile;
  }

  async getFilesByFolder(
    userId: string,
    folderId: number | null,
    options?: PaginationOptions
  ): Promise<File[]> {
    const {
      page = 1,
      limit = 50,
      sortBy = "name",
      sortOrder = "asc",
    } = options || {};
    const offset = (page - 1) * limit;

    const orderColumn =
      sortBy === "name"
        ? files.name
        : sortBy === "size"
        ? files.size
        : sortBy === "createdAt"
        ? files.createdAt
        : sortBy === "updatedAt"
        ? files.updatedAt
        : files.name;

    const orderFn = sortOrder === "desc" ? desc : asc;

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
      .orderBy(orderFn(orderColumn))
      .limit(limit)
      .offset(offset);
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

  async getRecentFiles(
    userId: string,
    options?: PaginationOptions
  ): Promise<File[]> {
    const {
      page = 1,
      limit = 20,
      sortBy = "updatedAt",
      sortOrder = "desc",
    } = options || {};
    const offset = (page - 1) * limit;

    const orderColumn =
      sortBy === "name"
        ? files.name
        : sortBy === "size"
        ? files.size
        : sortBy === "createdAt"
        ? files.createdAt
        : files.updatedAt;

    const orderFn = sortOrder === "desc" ? desc : asc;

    return await db
      .select()
      .from(files)
      .where(and(eq(files.userId, userId), eq(files.isTrashed, false)))
      .orderBy(orderFn(orderColumn))
      .limit(limit)
      .offset(offset);
  }

  async getStarredFiles(
    userId: string,
    options?: PaginationOptions
  ): Promise<File[]> {
    const {
      page = 1,
      limit = 50,
      sortBy = "name",
      sortOrder = "asc",
    } = options || {};
    const offset = (page - 1) * limit;

    // const orderColumn = {
    //   name: files.name,
    //   size: files.size,
    //   createdAt: files.createdAt,
    //   updatedAt: files.updatedAt,
    // }[sortBy];

    const orderColumn =
      sortBy === "name"
        ? files.name
        : sortBy === "size"
        ? files.size
        : sortBy === "createdAt"
        ? files.createdAt
        : files.updatedAt;

    const orderFn = sortOrder === "desc" ? desc : asc;

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
      .orderBy(orderFn(orderColumn))
      .limit(limit)
      .offset(offset);
  }

  async getTrashedFiles(
    userId: string,
    options?: PaginationOptions
  ): Promise<File[]> {
    const {
      page = 1,
      limit = 50,
      sortBy = "updatedAt",
      sortOrder = "desc",
    } = options || {};
    const offset = (page - 1) * limit;

    const orderColumn =
      sortBy === "name"
        ? files.name
        : sortBy === "size"
        ? files.size
        : sortBy === "createdAt"
        ? files.createdAt
        : files.updatedAt;

    const orderFn = sortOrder === "desc" ? desc : asc;

    return await db
      .select()
      .from(files)
      .where(and(eq(files.userId, userId), eq(files.isTrashed, true)))
      .orderBy(orderFn(orderColumn))
      .limit(limit)
      .offset(offset);
  }

  async searchFiles(
    userId: string,
    query: string,
    options?: PaginationOptions
  ): Promise<File[]> {
    const {
      page = 1,
      limit = 50,
      sortBy = "name",
      sortOrder = "asc",
    } = options || {};
    const offset = (page - 1) * limit;

    // Search in file names and content (if applicable)
    const searchCondition = or(
      ilike(files.name, `%${query}%`),
      ilike(files.mimeType, `%${query}%`)
    );

    const orderByColumn =
      sortBy === "name"
        ? files.name
        : sortBy === "size"
        ? files.size
        : sortBy === "createdAt"
        ? files.createdAt
        : files.updatedAt;

    return await db
      .select()
      .from(files)
      .where(
        and(
          eq(files.userId, userId),
          eq(files.isTrashed, false),
          searchCondition
        )
      )
      .orderBy(sortOrder === "desc" ? desc(orderByColumn) : asc(orderByColumn))
      .limit(limit)
      .offset(offset);
  }

  async getUserStorageUsed(userId: string): Promise<number> {
    const result = await db
      .select()
      .from(files)
      .where(and(eq(files.userId, userId), eq(files.isTrashed, false)));

    return result.reduce((total, file) => total + file.size, 0);
  }

  // Count methods for pagination
  async getFilesCount(
    userId: string,
    view: string,
    folderId?: number | null
  ): Promise<number> {
    switch (view) {
      case "Recent":
        return this.getRecentFilesCount(userId);
      case "Starred":
        return this.getStarredFilesCount(userId);
      case "Trash":
        return this.getTrashedFilesCount(userId);
      case "My Drive":
      default:
        return this.getFilesByFolderCount(userId, folderId || null);
    }
  }

  async getFilesByFolderCount(
    userId: string,
    folderId: number | null
  ): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(files)
      .where(
        and(
          eq(files.userId, userId),
          eq(files.isTrashed, false),
          folderId ? eq(files.folderId, folderId) : isNull(files.folderId)
        )
      );
    return result.count;
  }

  async getRecentFilesCount(userId: string): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(files)
      .where(and(eq(files.userId, userId), eq(files.isTrashed, false)));
    return result.count;
  }

  async getStarredFilesCount(userId: string): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(files)
      .where(
        and(
          eq(files.userId, userId),
          eq(files.isStarred, true),
          eq(files.isTrashed, false)
        )
      );
    return result.count;
  }

  async getTrashedFilesCount(userId: string): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(files)
      .where(and(eq(files.userId, userId), eq(files.isTrashed, true)));
    return result.count;
  }

  async getSearchFilesCount(
    userId: string,
    query: string
  ): Promise<number> {
    const searchCondition = or(
      ilike(files.name, `%${query}%`),
      ilike(files.mimeType, `%${query}%`)
    );
  
    const [result] = await db
      .select({ count: count() })
      .from(files)
      .where(
        and(
          eq(files.userId, userId),
          eq(files.isTrashed, false),
          searchCondition
        )
      );
    
    return result.count;
  }
}
