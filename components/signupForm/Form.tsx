import {
  Dispatch,
  FC,
  memo,
  SetStateAction,
  useCallback,
  useState,
} from "react";
import { FormikErrors, FormikHelpers, useFormik } from "formik";
import { csrfToken } from "@config/csrfToken.config";
import {
  Stack,
  FormControl,
  FormErrorMessage,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  Link,
  useColorModeValue,
  Alert,
  AlertIcon,
  AlertDescription,
  CloseButton,
  Text,
  Checkbox,
  InputRightElement,
  useMediaQuery,
} from "@chakra-ui/react";
import { IoMdLock, IoMdEye, IoMdEyeOff } from "react-icons/io";
import * as Yup from "yup";
import { IoMdPerson } from "react-icons/io";
import SubmitBotton from "@components/defaults/formButton";
import { SignupFormModel } from "@models/index";
import { signup } from "@components/authMethods";
import DeviceDetector from "device-detector-js";
import { useUser } from "@components/stores";

const SignupForm: FC<{
  setTitle: Dispatch<SetStateAction<string>>;
  setActiveForm: Dispatch<
    SetStateAction<"loginForm" | "passwordForm" | "signupForm">
  >;
}> = ({ setTitle, setActiveForm }) => {
  //
  const at405 = useMediaQuery(["(max-width: 405px)"]);
  //
  const user = useUser(useCallback((state) => state.user, []));
  const setIsLoading = useUser(useCallback((state) => state.setIsLoading, []));
  const setIsOffline = useUser(useCallback((state) => state.setIsOffline, []));
  const setUser = useUser(useCallback((state) => state.setUser, []));
  //
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordHidden, setIsPasswordHidden] = useState(true);
  const [resMessage, setResMessage] = useState<{
    status: "success" | "info" | "warning" | "error";
    message: string;
  } | null>(null);

  const color = useColorModeValue("blue.600", "blue.300");

  type SignupFormInitialValues = Pick<
    SignupFormModel,
    "email" | "password" | "remember" | "confirmPassword"
  >;

  setTitle("Register Account");

  const schema = Yup.object().shape({
    email: Yup.string().required("Email is required").email("Invalid email"),
    password: Yup.string()
      .required("Password is required")
      .min(6, "6 characters long"),
    remember: Yup.boolean(),
  });

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      confirmPassword: "",
      remember: true,
    },
    onSubmit: async (
      values: SignupFormInitialValues,
      actions: FormikHelpers<SignupFormInitialValues>
    ) => {
      setIsSubmitting(true);
      const { email, password, remember } = values;
      const { client, device, os } = new DeviceDetector().parse(
        navigator.userAgent
      );
      const { status, statusCode, message, payload } = await signup({
        email,
        password,
        remember,
        csrftoken: csrfToken,
        client: client?.name ?? "unknown",
        device: device?.type ?? "unknown",
        os: os?.name ?? "unknown",
      });

      if (status && statusCode === 200 && message) {
        const { email, photo, role, username } = payload;
        setUser({ email, photo, role, username });
        setIsLoading(false);
        setIsOffline(false);
        setIsSubmitting(false);
      } else {
        setResMessage({ message, status: "error" });
        setIsSubmitting(false);
      }
    },
    validate: (
      values: SignupFormInitialValues
    ): FormikErrors<SignupFormInitialValues> => {
      const errors: FormikErrors<SignupFormInitialValues> = {};
      if (values.password !== values.confirmPassword) {
        errors.confirmPassword = "Password must match";
        return errors;
      }
      return errors;
    },
    validationSchema: schema,
  });

  return (
    <>
      <form onSubmit={formik.handleSubmit}>
        <Stack spacing="5" borderRadius="lg">
          {resMessage !== null && (
            <Alert
              status={resMessage.status}
              borderRadius={"base"}
              mb={2}
              shadow="base"
            >
              <AlertIcon />
              <CloseButton
                position="absolute"
                right="8px"
                top="8px"
                onClick={() => setResMessage(null)}
              />
              <AlertDescription>{resMessage.message}</AlertDescription>
            </Alert>
          )}
          <FormControl
            id="email"
            isInvalid={
              (formik.errors.email as boolean | undefined) &&
              formik.touched.email
            }
          >
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <IoMdPerson color="lightgray" />
              </InputLeftElement>
              <Input
                name="email"
                onChange={formik.handleChange}
                value={formik.values.email}
                ring={1}
                ringColor="gray.200"
                border={0}
                type="email"
                placeholder="Email"
                focusBorderColor="#2b6cb0"
                autoComplete="true"
                errorBorderColor="pink.500"
              />
            </InputGroup>
            <FormErrorMessage color="pink.500">
              {formik.errors.email}
            </FormErrorMessage>
          </FormControl>

          <FormControl
            id="password"
            isInvalid={
              (formik.errors.password as boolean | undefined) &&
              formik.touched.password
            }
          >
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <IoMdLock color="lightgray" />
              </InputLeftElement>
              <InputRightElement>
                <Button
                  display="flex"
                  variant="unstyled"
                  _focus={{ outlineColor: "none" }}
                  onClick={() => setIsPasswordHidden((prev) => !prev)}
                >
                  {isPasswordHidden ? (
                    <IoMdEyeOff color="#2c528252" />
                  ) : (
                    <IoMdEye color="#2c528252" />
                  )}
                </Button>
              </InputRightElement>
              <Input
                name="password"
                onChange={formik.handleChange}
                value={formik.values.password}
                ring={1}
                ringColor="gray.200"
                border={0}
                type={isPasswordHidden ? "password" : "text"}
                placeholder="Password"
                focusBorderColor="#2b6cb0"
                autoComplete="true"
                errorBorderColor="pink.500"
              />
            </InputGroup>
            <FormErrorMessage color="pink.500">
              {formik.errors.password}
            </FormErrorMessage>
          </FormControl>

          <FormControl
            id="confirmPassword"
            isInvalid={
              (formik.errors.confirmPassword as boolean | undefined) &&
              formik.touched.confirmPassword
            }
          >
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <IoMdLock color="lightgray" />
              </InputLeftElement>
              <Input
                name="confirmPassword"
                onChange={formik.handleChange}
                value={formik.values.confirmPassword}
                ring={1}
                ringColor="gray.200"
                border={0}
                type={isPasswordHidden ? "password" : "text"}
                placeholder="Confirm Password"
                focusBorderColor="#2b6cb0"
                autoComplete="true"
                errorBorderColor="pink.500"
              />
            </InputGroup>
            <FormErrorMessage color="pink.500">
              {formik.errors.confirmPassword}
            </FormErrorMessage>
          </FormControl>

          <FormControl id="remember" w="max-content">
            <Checkbox
              defaultIsChecked
              name="remember"
              onChange={formik.handleChange}
              checked={formik.values.remember}
            >
              <Text color={color} fontSize="sm">
                Remember me
              </Text>
            </Checkbox>
          </FormControl>

          <SubmitBotton
            isSubmitting={isSubmitting}
            loadingText="Sending Verification Link"
          >
            Send Verification Link
          </SubmitBotton>

          <Link
            color={color}
            textAlign="center"
            onClick={() => setActiveForm("loginForm")}
            fontSize="sm"
          >
            Return to login
          </Link>
        </Stack>
      </form>
    </>
  );
};

export default memo(SignupForm);
