import {
  type User,
  type UpsertUser,
  type Folder,
  type InsertFolder,
  type File,
  type InsertFile,
} from "../../shared/schema";

export interface IUserStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(userData: UpsertUser): Promise<User>;
}

export interface IFolderStorage {
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
}

export interface IFileStorage {
  createFile(file: InsertFile): Promise<File>;
  getFilesByFolder(userId: string, folderId: number | null): Promise<File[]>;
  getFileById(id: number, userId: string): Promise<File | undefined>;
  updateFile(
    id: number,
    userId: string,
    data: Partial<InsertFile>
  ): Promise<File | undefined>;
  deleteFile(id: number, userId: string): Promise<boolean>;
  getRecentFiles(userId: string): Promise<File[]>;
  getStarredFiles(userId: string): Promise<File[]>;
  getTrashedFiles(userId: string): Promise<File[]>;
  searchFiles(userId: string, query: string): Promise<File[]>;
  getUserStorageUsed(userId: string): Promise<number>;
}

export interface IStorage extends IUserStorage, IFolderStorage, IFileStorage {}
