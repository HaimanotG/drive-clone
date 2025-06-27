import { Button } from "@/components/ui/button";
import { Plus, Upload, Grid3X3, List } from "lucide-react";
import { ViewMode } from "./types";

interface ToolbarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onCreateFolderClick: () => void;
  onUploadClick: () => void;
  isCreatingFolder: boolean;
}

export default function Toolbar({
  viewMode,
  onViewModeChange,
  onCreateFolderClick,
  onUploadClick,
  isCreatingFolder,
}: ToolbarProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            onClick={onCreateFolderClick}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isCreatingFolder}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Folder
          </Button>

          <Button variant="outline" onClick={onUploadClick}>
            <Upload className="w-4 h-4 mr-2" />
            Upload Files
          </Button>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => onViewModeChange("grid")}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => onViewModeChange("list")}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}