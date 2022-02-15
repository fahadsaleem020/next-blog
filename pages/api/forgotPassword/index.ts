import {
  connectHandler,
  tokenGenerator,
  Crypto,
  findOneOperation,
  Resolver,
} from "@utils/index";
import { PageConfig } from "next";
import { ResHandler, Req, Res, MergeId } from "@Types/api/index";
import { parseForm, csrfToken, preventGetRequest } from "@middlewares/index";
import { object, string } from "yup";
import sendGrid, { MailDataRequired } from "@sendgrid/mail";
import { url } from "@config/domain.config";
import { connectToDatabase, dbName } from "@config/client.config";
import { Collection, Document } from "mongodb";
import { userModel } from "@models/index";

const handler = connectHandler();

handler
  .use(preventGetRequest)
  .use(parseForm)
  .use(csrfToken)
  .post(async (req: Req, res: Res) => {
    const usersCollection: Collection<Document> = await (
      await Resolver(connectToDatabase())
    ).client
      .db(dbName)
      .collection("users");
    sendGrid.setApiKey(process.env.SENDGRID_KEY!);
    const email = req.body.email;
    await Resolver(
      object()
        .shape({
          email: string().required("Email is required").email("Invalid email"),
        })
        .validate({ email, password: req.body.password })
    );
    const token = Crypto.encrypt(tokenGenerator.getAccessToken({ email }, 300)); // 5m to set new

    const mailData: MailDataRequired = {
      replyTo: "fahadsaleem@newsapp.tk",
      to: req.body.email,
      text: "Email verification notice!",
      subject: "Email Verification",
      from: "fahadsaleem@newsapp.tk",
      html: `<h1 style="text-align: center;"><span style="color: #333333;"><strong>Click the verify button to redirect to password reset page</strong></span></h1>
      <p style="text-align: center;"><span style="background-color: #4485b8; padding: 5px 10px; font-size: 18px; border-radius: 3px; color: #ffffff; text-decoration: none;"><a style="color: #ffffff; text-decoration: none;" target="_blank" href="${url}/api/forgotPassword/verifyPassword?_token=${encodeURIComponent(
        token
      )}">Verify</a></span></p>`,
    };

    const isPasswordSet: MergeId<userModel, false> = <any>await Resolver(
      findOneOperation<userModel>(
        usersCollection,
        {
          password: { $exists: true },
          email,
        },
        { projection: { _id: 1 } }
      )
    );

    isPasswordSet ? await Resolver(sendGrid.send(mailData)) : null;

    isPasswordSet
      ? res.json(<ResHandler<"OK">>{
          message: <string>`Please check your email.`,
          statusCode: 200,
          status: true,
        })
      : res.json(<ResHandler<"NOT_FOUND">>{
          message: <string>`Please check your email.`,
          statusCode: 404,
          status: true,
        });
  });

export default handler;
export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
};
