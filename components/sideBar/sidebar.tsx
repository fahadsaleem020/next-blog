import {
  VStack,
  Box,
  Menu,
  MenuButton,
  Avatar,
  MenuList,
  MenuItem,
  HStack,
  Text,
  useTheme,
  Button,
} from "@chakra-ui/react";
import { AiOutlineProfile, AiOutlineFileAdd } from "react-icons/ai";
import { FiPower, FiUsers, FiSettings } from "react-icons/fi";
import { RiGalleryLine, RiDraftLine } from "react-icons/ri";
import { AiOutlineBarChart } from "react-icons/ai";
import { FC, memo, useCallback, useState, useEffect } from "react";
import Toggler from "@components/sideBar/menuToggler";
import SMenuItem from "@components/sideBar/menuItem";
import { useRouter } from "next/router";
import { useUser } from "@components/stores";
import { logout } from "@components/authMethods";
import { csrfToken } from "@config/csrfToken.config";
import shallow from "zustand/shallow";

const SideBar: FC<{ enableDrawer?: boolean; onClose?: () => void }> = ({
  enableDrawer,
  onClose,
}) => {
  //closing menu on escape key;
  useEffect(() => {
    document.addEventListener("keyup", (e) => {
      if (e.key === "Escape") {
        setTimeout(() => {
          setMenuList(false);
        }, 200);
        setMenu(false);
      }
    });
  }, []);

  const { setIsLoading, setIsOffline, setUser, user } = useUser(
    ({ setUser, setIsLoading, setIsOffline, user }) => ({
      setUser,
      setIsLoading,
      setIsOffline,
      user,
    }),
    shallow
  );

  const path = useRouter().asPath;
  const router = useRouter();
  const [isMenu, setMenu] = useState<boolean>(enableDrawer ? true : false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { item, sidebar, outlineColor, green } = useTheme().colors;
  const [isMenuList, setMenuList] = useState<boolean>(
    enableDrawer ? true : false
  );

  const { activeBg } = item;

  const toggleMenu = useCallback(() => {
    setTimeout(() => {
      setMenuList((prev) => !prev);
    }, 200);
    setMenu((prev) => !prev);
  }, []);

  const getPath = (PATH: string) => path.includes(PATH);
  const itemStyles = (pathName: string) => ({
    color:
      getPath(pathName) && isMenuList ? item.activeColor : item.inactiveColor,
    titleColor: getPath(pathName) ? item.activeColor : item.inactiveColor,
    iconBg: isMenuList
      ? getPath(pathName) && !isMenuList
        ? activeBg
        : "transparent"
      : getPath(pathName)
      ? activeBg
      : "transparent",
    borderLeft: isMenuList
      ? getPath(pathName)
        ? `2px solid ${item.activeColor}`
        : "none"
      : getPath(pathName) && isMenuList
      ? `2px solid ${item.activeColor}`
      : "none",
    iconBorder: isMenuList
      ? getPath(pathName) && !isMenuList
        ? `1px solid ${outlineColor}`
        : "none"
      : getPath(pathName)
      ? `1px solid ${outlineColor}`
      : "none",
  });

  const logoutHandler = async () => {
    setIsSubmitting(true);
    const { message, status, statusCode } = await logout(csrfToken);
    if (status && statusCode === 200 && message === "OK") {
      setIsSubmitting(false);
      router.push("/");
      setUser(null);
      setIsLoading(true);
      setIsOffline(true);
    } else {
      setIsSubmitting(false);
      router.push("/");
    }
  };
  return (
    <Box
      display="flex"
      flexDirection={"column"}
      overflow={"hidden"}
      transition="all 500ms ease"
      bg={sidebar.bgLight}
      w={isMenu ? (enableDrawer ? "full" : "20rem") : "4rem"}
      alignItems="center"
      py={"4"}
      h="full"
      px="1"
    >
      <Toggler
        isMenuList={isMenuList}
        toggleMenu={toggleMenu}
        outlineColor={"outlineColor"}
        enableDrawer={enableDrawer}
        onClose={onClose}
      />
      <VStack w="full" mt="20">
        {/* <SMenuItem
          isMenu={isMenu}
          href="/admin"
          isMenuList={isMenuList}
          title="Dashboard"
          iconBg={itemStyles("admin").iconBg}
          titleColor={itemStyles("admin").titleColor}
          borderLeft={itemStyles("admin").borderLeft}
          iconBorder={itemStyles("admin").iconBorder}
          icon={<AiOutlineBarChart size={"22"} color={itemStyles("").color} />}
        /> */}
        <SMenuItem
          isMenu={isMenu}
          href="/admin/posts"
          isMenuList={isMenuList}
          title="Posts"
          iconBg={itemStyles("posts").iconBg}
          titleColor={itemStyles("posts").titleColor}
          borderLeft={itemStyles("posts").borderLeft}
          iconBorder={itemStyles("posts").iconBorder}
          icon={
            <AiOutlineProfile size={"22"} color={itemStyles("posts").color} />
          }
        />
        <SMenuItem
          isMenu={isMenu}
          href="/admin/create"
          isMenuList={isMenuList}
          title="Create Post"
          iconBg={itemStyles("create").iconBg}
          titleColor={itemStyles("create").titleColor}
          borderLeft={itemStyles("create").borderLeft}
          iconBorder={itemStyles("create").iconBorder}
          icon={
            <AiOutlineFileAdd size={"22"} color={itemStyles("create").color} />
          }
        />
        <SMenuItem
          isMenu={isMenu}
          href="/admin/gallery"
          isMenuList={isMenuList}
          title="Gallery"
          iconBg={itemStyles("gallery").iconBg}
          titleColor={itemStyles("gallery").titleColor}
          borderLeft={itemStyles("gallery").borderLeft}
          iconBorder={itemStyles("gallery").iconBorder}
          icon={
            <RiGalleryLine size={"22"} color={itemStyles("gallery").color} />
          }
        />
        {/* <SMenuItem
          isMenu={isMenu}
          href="/admin/users"
          isMenuList={isMenuList}
          title="users"
          iconBg={itemStyles("users").iconBg}
          titleColor={itemStyles("users").titleColor}
          borderLeft={itemStyles("users").borderLeft}
          iconBorder={itemStyles("users").iconBorder}
          icon={<FiUsers size={"22"} color={itemStyles("users").color} />}
        /> */}
      </VStack>

      <Box
        mt="auto"
        alignSelf={isMenuList ? "start" : "center"}
        title="Account"
      >
        <Menu>
          <MenuButton>
            <HStack>
              <Avatar
                rounded={"md"}
                size={"sm"}
                src={user?.photo?.toString()}
                name={user?.username?.toString()}
              />
              {isMenuList && (
                <Text
                  color="gray.500"
                  fontWeight="bold"
                  display={"block"}
                  noOfLines={1}
                >
                  {user?.username}
                </Text>
              )}
            </HStack>
          </MenuButton>
          <MenuList zIndex={5} px="2" rounded="xl" borderColor={"gray.300"}>
            <MenuItem p="0">
              <Button
                bg="transparent"
                w="full"
                leftIcon={<FiSettings color="grey" />}
                justifyContent="flex-start"
                color="inherit"
                fontWeight="normal"
                borderRadius="sm"
                _hover={{ background: "transparent" }}
              >
                Settings
              </Button>
            </MenuItem>
            <MenuItem p="0">
              <Button
                onClick={logoutHandler}
                bg="transparent"
                w="full"
                leftIcon={<FiPower color="grey" />}
                justifyContent="flex-start"
                color="inherit"
                fontWeight="normal"
                borderRadius="sm"
                _hover={{ background: "transparent" }}
                isLoading={isSubmitting}
                loadingText="Logout"
              >
                Logout
              </Button>
            </MenuItem>
          </MenuList>
        </Menu>
      </Box>
    </Box>
  );
};

export default memo(SideBar);
