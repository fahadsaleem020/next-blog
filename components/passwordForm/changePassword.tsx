import { memo, useState } from "react";
import {
  Formik,
  Field,
  Form,
  FieldProps,
  FormikHelpers,
  FormikErrors,
} from "formik";
import {
  Stack,
  FormControl,
  FormErrorMessage,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  Alert,
  AlertIcon,
  AlertDescription,
  CloseButton,
  InputRightElement,
  useToast,
  Link,
  useColorModeValue,
} from "@chakra-ui/react";
import { IoMdLock, IoMdEye, IoMdEyeOff } from "react-icons/io";
import { useRouter } from "next/router";
import { changePassword } from "@components/authMethods";
import { GenericModel } from "@models/index";

const PasswordForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resMessage, setResMessage] = useState<string | null>(null);
  const [isPasswordHidden, setIsPasswordHidden] = useState(true);
  const color = useColorModeValue("blue.600", "blue.300");
  const toast = useToast();

  const router = useRouter();
  interface InitialForm {
    password: string;
    confirmPassword: string;
  }

  const initialFormValues: GenericModel<InitialForm> = {
    password: "",
    confirmPassword: "",
  };

  const validateFunc = (
    values: InitialForm
  ): FormikErrors<InitialForm> | void => {
    const errors: FormikErrors<InitialForm> = {} as FormikErrors<InitialForm>;
    if (!values.password.length) errors.password = "Password is required";
    else if (values.password.length <= 6) errors.password = "6 characters long";
    if (values.password != values.confirmPassword)
      errors.confirmPassword = "Passwords must match";

    return errors;
  };
  const handleSubmit = async (
    { password }: InitialForm,
    actions: FormikHelpers<InitialForm>
  ) => {
    const token = decodeURIComponent(router.query._token as string);
    setIsSubmitting(true);
    const { status, statusCode, message } = await changePassword({
      password,
      token,
    });
    if (status && statusCode === 200 && message === "OK") {
      toast({
        description: "password changed, you can login with your new password",
        duration: 5000,
        status: "success",
        isClosable: true,
      });
      setTimeout(() => {
        router.replace("/");
      }, 1000);
    }
  };

  return (
    <>
      <Formik
        initialValues={initialFormValues}
        onSubmit={handleSubmit}
        validate={validateFunc}
      >
        {({ errors, touched }) => (
          <Form>
            <Stack spacing="5" borderRadius="lg">
              {resMessage && (
                <Alert
                  status="success"
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
                  <AlertDescription>{resMessage}</AlertDescription>
                </Alert>
              )}
              <Field name="password">
                {({ field }: FieldProps) => (
                  <FormControl
                    id="password"
                    isInvalid={errors.password as boolean | undefined}
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
                        {...field}
                        ring={1}
                        ringColor="gray.200"
                        border={0}
                        type={isPasswordHidden ? "password" : "text"}
                        placeholder="New Password"
                        focusBorderColor="#2b6cb0"
                        autoComplete="true"
                        errorBorderColor="pink.500"
                      />
                    </InputGroup>
                    <FormErrorMessage color="pink.500">
                      {errors.password}
                    </FormErrorMessage>
                  </FormControl>
                )}
              </Field>
              <Field name="confirmPassword">
                {({ field }: FieldProps) => (
                  <FormControl
                    id="confirmPassword"
                    isInvalid={
                      (errors.confirmPassword as boolean | undefined) &&
                      touched.confirmPassword
                    }
                  >
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <IoMdLock color="lightgray" />
                      </InputLeftElement>
                      <Input
                        {...field}
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
                      {errors.confirmPassword}
                    </FormErrorMessage>
                  </FormControl>
                )}
              </Field>
              <Button
                variant="solid"
                fontWeight="light"
                shadow="md"
                color="white"
                background="linear-gradient(95deg, rgba(43,108,176,1) 0%, rgba(67,190,184,1) 96%)"
                _hover={{
                  background:
                    "linear-gradient(95deg, rgba(43,108,176,1) 0%, rgba(74,152,235,1) 92%)",
                }}
                _active={{ bg: "blue.600" }}
                _focus={{ outline: "none" }}
                type="submit"
                isLoading={isSubmitting}
                loadingText={"Setting new password"}
              >
                Change password
              </Button>
              <Link color={color} textAlign="center" fontSize="sm" href="/">
                Return to login
              </Link>
            </Stack>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default memo(PasswordForm);
