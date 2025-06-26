import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import type { File, Folder } from "@/shared/schema";
import { ContextMenuProps } from "@/components/context-menu";

type UseContextMenuProps = Pick<
  ContextMenuProps,
  "item" | "onClose" | "type"
> & {
  item: File | Folder;
};

const useContextMenu = ({ item, type, onClose }: UseContextMenuProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const renameMutation = useMutation({
    mutationFn: async (newName: string) => {
      const endpoint =
        type === "file" ? `/api/files/${item.id}` : `/api/folders/${item.id}`;
      await apiRequest("PUT", endpoint, { name: newName });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/files"] });
      queryClient.invalidateQueries({ queryKey: ["/api/folders"] });
      toast({
        title: "Success",
        description: `${
          type === "file" ? "File" : "Folder"
        } renamed successfully`,
      });
      onClose();
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
        description: `Failed to rename ${type}`,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const endpoint =
        type === "file" ? `/api/files/${item.id}` : `/api/folders/${item.id}`;
      await apiRequest("DELETE", endpoint);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/files"] });
      queryClient.invalidateQueries({ queryKey: ["/api/folders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Success",
        description: `${
          type === "file" ? "File" : "Folder"
        } deleted successfully`,
      });
      onClose();
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
        description: `Failed to delete ${type}`,
        variant: "destructive",
      });
    },
  });

  const starMutation = useMutation({
    mutationFn: async () => {
      const file = item as File;
      await apiRequest("PUT", `/api/files/${file.id}`, {
        isStarred: !file.isStarred,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/files"] });
      toast({
        title: "Success",
        description: `File ${
          (item as File).isStarred ? "unstarred" : "starred"
        }`,
      });
      onClose();
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
        description: "Failed to update file",
        variant: "destructive",
      });
    },
  });

  const handleRename = () => {
    const newName = prompt(`Enter new ${type} name:`, item.name);
    if (newName?.trim() && newName.trim() !== item.name) {
      renameMutation.mutate(newName.trim());
    } else {
      onClose();
    }
  };

  const handleDownload = () => {
    if (type === "file") {
      window.open(`/api/files/download/${item.id}`, "_blank");
    }
    onClose();
  };

  return {
    handleDownload,
    handleRename,
    starMutation,
    renameMutation,
    deleteMutation,
  };
};

export default useContextMenu;
