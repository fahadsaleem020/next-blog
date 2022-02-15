import { LoginFormModel, Payload } from "@models/index";
import { DeviceInfoType } from "@Types/global";
import { ApiResponse } from "@Types/global";
import axios from "axios";

export const getAccessToken = async (csrfToken: string) =>
  await (
    await axios.post<{ token: string }>("/api/persistToken/", {
      csrftoken: csrfToken,
    })
  ).data;

export const dumpUserData = async (
  csrfToken: string
): Promise<Payload | null> => {
  const { token } = await getAccessToken(csrfToken);
  if (!token) return null;
  return await (
    await axios.post("/api/dumpTokenData", { token })
  ).data;
};

export const dumpAdminData = async (
  csrfToken: string
): Promise<Payload | null> => {
  const { token } = await (
    await axios.post<{ token: string }>("/api/persistToken/persistAdmin", {
      csrftoken: csrfToken,
    })
  ).data;
  if (!token) return null;
  return await (
    await axios.post("/api/dumpTokenData", { token })
  ).data;
};

export const updateSession = async (csrfToken: string): Promise<ApiResponse> =>
  await (
    await axios.post("/api/persistToken/updateSession", {
      csrftoken: csrfToken,
    })
  ).data;

export const signin = async (
  values: LoginFormModel,
  device: DeviceInfoType
): Promise<ApiResponse & { payload: Payload }> => {
  values.deviceInfo = device;
  return await (
    await axios.post("/api/signin", values)
  ).data;
};

export const adminSignin = async (
  values: LoginFormModel,
  device: DeviceInfoType
): Promise<ApiResponse & { payload: Payload }> => {
  values.deviceInfo = device;
  return await (
    await axios.post("/api/adminSignin", values)
  ).data;
};

export const logout = async (csrfToken: string): Promise<ApiResponse> => {
  const { token } = await getAccessToken(csrfToken);
  return await (
    await axios.post("/api/logout/", { accesstoken: token })
  ).data;
};

export const forgotPassword = async (
  values: { email: string },
  csrfToken: string
): Promise<ApiResponse> =>
  await (
    await axios.post("/api/forgotPassword", {
      ...values,
      csrftoken: csrfToken,
    })
  ).data;

export const changePassword = async (values: {
  password: string;
  token: string;
}): Promise<ApiResponse> => {
  return await (
    await axios.post("/api/forgotPassword/verifyPassword", values)
  ).data;
};

export const signup = async (values: {
  csrftoken: string;
  email: string;
  password: string;
  remember: boolean;
  isManual: boolean;
}): Promise<ApiResponse> =>
  await (
    await axios.post("/api/signup/", values)
  ).data;

export const updateSignup = async (
  values: DeviceInfoType & { [key: string]: any },
  token: string
): Promise<ApiResponse> =>
  await (
    await axios.post("/api/signup/verifyEmail", {
      ...values,
      token,
    })
  ).data;

export const setSession = async (
  token: string,
  values: DeviceInfoType
): Promise<ApiResponse> =>
  await (
    await axios.post("/api/setSession", {
      token,
      deviceInfo: values,
      isManual: false,
    })
  ).data;
