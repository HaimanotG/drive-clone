import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Folder, File } from "@/shared/schema";

const useHome = () => {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);
  const [currentView, setCurrentView] = useState<
    "My Drive" | "Recent" | "Starred" | "Trash"
  >("My Drive");

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

  const { data: folders = [], isLoading: foldersLoading } = useQuery<Folder[]>({
    queryKey: ["/api/folders", currentFolderId],
    enabled: currentView === "My Drive",
    retry: false,
  });

  const { data: files = [], isLoading: filesLoading } = useQuery<File[]>({
    queryKey: ["/api/files", currentFolderId, currentView],
    enabled: true,
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

  return {
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
  };
};

export default useHome;
