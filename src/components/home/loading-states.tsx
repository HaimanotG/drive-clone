interface LoadingStatesProps {
  isLoading: boolean;
  isAuthenticated: boolean;
  children: React.ReactNode;
}

export default function LoadingStates({
  isLoading,
  isAuthenticated,
  children,
}: LoadingStatesProps) {
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}