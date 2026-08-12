import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import {
  emailOTPClient,
  inferAdditionalFields,
  oneTimeTokenClient,
} from "better-auth/client/plugins";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";

const apiBaseUrl =
  process.env.EXPO_PUBLIC_API_URL ||
  Constants.expoConfig?.extra?.apiBaseUrl ||
  "https://www.agsglobalfarm.com";

export const authClient = createAuthClient({
  baseURL: apiBaseUrl,
  plugins: [
    expoClient({
      scheme: "agsmobile",
      storagePrefix: "ags",
      storage: SecureStore,
    }),
    emailOTPClient(),
    oneTimeTokenClient(),
    inferAdditionalFields({
      user: {
        firstName: { type: "string", required: true },
        lastName: { type: "string", required: true },
        gender: { type: "string", required: false },
        phone: { type: "string", required: true },
        role: { type: "string", required: true },
      },
    }),
  ],
});

export type AuthSession = ReturnType<typeof authClient.useSession>;
