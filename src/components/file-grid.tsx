import { useDropzone } from "react-dropzone";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import {
  CloudUpload,
  Folder,
  FileText,
  Image as ImageIcon,
  Video,
  MoreVertical,
} from "lucide-react";
import { cn, formatFileSize } from "../lib/utils";
import { File, Folder as FolderType } from "../shared/schema";

interface FileGridProps {
  folders: FolderType[];
  files: File[];
  isLoading: boolean;
  viewMode: "grid" | "list";
  currentView: string;
  onFolderClick: (folder: FolderType) => void;
  onContextMenu: (
    e: React.MouseEvent,
    item: File | FolderType,
    type: "file" | "folder"
  ) => void;
  onUploadClick: () => void;
  onFilePreview?: (file: File) => void;
}

export default function FileGrid({
  folders,
  files,
  isLoading,
  viewMode,
  currentView,
  onFolderClick,
  onContextMenu,
  onUploadClick,
  onFilePreview,
}: FileGridProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      console.log("Files dropped:", acceptedFiles);
      onUploadClick();
    },
    noClick: true,
  });

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return ImageIcon;
    if (mimeType.startsWith("video/")) return Video;
    return FileText;
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString();
  };

  const handleFileClick = (file: File) => {
    if (onFilePreview) {
      onFilePreview(file);
    }
  };

  if (isLoading) {
    return (
      <div
        className={cn(
          viewMode === "grid"
            ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4"
            : "space-y-2"
        )}
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              viewMode === "grid"
                ? "bg-white rounded-lg border border-gray-200 p-4"
                : "bg-white rounded-lg border border-gray-200 p-3 flex items-center space-x-3"
            )}
          >
            <Skeleton
              className={cn(
                viewMode === "grid"
                  ? "w-12 h-12 rounded-lg mx-auto"
                  : "w-8 h-8 rounded"
              )}
            />
            <div
              className={cn(
                viewMode === "grid" ? "mt-3 space-y-2" : "flex-1 space-y-1"
              )}
            >
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const hasContent = folders.length > 0 || files.length > 0;

  return (
    <div {...getRootProps()} className="min-h-full">
      <input {...getInputProps()} />

      {/* Drag and Drop Zone */}
      {(!hasContent || isDragActive) && (
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center mb-6 transition-all duration-200",
            isDragActive
              ? "border-blue-600 bg-blue-50"
              : "border-gray-300 hover:border-blue-600 hover:bg-blue-50"
          )}
        >
          <CloudUpload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {isDragActive ? "Drop files here" : "Drop files here to upload"}
          </h3>
          <p className="text-gray-600">
            Or click to select files from your computer
          </p>
          <Button className="mt-4" onClick={onUploadClick}>
            Select Files
          </Button>
        </div>
      )}

      {hasContent && (
        <div
          className={cn(
            viewMode === "grid"
              ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-4"
              : "space-y-2"
          )}
        >
          {/* Folders */}
          {folders.map((folder) => (
            <div
              key={`folder-${folder.id}`}
              onClick={() => onFolderClick(folder)}
              onContextMenu={(e) => onContextMenu(e, folder, "folder")}
              className={cn(
                "bg-white border border-gray-200 hover:shadow-md transition-shadow duration-200 cursor-pointer group relative",
                viewMode === "grid"
                  ? "rounded-lg p-4"
                  : "rounded-lg p-3 flex items-center space-x-3"
              )}
            >
              {viewMode === "grid" ? (
                <div className="flex flex-col items-center">
                  <Folder className="w-12 h-12 text-blue-500 mb-3 group-hover:text-blue-600" />
                  <span className="text-sm font-medium text-gray-900 text-center truncate w-full">
                    {folder.name}
                  </span>
                  <span className="text-xs text-gray-500">Folder</span>
                </div>
              ) : (
                <>
                  <Folder className="w-8 h-8 text-blue-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {folder.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(folder.createdAt!)}
                    </p>
                  </div>
                </>
              )}

              <div
                className={cn(
                  "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
                  viewMode === "grid"
                    ? "absolute top-2 right-2"
                    : "flex-shrink-0"
                )}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onContextMenu(e, folder, "folder");
                  }}
                >
                  <MoreVertical className="w-4 h-4 text-gray-500" />
                </Button>
              </div>
            </div>
          ))}

          {/* Files */}
          {files.map((file) => {
            const FileIcon = getFileIcon(file.mimeType);
            const isImage = file.mimeType.startsWith("image/");

            return (
              <div
                key={`file-${file.id}`}
                onClick={() => handleFileClick(file)}
                onContextMenu={(e) => onContextMenu(e, file, "file")}
                className={cn(
                  "bg-white border border-gray-200 hover:shadow-md transition-shadow duration-200 cursor-pointer group relative",
                  viewMode === "grid"
                    ? "rounded-lg p-4"
                    : "rounded-lg p-3 flex items-center space-x-3"
                )}
              >
                {viewMode === "grid" ? (
                  <div className="flex flex-col items-center">
                    {isImage ? (
                      <div className="w-12 h-12 rounded-lg overflow-hidden mb-3 bg-gray-100 flex items-center justify-center">
                        <FileIcon className="w-6 h-6 text-gray-600" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-3">
                        <FileIcon className="w-6 h-6 text-red-600" />
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-900 text-center truncate w-full">
                      {file.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="flex-shrink-0">
                      {isImage ? (
                        <div className="w-8 h-8 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
                          <FileIcon className="w-4 h-4 text-gray-600" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center">
                          <FileIcon className="w-4 h-4 text-red-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)} •{" "}
                        {formatDate(file.createdAt!)}
                      </p>
                    </div>
                  </>
                )}

                <div
                  className={cn(
                    "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
                    viewMode === "grid"
                      ? "absolute top-2 right-2"
                      : "flex-shrink-0"
                  )}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onContextMenu(e, file, "file");
                    }}
                  >
                    <MoreVertical className="w-4 h-4 text-gray-500" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!hasContent && !isLoading && (
        <div className="text-center py-12">
          <CloudUpload className="mx-auto h-24 w-24 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {currentView === "My Drive"
              ? "No files yet"
              : `No ${currentView.toLowerCase()} files`}
          </h3>
          <p className="text-gray-600 mb-6">
            {currentView === "My Drive"
              ? "Upload your first files to get started"
              : `No ${currentView.toLowerCase()} files found`}
          </p>
          {currentView === "My Drive" && (
            <Button
              onClick={onUploadClick}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <CloudUpload className="w-5 h-5 mr-2" />
              Upload Files
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
