import {
  Box,
  Container,
  HStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem as Item,
  Avatar,
  Button,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import MenuItems from "@components/navigationBar/menuItems";
import Dynamic from "@components/dynamicContent";
import SharedModal from "@components/modal";
import ClientFormStepper from "@components/clientFormStepper";
import { logout } from "@components/authMethods";
import { csrfToken } from "@config/csrfToken.config";
import { useCallback, useState } from "react";
import { useUser } from "@components/stores";
import { RiLogoutCircleLine, RiSettings5Line } from "react-icons/ri";

const NavigationContainer = () => {
  return (
    <Box py={3} shadow="sm" bg="white">
      <Container maxW="container.xl">
        <HStack justifyContent={"space-between"}>
          <MenuItems />
          <Dynamic
            loader={"loading"}
            offlineContent={<CreateAccountButton />}
            OnlineContent={<UserProfile />}
          />
        </HStack>
      </Container>
    </Box>
  );
};

const UserProfile = () => {
  const setIsLoading = useUser(useCallback((state) => state.setIsLoading, []));
  const setIsOffline = useUser(useCallback((state) => state.setIsOffline, []));
  const user = useUser(useCallback((state) => state.user, []))!;

  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const logoutHandler = async () => {
    setIsSubmitting(true);
    const { status, statusCode, message } = await logout(csrfToken);
    if (status && statusCode === 200) {
      setIsSubmitting(false);
      setIsLoading(true);
      setIsOffline(true);
    } else {
      toast({
        title: "Retrying...",
        position: "bottom",
        duration: 5000,
        status: "error",
      });
      logoutHandler();
    }
  };
  return (
    <Menu>
      <MenuButton aria-label="Options" variant="outline">
        <Avatar
          name={user.username}
          src={user.photo ?? "https://avatars.dicebear.com/api/personas/d.svg"}
        />
      </MenuButton>
      <MenuList>
        <Item icon={<RiSettings5Line />}>Settings</Item>
        <Item icon={<RiLogoutCircleLine />} onClick={logoutHandler}>
          {isSubmitting ? "Logging out..." : "Logout"}
        </Item>
      </MenuList>
    </Menu>
  );
};

const CreateAccountButton = () => {
  const { onOpen, onClose, isOpen } = useDisclosure();
  const [formTitle, setFormTitle] = useState<string>("loginForm");
  return (
    <>
      <Button
        variant={"outline"}
        colorScheme="twitter"
        rounded="full"
        _focus={{ outline: "none" }}
        onClick={onOpen}
      >
        Create Account
      </Button>
      <SharedModal
        body={
          <Box py={5}>
            <ClientFormStepper setFormTitle={setFormTitle} />
          </Box>
        }
        modalTitle={formTitle}
        toggleProps={{ onClose, isOpen }}
        size="md"
      />
    </>
  );
};

export default NavigationContainer;
