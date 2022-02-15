import { useState, memo, FC, Dispatch, SetStateAction } from "react";
import LoginForm from "@components/loginForm/Form";
import { Box } from "@chakra-ui/react";
import ForgotPasswordForm from "@components/passwordForm/Form";

const ClientFormStepper: FC<{
  setFormTitle: Dispatch<SetStateAction<string>>;
}> = ({ setFormTitle }) => {
  const [activeForm, setActiveForm] = useState<"loginForm" | "passwordForm">(
    "loginForm"
  );

  return (
    <Box maxW="xl">
      {(() => {
        switch (activeForm) {
          case "loginForm":
            return (
              <LoginForm
                setTitle={setFormTitle}
                setActiveForm={setActiveForm}
                type="client"
              />
            );
          case "passwordForm":
            return (
              <ForgotPasswordForm
                setTitle={setFormTitle}
                setActiveForm={setActiveForm}
              />
            );
        }
      })()}
    </Box>
  );
};

export default memo(ClientFormStepper);
