import { ConvexCredentials } from "@convex-dev/auth/providers/ConvexCredentials";
import {
  convexAuth,
  createAccount,
  retrieveAccount,
} from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";
import { Scrypt } from "lucia";

const scrypt = new Scrypt();

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    ConvexCredentials({
      id: "password",
      crypto: {
        hashSecret: (password: string) => scrypt.hash(password),
        verifySecret: (password: string, hash: string) =>
          scrypt.verify(hash, password),
      },
      authorize: async (params, ctx) => {
        const flow = params.flow as string;
        const username = params.username as string;
        const password = params.password as string;

        if (!username || !password) {
          throw new ConvexError("Username and password are required");
        }

        if (flow === "signUp") {
          // Sign up flow: username + email + password
          const email = params.email as string;

          if (!email) {
            throw new ConvexError("Email is required for sign-up");
          }

          // Validate username format
          if (username.length < 3) {
            throw new ConvexError("Username must be at least 3 characters");
          }
          if (username.length > 20) {
            throw new ConvexError("Username must be at most 20 characters");
          }
          if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            throw new ConvexError(
              "Username can only contain letters, numbers, and underscores"
            );
          }

          // Validate password
          if (password.length < 8) {
            throw new ConvexError("Password must be at least 8 characters");
          }

          // Create account with username as the account ID
          const { user } = await createAccount(ctx, {
            provider: "password",
            account: {
              id: username.toLowerCase(), // Use lowercase username as account ID
              secret: password,
            },
            profile: {
              username,
              email,
            },
            shouldLinkViaEmail: false,
          });

          return { userId: user._id };
        } else {
          // Sign in flow: username + password only
          const { user } = await retrieveAccount(ctx, {
            provider: "password",
            account: {
              id: username.toLowerCase(),
              secret: password,
            },
          });

          if (!user) {
            throw new ConvexError("Invalid username or password");
          }

          return { userId: user._id };
        }
      },
    }),
  ],
});
