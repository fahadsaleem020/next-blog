import {
  Dispatch,
  FC,
  memo,
  SetStateAction,
  useCallback,
  useState,
} from "react";
import {
  TextField,
  PasswordField,
  CheckBox,
  SubmitButton,
} from "@components/loginForm/Elements";
import DeviceDetector from "device-detector-js";
import {
  Formik,
  Field,
  Form,
  FieldProps,
  FormikHelpers,
  FormikProps,
} from "formik";
import * as Yup from "yup";
import { LoginFormModel } from "@models/index";
import {
  Link,
  Flex,
  Stack,
  useToast,
  useColorModeValue,
  useMediaQuery,
  HStack,
  Button,
} from "@chakra-ui/react";
import { signin, adminSignin } from "@components/authMethods";
import { useUser } from "@components/stores";
import { useRouter } from "next/router";
import { FcGoogle } from "react-icons/fc";
import NLink from "next/link";
const SigninForm: FC<{
  setTitle: Dispatch<SetStateAction<string>>;
  setActiveForm: Dispatch<SetStateAction<"loginForm" | "passwordForm">>;
  type: "admin" | "client";
}> = ({ setTitle, setActiveForm, type }) => {
  //
  const router = useRouter();
  const at405 = useMediaQuery(["(max-width: 405px)"]);
  const color = useColorModeValue("blue.600", "blue.300");
  setTitle("Sign in");
  const toast = useToast();
  //
  const [isSubmitting, setIsSubmitting] = useState(false);
  const setIsLoading = useUser(useCallback((state) => state.setIsLoading, []));
  const setIsOffline = useUser(useCallback((state) => state.setIsOffline, []));
  const setUser = useUser(useCallback((state) => state.setUser, []));
  const user = useUser(useCallback((state) => state.user, []));
  //
  const schema = Yup.object().shape({
    email: Yup.string().required("Email is required").email("Invalid email"),
    password: Yup.string().required("Password is required"),
  });

  const initialFormValues: Partial<LoginFormModel> = {
    email: "",
    password: "",
    remember: true,
  };

  const formHandler = async (
    values: LoginFormModel,
    actions: FormikHelpers<LoginFormModel>
  ) => {
    setIsSubmitting(true);
    const { client, device, os } = new DeviceDetector().parse(
      navigator.userAgent
    );
    const { message, status, statusCode, payload } =
      type === "admin"
        ? await adminSignin(values, {
            client: client?.name ?? "unknown",
            device: device?.type ?? "unknown",
            os: os?.name ?? "unknown",
          })
        : await signin(values, {
            client: client?.name ?? "unknown",
            device: device?.type ?? "unknown",
            os: os?.name ?? "unknown",
          });

    if (status && statusCode === 200 && message === "OK") {
      const { email, photo, role, username } = payload;
      setUser({ email, photo, role, username });
      setIsLoading(false);
      setIsOffline(false);
      setIsSubmitting(false);
      toast({
        description: message,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      if (user?.role === "admin") router.replace("/admin");
    } else {
      setIsSubmitting(false);
      toast({
        description: message,
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <>
      <Formik
        initialValues={initialFormValues as Required<LoginFormModel>}
        onSubmit={formHandler}
        validationSchema={schema}
      >
        {(form: FormikProps<Required<LoginFormModel>> | any) => (
          <Form>
            <Stack spacing="5" borderRadius="lg">
              <Field name="email">
                {(field: FieldProps) => (
                  <TextField Field={field} props={form} />
                )}
              </Field>

              <Field name="password">
                {(field: FieldProps) => (
                  <PasswordField Field={field} props={form} />
                )}
              </Field>

              <Field name="remember">
                {(field: FieldProps) => (
                  <>
                    <Flex>
                      <CheckBox Field={field} props={form} />
                      <Link
                        color={color}
                        wordBreak="keep-all"
                        ml="auto"
                        onClick={() => setActiveForm("passwordForm")}
                      >
                        Forgot Password?
                      </Link>
                    </Flex>
                  </>
                )}
              </Field>
              <SubmitButton submiting={isSubmitting} />
              <NLink href={"/api/google"}>
                <HStack
                  flexWrap={at405[0] && ("wrap" as any)}
                  spacing={at405[0] ? 0 : "auto"}
                >
                  <Button
                    colorScheme={"blue"}
                    leftIcon={<FcGoogle size={22} />}
                    variant="outline"
                    // rounded="full"
                    w="full"
                    _focus={{ outline: "none" }}
                  >
                    Continue with Google
                  </Button>
                </HStack>
              </NLink>
            </Stack>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default memo(SigninForm);
