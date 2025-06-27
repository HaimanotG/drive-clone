import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface BreadcrumbNavigationProps {
  currentView: string;
  currentFolderId: number | null;
  onBreadcrumbClick: (folderId: number | null) => void;
}

export default function BreadcrumbNavigation({
  currentView,
  currentFolderId,
  onBreadcrumbClick,
}: BreadcrumbNavigationProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              href="#"
              onClick={() => onBreadcrumbClick(null)}
              className="text-blue-600 hover:underline"
            >
              {currentView}
            </BreadcrumbLink>
          </BreadcrumbItem>
          {currentFolderId && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <span className="text-gray-600">Current Folder</span>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}