"use client";
import { useState } from "react";
import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import FileGrid from "@/components/file-grid";
import UploadModal from "@/components/upload-modal";
import ContextMenu from "@/components/context-menu";
import CreateFolderDialog from "@/components/create-folder-dialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Grid3X3, List } from "lucide-react";
import { File, Folder } from "@/shared/schema";
import useHome from "@/hooks/use-home";

export default function Home() {
  const {
    setCurrentFolderId,
    createFolderMutation,
    folders,
    foldersLoading,
    files,
    filesLoading,
    setCurrentView,
    isLoading,
    isAuthenticated,
    currentFolderId,
    currentView,
  } = useHome();

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [createFolderDialogOpen, setCreateFolderDialogOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    item: File | Folder;
    type: "file" | "folder";
  } | null>(null);

  const handleCreateFolder = (name: string) => {
    createFolderMutation.mutate(name);
  };

  const handleFolderClick = (folder: Folder) => {
    setCurrentFolderId(folder.id);
  };

  const handleBreadcrumbClick = (folderId: number | null) => {
    setCurrentFolderId(folderId);
  };

  const handleContextMenu = (
    e: React.MouseEvent,
    item: File | Folder,
    type: "file" | "folder"
  ) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      item,
      type,
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onSearch={() => {}} />

      <div className="flex h-[calc(100vh-4rem)]">
        <Sidebar
          currentView={currentView}
          onViewChange={setCurrentView}
          onNewClick={() => setUploadModalOpen(true)}
        />

        <main className="flex-1 overflow-hidden">
          {/* Breadcrumb */}
          <div className="bg-white border-b border-gray-200 px-6 py-3">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink
                    href="#"
                    onClick={() => handleBreadcrumbClick(null)}
                    className="text-blue-600 hover:underline"
                  >
                    {currentView}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {currentFolderId && (
                  <>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <span className="text-gray-600">Current Folder</span>
                    </BreadcrumbItem>
                  </>
                )}
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Toolbar */}
          <div className="bg-white border-b border-gray-200 px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  onClick={() => setCreateFolderDialogOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={createFolderMutation.isPending}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Folder
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setUploadModalOpen(true)}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Files
                </Button>
              </div>

              <div className="flex items-center space-x-3">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* File Browser Area */}
          <div className="flex-1 overflow-auto p-6">
            <FileGrid
              folders={folders}
              files={files}
              isLoading={foldersLoading || filesLoading}
              viewMode={viewMode}
              currentView={currentView}
              onFolderClick={handleFolderClick}
              onContextMenu={handleContextMenu}
              onUploadClick={() => setUploadModalOpen(true)}
            />
          </div>
        </main>
      </div>

      <UploadModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        currentFolderId={currentFolderId}
      />

      <CreateFolderDialog
        open={createFolderDialogOpen}
        onClose={() => setCreateFolderDialogOpen(false)}
        onCreateFolder={handleCreateFolder}
        isCreating={createFolderMutation.isPending}
      />

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          item={contextMenu.item}
          type={contextMenu.type}
          onClose={handleCloseContextMenu}
        />
      )}
    </div>
  );
}
