"use client";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../hooks/use-toast";
import { isUnauthorizedError } from "../lib/authUtils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { CloudUpload, X, CheckCircle, AlertCircle } from "lucide-react";
import { cn, formatFileSize } from "../lib/utils";

interface UploadModalProps {
  open: boolean;
  onClose: () => void;
  currentFolderId: number | null;
}

interface UploadFile {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "completed" | "error";
  error?: string;
}

export default function UploadModal({
  open,
  onClose,
  currentFolderId,
}: UploadModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);

  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });
      if (currentFolderId) {
        formData.append("folderId", currentFolderId.toString());
      }

      const response = await fetch("/api/files", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`${response.status}: ${text}`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/files"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Success",
        description: "Files uploaded successfully",
      });
      setUploadFiles([]);
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
        description: "Failed to upload files",
        variant: "destructive",
      });
    },
  });

  const onDrop = (acceptedFiles: File[]) => {
    const newUploadFiles = acceptedFiles.map((file) => ({
      file,
      progress: 0,
      status: "pending" as const,
    }));
    setUploadFiles(newUploadFiles);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
  });

  const handleUpload = () => {
    if (uploadFiles.length === 0) return;

    const filesToUpload = uploadFiles.map((uf) => uf.file);
    uploadMutation.mutate(filesToUpload);
  };

  const handleRemoveFile = (index: number) => {
    setUploadFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClose = () => {
    if (!uploadMutation.isPending) {
      setUploadFiles([]);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
              isDragActive
                ? "border-blue-600 bg-blue-50"
                : "border-gray-300 hover:border-blue-600 hover:bg-blue-50"
            )}
          >
            <input {...getInputProps()} />
            <CloudUpload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">
              {isDragActive
                ? "Drop files here..."
                : "Drag and drop files here, or click to select"}
            </p>
          </div>

          {/* File List */}
          {uploadFiles.length > 0 && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {uploadFiles.map((uploadFile, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-shrink-0">
                    {uploadFile.status === "completed" ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : uploadFile.status === "error" ? (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    ) : (
                      <div className="w-5 h-5 bg-blue-100 rounded flex items-center justify-center">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate overflow-hidden">
                      {uploadFile.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(uploadFile.file.size)}
                    </p>

                    {uploadFile.status === "uploading" && (
                      <Progress
                        value={uploadFile.progress}
                        className="mt-1 h-1"
                      />
                    )}

                    {uploadFile.status === "error" && uploadFile.error && (
                      <p className="text-xs text-red-600 mt-1">
                        {uploadFile.error}
                      </p>
                    )}
                  </div>

                  {!uploadMutation.isPending && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFile(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={uploadMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={uploadFiles.length === 0 || uploadMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {uploadMutation.isPending ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
