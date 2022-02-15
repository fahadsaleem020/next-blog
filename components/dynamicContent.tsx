import { FC, ReactNode, useCallback } from "react";
import { useUser } from "@components/stores";

const DynamicContent: FC<{
  offlineContent: ReactNode;
  OnlineContent: ReactNode;
  loader: ReactNode;
}> = ({ offlineContent, OnlineContent, loader }) => {
  const isLoading = useUser(useCallback((state) => state.isLoading, []));
  const isOffline = useUser(useCallback((state) => state.isOffline, []));

  if (!isOffline && !isLoading) return <>{OnlineContent}</>;
  else if (isOffline && isLoading) return <>{offlineContent}</>;
  else return <>{loader}</>;
};

export default DynamicContent;
