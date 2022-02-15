import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Heading,
  ModalProps,
} from "@chakra-ui/react";
import { FC, memo, ReactNode } from "react";

const ModalComponent: FC<{
  toggleProps: { isOpen: boolean; onClose: () => void };
  body: ReactNode;
  modalTitle: string;
  size?: ModalProps["size"];
  animate?: ModalProps["motionPreset"];
  footer?: ReactNode;
}> = ({ toggleProps, body, modalTitle, size, animate, footer }) => {
  const { isOpen, onClose } = toggleProps;
  return (
    <>
      <Modal
        motionPreset={animate ? animate : "none"}
        isOpen={isOpen}
        onClose={onClose}
        scrollBehavior="inside"
        size={size ? size : "3xl"}
      >
        <ModalOverlay />
        <ModalContent rounded="3xl">
          <ModalHeader>
            <Heading size="md" w="full" color="gray.600">
              {modalTitle}
            </Heading>
          </ModalHeader>
          <ModalCloseButton
            rounded="full"
            _focus={{ outline: "none" }}
            color="gray.500"
            bg="gray.100"
            _hover={{
              bg: "gray.100",
              color: "gray.800",
            }}
            _active={{
              bg: "gray.400",
              color: "gray.100",
            }}
          />
          <ModalBody>{body}</ModalBody>
          {footer && <ModalFooter>{footer}</ModalFooter>}
        </ModalContent>
      </Modal>
    </>
  );
};

export default memo(ModalComponent);
