import { authClient } from "@/lib/auth-client";

export function useAuth() {
  const { data: session, isPending, error, refetch } = authClient.useSession();

  return {
    user: session?.user,
    isLoading: isPending,
    isAuthenticated: !!session?.user,
    error,
    refetch,
    signOut: async () => await authClient.signOut(),
  };
}
