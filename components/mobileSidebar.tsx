import { Drawer, DrawerOverlay, DrawerContent } from "@chakra-ui/react";
import { FC, memo } from "react";
import SideBar from "@components/sideBar/sidebar";

const MobileSidebar: FC<{
  onClose: () => void;
  isOpen: boolean;
  enableDrawer?: boolean;
}> = ({ isOpen, onClose, enableDrawer }) => {
  return (
    <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="xs">
      <DrawerOverlay backdropFilter={"blur(2px)"} />
      <DrawerContent p="0">
        <SideBar enableDrawer={enableDrawer} onClose={onClose} />
      </DrawerContent>
    </Drawer>
  );
};

export default memo(MobileSidebar);
