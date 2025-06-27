import { UserStorage } from "./user-storage";
import { FolderStorage } from "./folder-storage";
import { FileStorage } from "./file-storage";
import { IStorage, PaginationOptions } from "./types";
import type {
  User,
  UpsertUser,
  Folder,
  InsertFolder,
  File,
  InsertFile,
} from "../../shared/schema";

export class DatabaseStorage implements IStorage {
  private userStorage = new UserStorage();
  private folderStorage = new FolderStorage();
  private fileStorage = new FileStorage();

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.userStorage.getUser(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    return this.userStorage.upsertUser(userData);
  }

  // Folder methods
  async createFolder(folder: InsertFolder): Promise<Folder> {
    return this.folderStorage.createFolder(folder);
  }

  async getFoldersByParent(
    userId: string,
    parentId: number | null
  ): Promise<Folder[]> {
    return this.folderStorage.getFoldersByParent(userId, parentId);
  }

  async getFolderById(id: number, userId: string): Promise<Folder | undefined> {
    return this.folderStorage.getFolderById(id, userId);
  }

  async updateFolder(
    id: number,
    userId: string,
    data: Partial<InsertFolder>
  ): Promise<Folder | undefined> {
    return this.folderStorage.updateFolder(id, userId, data);
  }

  async deleteFolder(id: number, userId: string): Promise<boolean> {
    return this.folderStorage.deleteFolder(id, userId);
  }

  // File methods
  async createFile(file: InsertFile): Promise<File> {
    return this.fileStorage.createFile(file);
  }

  async getFilesByFolder(
    userId: string,
    folderId: number | null,
    options?: PaginationOptions
  ): Promise<File[]> {
    return this.fileStorage.getFilesByFolder(userId, folderId, options);
  }

  async getFileById(id: number, userId: string): Promise<File | undefined> {
    return this.fileStorage.getFileById(id, userId);
  }

  async updateFile(
    id: number,
    userId: string,
    data: Partial<InsertFile>
  ): Promise<File | undefined> {
    return this.fileStorage.updateFile(id, userId, data);
  }

  async deleteFile(id: number, userId: string): Promise<boolean> {
    return this.fileStorage.deleteFile(id, userId);
  }

  async getRecentFiles(
    userId: string,
    options?: PaginationOptions
  ): Promise<File[]> {
    return this.fileStorage.getRecentFiles(userId, options);
  }

  async getStarredFiles(
    userId: string,
    options?: PaginationOptions
  ): Promise<File[]> {
    return this.fileStorage.getStarredFiles(userId, options);
  }

  async getTrashedFiles(
    userId: string,
    options?: PaginationOptions
  ): Promise<File[]> {
    return this.fileStorage.getTrashedFiles(userId, options);
  }

  async searchFiles(
    userId: string,
    query: string,
    options?: PaginationOptions
  ): Promise<File[]> {
    return this.fileStorage.searchFiles(userId, query, options);
  }

  async getUserStorageUsed(userId: string): Promise<number> {
    return this.fileStorage.getUserStorageUsed(userId);
  }

  async getFilesCount(
    userId: string,
    view: string,
    folderId: number
  ): Promise<number> {
    return this.fileStorage.getFilesCount(userId, view, folderId);
  }

  async getFilesByFolderCount(
    userId: string,
    folderId: number | null
  ): Promise<number> {
    return this.fileStorage.getFilesByFolderCount(userId, folderId);
  }

  async getRecentFilesCount(userId: string): Promise<number> {
    return this.fileStorage.getRecentFilesCount(userId);
  }

  async getStarredFilesCount(userId: string): Promise<number> {
    return this.fileStorage.getStarredFilesCount(userId);
  }

  async getTrashedFilesCount(userId: string): Promise<number> {
    return this.fileStorage.getTrashedFilesCount(userId);
  }

  async getSearchFilesCount(userId: string, query: string): Promise<number> {
    return this.fileStorage.getSearchFilesCount(userId, query);
  }
}

export const storage = new DatabaseStorage();
