import { useState, FC, Dispatch, SetStateAction } from "react";
import LoginForm from "@components/loginForm/Form";
import { Box } from "@chakra-ui/react";
import ForgotPasswordForm from "@components/passwordForm/Form";
import UnAuthenticatedPage from "@components/unAuthenticatedPage";

const AdminFormStepper: FC<{
  setFormTitle: Dispatch<SetStateAction<string>>;
}> = ({ setFormTitle }) => {
  const [activeForm, setActiveForm] = useState<"loginForm" | "passwordForm">(
    "loginForm"
  );

  return (
    <UnAuthenticatedPage loader="..loading" redirectIfOnline="/admin">
      <Box maxW="xl">
        {(() => {
          switch (activeForm) {
            case "loginForm":
              return (
                <LoginForm
                  setTitle={setFormTitle}
                  setActiveForm={setActiveForm}
                  type="admin"
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
    </UnAuthenticatedPage>
  );
};

export default AdminFormStepper;
