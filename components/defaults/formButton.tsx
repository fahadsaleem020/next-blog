import { FC, PropsWithChildren } from "react";
import { Box, BoxProps, Button } from "@chakra-ui/react";

const FormButton: FC<
  PropsWithChildren<BoxProps> & {
    isSubmitting: boolean;
    loadingText: string;
  }
> = ({ children, isSubmitting, loadingText, ...rest }) => (
  <Box {...rest}>
    <Button
      w="full"
      variant="solid"
      color="white"
      bg="beta.gray.800"
      _hover={{ bg: "beta.gray.600" }}
      _active={{ bg: "beta.gray.800" }}
      _focus={{ outline: "none" }}
      type="submit"
      isLoading={isSubmitting}
      loadingText={loadingText}
    >
      {children}
    </Button>
  </Box>
);

export default FormButton;
