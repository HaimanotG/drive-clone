import {
  type User,
  type UpsertUser,
  type Folder,
  type InsertFolder,
  type File,
  type InsertFile,
} from "../../shared/schema";
import { PaginationOptions } from "./types";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Folder operations
  createFolder(folder: InsertFolder): Promise<Folder>;
  getFoldersByParent(
    userId: string,
    parentId: number | null
  ): Promise<Folder[]>;
  getFolderById(id: number, userId: string): Promise<Folder | undefined>;
  updateFolder(
    id: number,
    userId: string,
    data: Partial<InsertFolder>
  ): Promise<Folder | undefined>;
  deleteFolder(id: number, userId: string): Promise<boolean>;

  // File operations
  createFile(file: InsertFile): Promise<File>;
  getFilesByFolder(
    userId: string,
    folderId: number | null,
    options?: PaginationOptions
  ): Promise<File[]>;
  getFileById(id: number, userId: string): Promise<File | undefined>;
  updateFile(
    id: number,
    userId: string,
    data: Partial<InsertFile>
  ): Promise<File | undefined>;
  deleteFile(id: number, userId: string): Promise<boolean>;
  getRecentFiles(userId: string, options?: PaginationOptions): Promise<File[]>;
  getStarredFiles(userId: string, options?: PaginationOptions): Promise<File[]>;
  getTrashedFiles(userId: string, options?: PaginationOptions): Promise<File[]>;
  searchFiles(userId: string, query: string, options?: PaginationOptions): Promise<File[]>;
  getUserStorageUsed(userId: string): Promise<number>;
  
  // Count methods
  getFilesCount(userId: string, view: string, folderId?: number | null): Promise<number>;
  // Add this method to the IFileStorage interface
  getSearchFilesCount(userId: string, query: string): Promise<number>;
}
