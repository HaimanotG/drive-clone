"use client";
import { useEffect, useRef } from "react";
import { useToast } from "../hooks/use-toast";
import { Button } from "./ui/button";
import { Edit2, Download, Share2, Star, Trash2 } from "lucide-react";
import { File, Folder } from "../shared/schema";
import useContextMenu from "@/hooks/use-context-menu";

export interface ContextMenuProps {
  x: number;
  y: number;
  item: File | Folder;
  type: "file" | "folder";
  onClose: () => void;
}

export default function ContextMenu({
  x,
  y,
  item,
  type,
  onClose,
}: ContextMenuProps) {
  const { toast } = useToast();
  const { handleDownload, handleRename, starMutation, deleteMutation } =
    useContextMenu({ item, onClose, type });

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleShare = async () => {
    // TODO: Implement sharing functionality
    toast({
      title: "Coming Soon",
      description: "Sharing functionality will be available soon",
    });

    // try {
    //   // Generate shareable link based on item type and ID
    //   const baseUrl = window.location.origin;
    //   const shareUrl = type === "file"
    //     ? `${baseUrl}/shared/file/${item.id}`
    //     : `${baseUrl}/shared/folder/${item.id}`;

    //   // Copy to clipboard
    //   await navigator.clipboard.writeText(shareUrl);

    //   toast({
    //     title: "Link copied!",
    //     description: `Shareable link for "${item.name}" has been copied to your clipboard.`,
    //   });
    // } catch (error) {
    //   const textArea = document.createElement("textarea");
    //   const baseUrl = window.location.origin;
    //   const shareUrl = type === "file"
    //     ? `${baseUrl}/shared/file/${item.id}`
    //     : `${baseUrl}/shared/folder/${item.id}`;

    //   textArea.value = shareUrl;
    //   document.body.appendChild(textArea);
    //   textArea.select();
    //   document.execCommand("copy");
    //   document.body.removeChild(textArea);

    //   toast({
    //     title: "Link copied!",
    //     description: `Shareable link for "${item.name}" has been copied to your clipboard.`,
    //   });
    // }
    onClose();
  };

  const handleStar = () => {
    if (type === "file") {
      starMutation.mutate();
    }
  };

  const handleDelete = () => {
    const confirmMessage = `Are you sure you want to delete this ${type}?`;
    if (window.confirm(confirmMessage)) {
      deleteMutation.mutate();
    } else {
      onClose();
    }
  };

  return (
    <div
      ref={menuRef}
      className="fixed bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50 min-w-40"
      style={{ left: x, top: y }}
    >
      <Button
        variant="ghost"
        className="w-full justify-start px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        onClick={handleRename}
      >
        <Edit2 className="w-4 h-4 mr-3" />
        Rename
      </Button>

      {type === "file" && (
        <>
          <Button
            variant="ghost"
            className="w-full justify-start px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={handleDownload}
          >
            <Download className="w-4 h-4 mr-3" />
            Download
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={handleStar}
          >
            <Star
              className={`w-4 h-4 mr-3 ${
                (item as File).isStarred
                  ? "fill-yellow-400 text-yellow-400"
                  : ""
              }`}
            />
            {(item as File).isStarred ? "Unstar" : "Star"}
          </Button>
        </>
      )}

      <Button
        variant="ghost"
        className="w-full justify-start px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        onClick={handleShare}
      >
        <Share2 className="w-4 h-4 mr-3" />
        Share
      </Button>

      <hr className="my-1" />

      <Button
        variant="ghost"
        className="w-full justify-start px-4 py-2 text-sm text-red-600 hover:bg-red-50"
        onClick={handleDelete}
      >
        <Trash2 className="w-4 h-4 mr-3" />
        Delete
      </Button>
    </div>
  );
}
