import { FC, useState, useCallback } from "react";
import DeviceDetector from "device-detector-js";
import { dumpUserData, updateSignup } from "@components/authMethods";
import { useToast, Text, Checkbox, useDisclosure } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useUser } from "@components/stores";
import UnAuthenticatedPage from "@components/unAuthenticatedPage";
import { LoaderBody, LoaderContainer } from "@components/loader";
import { csrfToken } from "@config/csrfToken.config";
import SubmitButton from "@components/defaults/formButton";
import SharedModal from "@components/modal";

const Signup: FC = () => {
  const setIsLoading = useUser(useCallback((state) => state.setIsLoading, []));
  const setIsOffline = useUser(useCallback((state) => state.setIsOffline, []));

  const { onClose } = useDisclosure();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  const setUser = useUser(useCallback((state) => state.setUser, []));
  const router = useRouter();

  const changeHandler = (e: any) => {
    setRememberMe((prev) => !prev);
  };
  const submitHandler = async () => {
    setIsSubmitting(true);
    const { client, device, os } = new DeviceDetector().parse(
      navigator.userAgent
    );
    const token = router.query._token;
    const { status, statusCode, message } = await updateSignup(
      {
        client: client?.name ?? "unknown",
        device: device?.type ?? "unknown",
        os: os?.name ?? "unknown",
        data: rememberMe,
      },
      decodeURIComponent(token as string)
    );
    if (statusCode === 200 && status && message === "OK") {
      const u = await dumpUserData(csrfToken);
      setUser({
        email: u!.email,
        photo: u!.photo,
        username: u!.username,
        role: u!.role,
      });
      setIsLoading(false);
      setIsOffline(false);
    } else {
      toast({
        status: "info",
        title: "Can't process.",
        description: message,
      });
      setIsSubmitting(false);
    }
  };

  return (
    <UnAuthenticatedPage
      redirectIfOnline="/"
      loader={
        <LoaderContainer>
          <LoaderBody m="auto" />
        </LoaderContainer>
      }
    >
      <SharedModal
        modalTitle="Setting You Up For The First Time"
        toggleProps={{ isOpen: true, onClose: onClose }}
        size="md"
        body={
          <>
            <Checkbox
              spacing="1rem"
              mb="4"
              value={rememberMe.toString()}
              onChange={changeHandler}
              defaultChecked={rememberMe}
            >
              <Text>Remember me</Text>
            </Checkbox>
            <SubmitButton
              mb="5"
              onClick={submitHandler}
              isSubmitting={isSubmitting}
              loadingText="Setting you up!"
            >
              complete Signup Process
            </SubmitButton>
          </>
        }
      />
    </UnAuthenticatedPage>
  );
};

export default Signup;
