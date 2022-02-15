import { FC, ReactNode } from "react";
import { useUser } from "@components/stores";
import { useEffect, useCallback } from "react";
import { useRouter } from "next/router";

const AuthenticatedPage: FC<{
  redirectIfOffline: string;
  loader: ReactNode;
}> = ({ children, redirectIfOffline, loader }) => {
  //
  const isLoading = useUser(useCallback((state) => state.isLoading, []));
  const isOffline = useUser(useCallback((state) => state.isOffline, []));
  const router = useRouter();

  useEffect(() => {
    isOffline ? router.replace(redirectIfOffline) : null;
  });

  return !isOffline && !isLoading ? <>{children}</> : <div>{loader}</div>;
};

export default AuthenticatedPage;
