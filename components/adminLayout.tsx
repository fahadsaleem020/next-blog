import { FC } from "react";
import SideBar from "@components/sideBar/sidebar";
import {
  Box,
  HStack,
  VStack,
  useDisclosure,
  useBreakpointValue,
} from "@chakra-ui/react";
import DashBoardNavbar from "@components/dashBoardNavbar";
import MobileSidebar from "@components/mobileSidebar";
import AuthenticatedAdminPage from "@components/authenticatedAdminPage";

const DashboardLayout: FC = ({ children }) => {
  const { isOpen, onClose, onToggle } = useDisclosure();
  const render = useBreakpointValue({
    base: true,
    md: true,
    lg: true,
    xl: false,
    "2xl": false,
  });

  return (
    <AuthenticatedAdminPage
      loader={"loading dashboard..."}
      redirectIfOffline="/"
    >
      <HStack h="100vh" alignItems={"start"} spacing={0}>
        {render ? (
          <MobileSidebar isOpen={isOpen} onClose={onClose} enableDrawer />
        ) : (
          <SideBar />
        )}
        <VStack w="full" h="full" alignItems="stretch" spacing="0">
          {/* horizontal menu */}
          {render && <DashBoardNavbar onToggle={onToggle} />}
          {/* content/ */}
          <Box pb="5" h="full" overflow={"auto"}>
            {children}
          </Box>
        </VStack>
      </HStack>
    </AuthenticatedAdminPage>
  );
};

export default DashboardLayout;
