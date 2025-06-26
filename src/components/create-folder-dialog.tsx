import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Folder } from "lucide-react";

interface CreateFolderDialogProps {
  open: boolean;
  onClose: () => void;
  onCreateFolder: (name: string) => void;
  isCreating?: boolean;
}

export default function CreateFolderDialog({
  open,
  onClose,
  onCreateFolder,
  isCreating = false,
}: CreateFolderDialogProps) {
  const [folderName, setFolderName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = folderName.trim();
    if (!trimmedName) {
      setError("Folder name is required");
      return;
    }

    if (trimmedName.length > 255) {
      setError("Folder name must be less than 255 characters");
      return;
    }

    // Check for invalid characters
    const invalidChars = /[<>:"/\\|?*]/;
    if (invalidChars.test(trimmedName)) {
      setError("Folder name contains invalid characters");
      return;
    }

    setError("");
    onCreateFolder(trimmedName);
    handleClose();
  };

  const handleClose = () => {
    setFolderName("");
    setError("");
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" onKeyDown={handleKeyDown}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Folder className="w-5 h-5 text-blue-600" />
            Create New Folder
          </DialogTitle>
          <DialogDescription>
            Enter a name for your new folder. The folder will be created in the
            current location.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="folder-name">Folder Name</Label>
            <Input
              id="folder-name"
              value={folderName}
              onChange={(e) => {
                setFolderName(e.target.value);
                if (error) setError("");
              }}
              placeholder="Enter folder name..."
              autoFocus
              disabled={isCreating}
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isCreating || !folderName.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isCreating ? "Creating..." : "Create Folder"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
