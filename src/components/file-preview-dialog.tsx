import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import {
  Download,
  FileText,
  Image as ImageIcon,
  Video,
  X,
  ExternalLink,
} from "lucide-react";
import { formatFileSize } from "../lib/utils";
import { File } from "../shared/schema";
import Image from "next/image";

interface FilePreviewDialogProps {
  file: File | null;
  open: boolean;
  onClose: () => void;
}

export default function FilePreviewDialog({
  file,
  open,
  onClose,
}: FilePreviewDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && file) {
      setLoading(true);
      setError(null);
      // Reset loading state after a brief moment for better UX
      const timer = setTimeout(() => setLoading(false), 500);
      return () => clearTimeout(timer);
    }
  }, [open, file]);

  if (!file) return null;

  const isImage = file.mimeType.startsWith("image/");
  const isPDF = file.mimeType === "application/pdf";
  const isVideo = file.mimeType.startsWith("video/");
  const previewUrl = `/api/files/preview/${file.id}`;
  const downloadUrl = `/api/files/download/${file.id}`;

  const getFileIcon = () => {
    if (isImage) return ImageIcon;
    if (isVideo) return Video;
    return FileText;
  };

  const FileIcon = getFileIcon();

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderPreviewContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-96">
          <Skeleton className="w-full h-full rounded-lg" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-96 text-gray-500">
          <FileIcon className="w-16 h-16 mb-4" />
          <p className="text-sm">{error}</p>
        </div>
      );
    }

    if (isImage) {
      return (
        <div className="flex items-center justify-center bg-gray-50 rounded-lg p-4">
          <Image
            src={previewUrl}
            alt={file.name}
            fill
            className="max-w-full max-h-96 object-contain rounded-lg shadow-sm"
            onError={() => setError("Failed to load image")}
          />
        </div>
      );
    }

    if (isPDF) {
      return (
        <div className="bg-gray-50 rounded-lg p-4">
          <iframe
            src={previewUrl}
            className="w-full h-96 border-0 rounded-lg"
            title={file.name}
            onError={() => setError("Failed to load PDF")}
          />
        </div>
      );
    }

    // For other file types, show file info
    return (
      <div className="flex flex-col items-center justify-center h-96 text-gray-500">
        <div className="w-20 h-20 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
          <FileIcon className="w-10 h-10 text-blue-600" />
        </div>
        <p className="text-sm text-center mb-2">
          Preview not available for this file type
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(downloadUrl, "_blank")}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Open in new tab
        </Button>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex-1 min-w-0">
            <DialogTitle className="text-lg font-semibold truncate">
              {file.name}
            </DialogTitle>
            <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
              <span>{formatFileSize(file.size)}</span>
              <span>•</span>
              <span>{formatDate(file.createdAt!)}</span>
              <span>•</span>
              <span className="capitalize">
                {file.mimeType.split("/")[0]} file
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(downloadUrl, "_blank")}
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="overflow-auto">{renderPreviewContent()}</div>
      </DialogContent>
    </Dialog>
  );
}
