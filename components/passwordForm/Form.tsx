import { Dispatch, FC, memo, SetStateAction, useState } from "react";
import { Formik, Field, Form, FieldProps, FormikHelpers } from "formik";
import { csrfToken } from "@config/csrfToken.config";
import {
  Stack,
  FormControl,
  FormErrorMessage,
  Input,
  InputGroup,
  InputLeftElement,
  Link,
  useColorModeValue,
  Alert,
  AlertIcon,
  AlertDescription,
  CloseButton,
  Text,
  FormHelperText,
} from "@chakra-ui/react";
import * as Yup from "yup";
import { IoMdPerson } from "react-icons/io";
import { forgotPassword } from "@components/authMethods";
import FormButton from "@components/defaults/formButton";

const PasswordForm: FC<{
  setTitle: Dispatch<SetStateAction<string>>;
  setActiveForm: Dispatch<SetStateAction<"loginForm" | "passwordForm">>;
}> = ({ setTitle, setActiveForm }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resMessage, setResMessage] = useState<string | null>(null);
  const color = useColorModeValue("blue.600", "blue.300");

  setTitle("Forgot Password");
  const schema = Yup.object().shape({
    email: Yup.string().required("Email is required").email("Invalid email"),
  });

  const handleSubmit = async (
    values: { email: "" },
    actions: FormikHelpers<{ email: "" }>
  ) => {
    setIsSubmitting(true);
    const { status, statusCode, message } = await forgotPassword(
      values,
      csrfToken
    );
    if (status && statusCode === 200 && message) {
      setResMessage(message);
      setIsSubmitting(false);
    } else {
      setResMessage(message);
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Formik
        initialValues={{ email: "" }}
        onSubmit={handleSubmit}
        validationSchema={schema}
      >
        {({ errors, touched, dirty }) => (
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
              <Field name="email">
                {({ field }: FieldProps) => (
                  <FormControl
                    id="email"
                    isInvalid={
                      (errors.email as boolean | undefined) &&
                      touched.email &&
                      dirty
                    }
                  >
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <IoMdPerson color="lightgray" />
                      </InputLeftElement>
                      <Input
                        {...field}
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
                      {errors.email}
                    </FormErrorMessage>
                    <FormHelperText>
                      You&apose;ll get an email with a reset link
                    </FormHelperText>
                  </FormControl>
                )}
              </Field>
              <FormButton
                isSubmitting={isSubmitting}
                loadingText="Sending Verification Link"
              >
                Send Verification Link
              </FormButton>
              <Link
                color={color}
                textAlign="center"
                onClick={() => setActiveForm("loginForm")}
                fontSize="sm"
              >
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
