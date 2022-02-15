import { Box, IconButton, StyleProps } from "@chakra-ui/react";
import { FC, memo } from "react";
import { CgMenuLeft, CgMenuRight } from "react-icons/cg";

interface Props {
  isMenuList: boolean;
  toggleMenu: () => void;
  outlineColor: StyleProps["outlineColor"];
  enableDrawer?: boolean;
  onClose?: () => void;
}

const Toggler: FC<Props> = ({
  isMenuList,
  toggleMenu,
  outlineColor,
  enableDrawer,
  onClose,
}) => {
  return (
    <Box w={isMenuList && ("full" as any)}>
      <IconButton
        color="gray.500"
        bg="transparent"
        w={isMenuList && ("full" as any)}
        onClick={enableDrawer ? onClose : toggleMenu}
        icon={isMenuList ? <CgMenuRight size="20" /> : <CgMenuLeft size="20" />}
        aria-label="menu"
        rounded={"full"}
        _focus={{ outline: "none" }}
        _active={{ outline: " 2px solid", outlineColor: outlineColor }}
      />
    </Box>
  );
};

export default memo(Toggler);
