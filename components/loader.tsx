import {
  Spinner,
  Flex,
  ColorProps,
  SpinnerProps,
  FlexProps,
} from "@chakra-ui/react";
import { FC, PropsWithChildren } from "react";

export const LoaderBody: FC<SpinnerProps> = ({ ...rest }) => (
  <Spinner
    speed="800ms"
    color={"gray.600" as ColorProps["color"] as any}
    size="lg"
    {...rest}
  />
);

export const LoaderContainer: FC<PropsWithChildren<FlexProps>> = ({
  children,
  ...rest
}) => (
  <Flex h="90vh" {...rest}>
    {children}
  </Flex>
);
