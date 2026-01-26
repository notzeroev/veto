import { query } from "./_generated/server";
import { authComponent } from "./auth";

export const current = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) return null;

    return {
      _id: user._id,
      email: user.email,
      username: user.displayUsername ?? user.username ?? user.name,
    };
  },
});
