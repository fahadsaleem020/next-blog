import {
  Input,
  FormControl,
  FormErrorMessage,
  InputLeftElement,
  InputRightElement,
  InputGroup,
  Button,
  Text,
  Checkbox,
  useColorModeValue,
} from "@chakra-ui/react";
import { LoginFormModel } from "@models/index";
import { FormikProps, FieldProps } from "formik";
import { FC, useState } from "react";
import { IoMdPerson, IoMdLock, IoMdEye, IoMdEyeOff } from "react-icons/io";

type ElementProps = FC<{
  props: FormikProps<LoginFormModel>;
  Field: FieldProps;
}>;

export const TextField: ElementProps = ({
  props: { dirty, errors, touched },
  Field: { field },
}) => {
  return (
    <>
      <FormControl
        id="email"
        isInvalid={
          (errors.email as boolean | undefined) && touched.email && dirty
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
        <FormErrorMessage color="pink.500">{errors.email}</FormErrorMessage>
      </FormControl>
    </>
  );
};

export const PasswordField: ElementProps = ({
  props: { dirty, errors, touched },
  Field: { field },
}) => {
  const [isPasswordHidden, setIsPasswordHidden] = useState(true);

  return (
    <>
      <FormControl
        id="password"
        isInvalid={
          (errors.password as boolean | undefined) && touched.password && dirty
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
            {...field}
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
        <FormErrorMessage color="pink.500">{errors.password}</FormErrorMessage>
      </FormControl>
    </>
  );
};

export const CheckBox: ElementProps = ({ Field: { field } }) => {
  const color = useColorModeValue("gray.900", "gray.300");
  return (
    <>
      <FormControl id="remember" w="max-content">
        <Checkbox defaultIsChecked {...field}>
          <Text color={color}>Remember me</Text>
        </Checkbox>
      </FormControl>
    </>
  );
};

export const SubmitButton: FC<{ submiting: boolean }> = ({ submiting }) => {
  return (
    <Button
      variant="solid"
      color="white"
      bg="beta.gray.800"
      _hover={{ bg: "beta.gray.600" }}
      _active={{ bg: "beta.gray.800" }}
      _focus={{ outline: "none" }}
      type="submit"
      isLoading={submiting}
      loadingText={"Login"}
    >
      Login
    </Button>
  );
};
