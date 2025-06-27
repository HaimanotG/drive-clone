import { useState, useRef, useEffect } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { CloudUpload, Search, Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface HeaderProps {
  onSearch: (query: string) => void;
  onMobileMenuToggle?: () => void;
  searchQuery?: string;
  onClearSearch?: () => void;
}

export default function Header({
  onSearch,
  onMobileMenuToggle,
  searchQuery: externalSearchQuery = "",
  onClearSearch,
}: HeaderProps) {
  const { user, signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState(externalSearchQuery);
  const [isFocused, setIsFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Sync internal state with external search query
  useEffect(() => {
    setSearchQuery(externalSearchQuery);
  }, [externalSearchQuery]);

  // Keyboard shortcut for search (Ctrl/Cmd + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === "Escape" && isFocused) {
        searchInputRef.current?.blur();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isFocused]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    onClearSearch?.();
    searchInputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    // If user clears the input, automatically clear search
    if (value === "" && externalSearchQuery !== "") {
      onClearSearch?.();
    }
  };

  const handleLogout = () => {
    signOut();
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-4">
          {onMobileMenuToggle && (
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={onMobileMenuToggle}
            >
              <Menu className="w-6 h-6" />
            </Button>
          )}

          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
              <CloudUpload className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900 hidden sm:block">
              Drive Clone
            </h1>
          </div>
        </div>

        {/* Enhanced Search Bar */}
        <div className="flex-1 max-w-2xl mx-4">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="Search in Drive (⌘K)"
              value={searchQuery}
              onChange={handleInputChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className={`w-full pl-10 pr-12 py-2 bg-gray-100 border-0 rounded-full focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all duration-200 ${
                isFocused || searchQuery ? "bg-white ring-2 ring-blue-600" : ""
              }`}
            />

            {/* Clear Search Button */}
            {searchQuery && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClearSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-200 rounded-full"
              >
                <X className="w-4 h-4 text-gray-500" />
              </Button>
            )}

            {/* Search Status Indicator */}
            {externalSearchQuery && (
              <div className="absolute -bottom-6 left-0 text-xs text-blue-600 font-medium">
                Searching for &quot;{externalSearchQuery}&quot;
              </div>
            )}
          </form>
        </div>

        {/* User Menu */}
        <div className="flex items-center space-x-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={user?.image || ""}
                    alt={user?.name || "User"}
                  />
                  <AvatarFallback>
                    {user?.name?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuItem className="flex flex-col items-start">
                <div className="font-medium">{user?.name}</div>
                <div className="text-sm text-gray-500">{user?.email}</div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
