import { FC } from "react";
import { setSession, dumpUserData } from "@components/authMethods";
import { csrfToken } from "@config/csrfToken.config";
import { useRouter } from "next/router";
import { useUser } from "@components/stores";
import UnAuthenticatedPage from "@components/unAuthenticatedPage";
import DeviceDetector from "device-detector-js";
import { LoaderBody, LoaderContainer } from "@components/loader";

const SetSessionPage: FC = () => {
  //
  const setIsLoading = useUser((state) => state.setIsLoading);
  const setIsOffline = useUser((state) => state.setIsOffline);
  const setUser = useUser((state) => state.setUser);
  //
  const router = useRouter();

  async function setSessionFun() {
    if (typeof window !== "undefined") {
      const token = router.query._token;
      const { client, device, os } = new DeviceDetector().parse(
        navigator.userAgent
      );
      const { status, statusCode, message } = await setSession(
        decodeURIComponent(token as string),
        {
          client: client?.name ?? "unknown",
          device: device?.type ?? "unknown",
          os: os?.name ?? "unknown",
        }
      );
      if (statusCode === 200 && status && message === "OK") {
        const u = await dumpUserData(csrfToken)!;

        setUser({
          email: u!.email,
          photo: u!.photo,
          username: u!.username,
          role: u!.role,
        });
        // testing
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
        setIsOffline(false);
      }
    }
  }

  setSessionFun();

  return (
    <UnAuthenticatedPage
      redirectIfOnline="/"
      loader={
        <LoaderContainer>
          <LoaderBody m="auto" />
        </LoaderContainer>
      }
    >
      <LoaderContainer>
        <LoaderBody m="auto" />
      </LoaderContainer>
    </UnAuthenticatedPage>
  );
};

export default SetSessionPage;
function DetailedHTMLProps<T>() {
  throw new Error("Function not implemented.");
}
