import { useState } from "react";
import LoginForm from "@components/loginForm/Form";
import { Box } from "@chakra-ui/react";
import ForgotPasswordForm from "@components/passwordForm/Form";
import SignupForm from "@components/signupForm/Form";
import UnAuthenticatedPage from "@components/unAuthenticatedPage";

const AdminFormStepper = () => {
  const [_, setFormTitle] = useState<string>("loginForm");
  const [activeForm, setActiveForm] = useState<
    "loginForm" | "passwordForm" | "signupForm"
  >("loginForm");

  return (
    <UnAuthenticatedPage loader="..loading" redirectIfOnline="/admin">
      <Box maxW="xl">
        {(() => {
          switch (activeForm) {
            case "loginForm":
              return (
                <LoginForm
                  withAdminSignup={true}
                  withSocial={false}
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
            case "signupForm":
              return (
                <SignupForm
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
