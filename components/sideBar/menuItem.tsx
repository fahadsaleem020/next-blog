import React, { FC, JSXElementConstructor, memo, ReactElement } from "react";
import Nlink from "next/link";
import {
  HStack,
  IconButton,
  Link,
  StyleProps,
  Text,
  Tooltip,
} from "@chakra-ui/react";

type IconType =
  | ReactElement<any, string | JSXElementConstructor<any>>
  | undefined;

interface Props {
  isMenuList: boolean;
  href: string;
  icon: IconType;
  title: string;
  iconBg: string;
  titleColor: StyleProps["color"] | string;
  borderLeft: string;
  iconBorder: string;
  isMenu: boolean;
}

const Item: FC<Props> = ({
  isMenuList,
  href,
  icon,
  title,
  iconBg,
  titleColor,
  borderLeft,
  iconBorder,
  isMenu,
}) => {
  return (
    <Tooltip
      isDisabled={isMenu}
      label={title}
      bg="gray.600"
      placement="right"
      arrowSize={7}
      shadow="base"
      px="3"
    >
      <Link w="full" borderLeft={borderLeft}>
        <Nlink href={href}>
          <HStack>
            <IconButton
              w="16"
              icon={icon}
              bg={iconBg}
              border={iconBorder}
              aria-label="posts"
              _hover={{ background: iconBg }}
              _active={{
                background: "gray.200",
              }}
              _focus={{ outline: "none" }}
            />

            {isMenuList && (
              <Text color={titleColor} display={"block"}>
                {title}
              </Text>
            )}
          </HStack>
        </Nlink>
      </Link>
    </Tooltip>
  );
};

export default memo(Item);
