import {
  connectHandler,
  userData,
  validateToken,
  updateOneOperation,
  Resolver,
} from "@utils/index";
import { PageConfig } from "next";
import { ResHandler, Req, Res } from "@Types/api/index";
import { parseForm, preventGetRequest } from "@middlewares/index";
import { object, string } from "yup";
import { connectToDatabase, dbName } from "@config/client.config";
import { Collection, Document } from "mongodb";
import { Payload, userModel } from "@models/index";
import { hash } from "bcrypt";

const handler = connectHandler();

handler
  .use(parseForm)
  .use(preventGetRequest)
  .post(async (req: Req, res: Res) => {
    //users collection;
    const usersCollection: Collection<Document> = await (
      await Resolver(connectToDatabase())
    ).client
      .db(dbName)
      .collection("users");

    //form data
    const { password, token } = userData.genericFormData<
      Pick<userModel, "email" | "password"> & { token: string }
    >(req);

    const { email } = await Resolver(
      validateToken.accessToken<Pick<Payload, "email">>(token)
    );

    await Resolver(
      object()
        .shape({
          password: string()
            .required("Cannot get new password field")
            .min(6, "Password should be altleast 6 characters long"),
          email: string()
            .required("Cannot get email")
            .email("Invalid email structure"),
          token: string().required(),
        })
        .validate({ email, password, token })
    );

    const hashed = await Resolver(hash(password, 10));
    const isPasswordChanged = await Resolver(
      updateOneOperation<userModel>(
        usersCollection,
        { email: email },
        { $set: { password: hashed } }
      )
    );

    isPasswordChanged.modifiedCount
      ? res.json(<ResHandler<"OK">>{
          status: true,
          message: "OK",
          statusCode: 200,
        })
      : res.json(<ResHandler<"FORBIDDEN">>{
          status: true,
          message: "FORBIDDEN",
          statusCode: 403,
        });
  });

export default handler;
export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
};
