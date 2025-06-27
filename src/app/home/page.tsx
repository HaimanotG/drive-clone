"use client";
import { useState } from "react";
import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import FileGrid from "@/components/file-grid";
import UploadModal from "@/components/upload-modal";
import ContextMenu from "@/components/context-menu";
import CreateFolderDialog from "@/components/create-folder-dialog";
import FilePreviewDialog from "@/components/file-preview-dialog";
import BreadcrumbNavigation from "@/components/home/breadcrumb-navigation";
import Toolbar from "@/components/home/toolbar";
import FilePagination from "@/components/home/file-pagination";
import LoadingStates from "@/components/home/loading-states";
import { File, Folder } from "@/shared/schema";
import useHome from "@/hooks/use-home";
import { ContextMenuState, ViewMode } from "@/components/home/types";

export default function Home() {
  const {
    setCurrentFolderId,
    createFolderMutation,
    folders,
    foldersLoading,
    files,
    filesLoading,
    pagination,
    setCurrentView,
    isLoading,
    isAuthenticated,
    currentFolderId,
    currentView,
    currentPage,
    handlePageChange,
    searchQuery,
    handleSearch,
    clearSearch,
  } = useHome();

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [createFolderDialogOpen, setCreateFolderDialogOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);

  const handleCreateFolder = (name: string) => {
    createFolderMutation.mutate(name);
  };

  const handleFolderClick = (folder: Folder) => {
    setCurrentFolderId(folder.id);
  };

  const handleBreadcrumbClick = (folderId: number | null) => {
    if (folderId) {
      setCurrentFolderId(folderId);
    }
  };

  const handleFilePreview = (file: File) => {
    setPreviewFile(file);
    setPreviewDialogOpen(true);
  };

  const handleClosePreview = () => {
    setPreviewDialogOpen(false);
    setPreviewFile(null);
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

  return (
    <LoadingStates isLoading={isLoading} isAuthenticated={isAuthenticated}>
      <div className="flex h-screen bg-gray-50">
        <div className="flex h-[calc(100vh-4rem)]">
          <Sidebar
            currentView={currentView}
            onViewChange={setCurrentView}
            onNewClick={() => setUploadModalOpen(true)}
          />

          <main className="flex-1 overflow-hidden flex flex-col">
            <Header
              onSearch={handleSearch}
              searchQuery={searchQuery}
              onClearSearch={clearSearch}
            />
            <BreadcrumbNavigation
              currentView={currentView}
              currentFolderId={currentFolderId}
              onBreadcrumbClick={handleBreadcrumbClick}
            />

            <Toolbar
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onCreateFolderClick={() => setCreateFolderDialogOpen(true)}
              onUploadClick={() => setUploadModalOpen(true)}
              isCreatingFolder={createFolderMutation.isPending}
            />

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
                onFilePreview={handleFilePreview}
              />
            </div>

            <FilePagination
              pagination={pagination}
              currentPage={currentPage}
              onPageChange={handlePageChange}
            />
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

        <FilePreviewDialog
          file={previewFile}
          open={previewDialogOpen}
          onClose={handleClosePreview}
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
    </LoadingStates>
  );
}
