import { createAuthClient } from "better-auth/react";
import {
  inferAdditionalFields,
  oneTimeTokenClient,
} from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [
    oneTimeTokenClient(),
    // Keep in sync with `user.additionalFields` in src/lib/auth.ts.
    inferAdditionalFields({
      user: {
        firstName: { type: "string", required: true },
        lastName: { type: "string", required: true },
        gender: { type: "string", required: false },
        // Sent as optional from the web form; the server still enforces it.
        phone: { type: "string", required: false },
        // Web signup does not collect a role; the server defaults it to job_seeker.
        role: { type: "string", required: false },
      },
    }),
  ],
});
