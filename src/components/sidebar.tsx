import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { CloudUpload, Clock, Star, Trash2, Plus } from "lucide-react";
import { cn } from "../lib/utils";
import { useQuery } from "@tanstack/react-query";

interface SidebarProps {
  currentView: "My Drive" | "Recent" | "Starred" | "Trash";
  onViewChange: (view: "My Drive" | "Recent" | "Starred" | "Trash") => void;
  onNewClick: () => void;
}

export default function Sidebar({
  currentView,
  onViewChange,
  onNewClick,
}: SidebarProps) {
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const { data: userData } = useQuery({
    queryKey: ["/api/user"],
    queryFn: () => fetch("/api/user").then((res) => res.json()),
  });

  const storageUsed = userData?.storageUsed || 0;
  const storageTotal = userData?.storageTotal || 10 * 1024 * 1024 * 1024;
  const storagePercentage = (storageUsed / storageTotal) * 100;

  const menuItems = [
    {
      id: "My Drive" as const,
      label: "My Drive",
      icon: CloudUpload,
      active: currentView === "My Drive",
    },
    {
      id: "Recent" as const,
      label: "Recent",
      icon: Clock,
      active: currentView === "Recent",
    },
    {
      id: "Starred" as const,
      label: "Starred",
      icon: Star,
      active: currentView === "Starred",
    },
    {
      id: "Trash" as const,
      label: "Trash",
      icon: Trash2,
      active: currentView === "Trash",
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 hidden lg:block">
      <div className="p-4">
        <Button
          onClick={onNewClick}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-5 h-5 mr-3" />
          New
        </Button>
      </div>

      <nav className="px-4 pb-4">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onViewChange(item.id)}
                className={cn(
                  "w-full flex items-center space-x-3 px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-200",
                  item.active && "bg-gray-100"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-8 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Storage</span>
            <span className="text-sm text-gray-900 font-medium">
              {formatBytes(storageUsed)}
            </span>
          </div>
          <Progress value={storagePercentage} className="h-2" />
          <p className="text-xs text-gray-500 mt-1">
            {formatBytes(storageUsed)} of {formatBytes(storageTotal)} used
          </p>
        </div>
      </nav>
    </aside>
  );
}
