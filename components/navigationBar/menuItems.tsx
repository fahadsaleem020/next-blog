import { HStack, Link } from "@chakra-ui/react";
import NLink from "next/link";

const MenuItems = () => {
  const menu = ["React", "Angular", "Frontend", "Backend", "Node", "Vue"];

  return (
    <HStack gap={5}>
      {menu.map((val, i) => (
        <Link key={i} py={3} fontWeight="semibold" color="beta.gray.500">
          <NLink href={"/to that page"}>{val}</NLink>
        </Link>
      ))}
    </HStack>
  );
};

export default MenuItems;
