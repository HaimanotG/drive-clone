import { File, Folder } from "@/shared/schema";

export interface ContextMenuState {
  x: number;
  y: number;
  item: File | Folder;
  type: "file" | "folder";
}

export type ViewMode = "grid" | "list";
