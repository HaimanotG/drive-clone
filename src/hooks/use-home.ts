import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Folder, File } from "@/shared/schema";
import { PaginationOptions } from "@/lib/storage/types";

const useHome = () => {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);
  const [currentView, setCurrentView] = useState<
    "My Drive" | "Recent" | "Starred" | "Trash"
  >("My Drive");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/auth/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  useEffect(() => {
    setCurrentPage(1);
  }, [currentFolderId, currentView]);

  const { data: folders = [], isLoading: foldersLoading } = useQuery<Folder[]>({
    queryKey: ["/api/folders", currentFolderId],
    enabled: currentView === "My Drive",
    retry: false,
  });

  const {
    data: { files = [], pagination = {} as PaginationOptions } = {},
    isLoading: filesLoading,
  } = useQuery<{
    files: File[];
    pagination: PaginationOptions;
    view: "My Drive" | "Recent" | "Starred" | "Trash";
  }>({
    queryKey: [
      "/api/files",
      currentFolderId,
      currentView,
      currentPage,
      pageSize,
      searchQuery,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (currentView === "My Drive" && currentFolderId) {
        params.append("folderId", currentFolderId.toString());
      }
      params.append("view", currentView);
      params.append("page", currentPage.toString());
      params.append("limit", pageSize.toString());

      if (searchQuery.trim()) {
        params.append("search", searchQuery.trim());
      }

      const response = await fetch(`/api/files?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch files");
      }
      return response.json();
    },
    enabled: isAuthenticated && !isLoading,
    retry: false,
  });

  const createFolderMutation = useMutation({
    mutationFn: async (name: string) => {
      await apiRequest("POST", "/api/folders", {
        name,
        parentId: currentFolderId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/folders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/files"] });
      toast({
        title: "Success",
        description: "Folder created successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/auth/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create folder",
        variant: "destructive",
      });
    },
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when searching
  };

  const clearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return {
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
    searchQuery,
    handleSearch,
    clearSearch,
    handlePageChange,
  };
};

export default useHome;
