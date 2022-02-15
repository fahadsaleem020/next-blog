import { FC, ReactNode, useCallback } from "react";
import { useUser } from "@components/stores";
import { useEffect } from "react";
import { useRouter } from "next/router";

const UnAuthenticatedPage: FC<{
  redirectIfOnline: string;
  loader: ReactNode;
}> = ({ children, redirectIfOnline, loader }) => {
  const isLoading = useUser(useCallback((state) => state.isLoading, []));
  const isOffline = useUser(useCallback((state) => state.isOffline, []));

  const router = useRouter();

  useEffect(() => {
    !isOffline && !isLoading ? router.replace(redirectIfOnline) : null;
  });

  return isOffline && isLoading ? <>{children}</> : <div>{loader}</div>;
};

export default UnAuthenticatedPage;
