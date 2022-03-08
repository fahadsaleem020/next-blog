import { FC, useEffect, useCallback } from "react";
import { useUser } from "@components/stores";
import { csrfToken } from "@config/csrfToken.config";
import { updateSession, dumpUserData, dumpAdminData } from "./authMethods";
import { useRouter } from "next/router";

const UpdateUser: FC = ({ children }) => {
  const router = useRouter();
  const setIsLoading = useUser(useCallback((state) => state.setIsLoading, []));
  const setIsOffline = useUser(useCallback((state) => state.setIsOffline, []));
  const setUser = useUser(useCallback((state) => state.setUser, []));

  useEffect(() => {
    const isAdminPage = router.asPath.includes("/admin");
    if (isAdminPage) {
      callAdminPersistence();
    } else {
      callUserPersistence();
    }
  }, [setIsLoading, setIsOffline, setUser]);

  const callUserPersistence = async () => {
    const dumpUser = await dumpUserData(csrfToken);
    if (dumpUser) {
      const { email, photo, role, username } = dumpUser;
      setUser({ email, photo, role, username });
      setIsLoading(false);
      setIsOffline(false);
      callUpdateSession();
    } else {
      setIsLoading(true);
      setIsOffline(true);
    }
  };
  const callAdminPersistence = async () => {
    const dumpAdmin = await dumpAdminData(csrfToken);
    if (dumpAdmin) {
      const { email, photo, role, username } = dumpAdmin;
      setUser({ email, photo, role, username });
      setIsLoading(false);
      setIsOffline(false);
      callUpdateSession();
    } else {
      const isAdminLoginPage = router.asPath.includes("adminFormStepper");
      setIsOffline(true);
      if (!isAdminLoginPage) {
        return (window.location.href = "/");
      }
    }
  };
  const callUpdateSession = async () => {
    const { status, statusCode } = await updateSession(csrfToken);
    if (!status && statusCode === 401) {
      setIsLoading(true);
      setIsOffline(true);
    }
  };

  return <>{children}</>;
};

export default UpdateUser;
