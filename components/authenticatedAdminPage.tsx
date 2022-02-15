import { FC, ReactNode } from "react";
import { useUser } from "@components/stores";
import { useEffect, useCallback } from "react";
import { useRouter } from "next/router";

const AuthenticatedAdminPage: FC<{
  redirectIfOffline: string;
  loader: ReactNode;
}> = ({ children, redirectIfOffline, loader }) => {
  //
  const isLoading = useUser(useCallback((state) => state.isLoading, []));
  const isOffline = useUser(useCallback((state) => state.isOffline, []));
  const user = useUser(useCallback((state) => state.user, []));
  const router = useRouter();

  useEffect(() => {
    user?.role === "client" ? router.replace("/") : null;
    isOffline ? router.replace(redirectIfOffline) : null;
  });

  return !isOffline && !isLoading && user?.role === "admin" ? (
    <>{children}</>
  ) : (
    <div>{loader}</div>
  );
};

export default AuthenticatedAdminPage;
