import { Button, HStack, useDisclosure } from "@chakra-ui/react";
import { FC, memo, useReducer, ReactNode } from "react";
import { AiOutlineFullscreen } from "react-icons/ai";
import Modal from "@components/modal";

type Action = {
  type: "delete selected" | "bulk action";
  body: ReactNode;
  title: string;
};

const initialState: Action = {
  type: "delete selected",
  body: null,
  title: "",
};

const reducer = (state: Action, action: Action) => {
  switch (action.type) {
    case "delete selected":
      return {
        ...action,
      };
    case "bulk action":
      return {
        ...action,
      };

    default:
      throw new Error("Invalid action");
  }
};

const ActionButton: FC<{ render: boolean | undefined }> = ({ render }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [state, dispatch] = useReducer(reducer, initialState);

  const handler = (
    type: Action["type"],
    body: ReactNode,
    modalTitle: string
  ) => {
    dispatch({ type, body, title: modalTitle });
    onOpen();
  };
  return (
    <HStack justifyContent="space-between" mt="10" position="sticky" left={0}>
      <HStack justifyContent="space-between" flexBasis="full">
        <HStack>
          <Button
            variant="ghost"
            _focus={{ outline: "none" }}
            fontSize="sm"
            colorScheme="pink"
            color="pink.600"
            shadow="base"
            onClick={() =>
              handler("delete selected", "delete selected", "delete selected")
            }
          >
            Delete Selected (21)
          </Button>
          <Button
            _focus={{ outline: "none" }}
            variant="ghost"
            color="blue.500"
            fontSize="smaller"
            bg="blue.50"
            colorScheme="blue"
            onClick={() => handler("bulk action", "bulk action", "Bulk Action")}
            // size="sm"
            shadow="base"
            rightIcon={<AiOutlineFullscreen />}
          >
            Bulk Action
          </Button>
        </HStack>
      </HStack>
      <Modal
        toggleProps={{ isOpen, onClose }}
        body={state.body}
        modalTitle={state.title}
      />
    </HStack>
  );
};

export default memo(ActionButton);
