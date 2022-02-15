import passport from "passport";
import { connectHandler } from "@utils/index";
import { Req, Res } from "@Types/api";
import { googleStrategy } from "./config";
import { NextHandler } from "next-connect";

const handler = connectHandler();

handler
  .use((req: Req, res: Res, next: NextHandler) => {
    passport.use(googleStrategy(req, res, next));
    next();
  })
  .use(passport.initialize())
  .use(
    passport.authenticate("google", {
      session: false,
      scope: ["profile", "email"],
    })
  );

export default handler;
