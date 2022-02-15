import { Strategy } from "passport-google-oauth20";
import { url } from "@config/domain.config";
import { Req, Res } from "@Types/api";
import { NextHandler } from "next-connect";
import { connectToDatabase } from "@config/client.config";
import { tokenGenerator, Resolver, updateOneOperation } from "@utils/index";
import { Collection, Document } from "mongodb";
import { OAuthPayload, userModel } from "@models/index";

//callback param
type CustomCallbackParams = Pick<
  Parameters<ConstructorParameters<typeof Strategy>[1]>,
  "4"
> & { res: Res };

//callback
const callback = async (params: CustomCallbackParams) => {
  const { res, "4": profile } = params;

  const { email, picture, name, email_verified } = profile._json;
  const dbClient = (
    await Resolver(connectToDatabase(), { message: "from here" })
  ).db;
  const usersCollection: Collection<Document> = dbClient.collection("users");

  const isNewUser = await Resolver(
    updateOneOperation<userModel>(
      usersCollection,
      { email },
      {
        $addToSet: {
          authTypes: "google",
          userNames: { google: name },
          photos: { google: picture },
        },
      }
    )
  );

  const payload: OAuthPayload = {
    email: email!,
    authTypes: ["google"],
    userNames: [{ google: name }],
    photos: [{ google: picture }],
    isManual: false,
    verified: email_verified === "true",
  };

  const token = tokenGenerator.getAccessToken(payload, 300); // 5m to set new registration fields
  const sessionToken = tokenGenerator.getAccessToken(payload, 20); // auto login expires in 20 secs

isNewUser.matchedCount
    ? res.redirect(`/setSessionPage?_token=${encodeURIComponent(sessionToken)}`)
    : res.redirect(`/completeSignup?_token=${encodeURIComponent(token)}`);
};

//strategy
export const googleStrategy = (req: Req, res: Res, next: NextHandler) =>
  new Strategy(
    {
      clientID: process.env.GOOGLE_CLIENTID!,
      clientSecret: process.env.GOOGLE_CLIENTSECRET!,
      callbackURL: `${url}/api/google/callback`,
    },
    (...params) => {
      callback({ "4": params[2], res });
    }
  );
