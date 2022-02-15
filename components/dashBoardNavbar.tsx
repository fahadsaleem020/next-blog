import {
  Box,
  HStack,
  Input,
  IconButton,
  useColorMode,
  useBreakpointValue,
  useTheme,
} from "@chakra-ui/react";
import { FC, memo } from "react";
import { FaRegMoon } from "react-icons/fa";
import { CgMenuLeft } from "react-icons/cg";

const NavigationalContents = () => {
  const { toggleColorMode } = useColorMode();
  const { gray } = useTheme().colors;

  return (
    <HStack>
      <Box borderRadius="10" shadow="base">
        <HStack p="1">
          <Input bg="gray.100" placeholder="jump to page..." border="none" />
          <IconButton
            icon={<FaRegMoon color={gray[600]} />}
            aria-label="theme toggler"
            onClick={toggleColorMode}
            colorScheme={"gray"}
          />
        </HStack>
      </Box>
    </HStack>
  );
};

const DashBoardNavbar: FC<{ onToggle: () => void }> = ({ onToggle }) => {
  const { gray } = useTheme().colors;
  return (
    <HStack bg="white" px="10" py="5" borderRadius={5} justifyContent={"end"}>
      <NavigationalContents />
      <IconButton
        _focus={{ outline: "none" }}
        color={gray[600]}
        rounded="full"
        icon={<CgMenuLeft />}
        onClick={onToggle}
        aria-label="menu toggler"
      />
    </HStack>
  );
};

export default memo(DashBoardNavbar);
