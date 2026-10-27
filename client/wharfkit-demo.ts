import { Session } from "@wharfkit/session";

const TOKEN = "replaceaccount";

/** Sell path: recipient is a row in the dex table. The pool must observe `quantity` unchanged. */
export async function sellToPool(session: Session, pool: string, quantity: string) {
  return session.transact({
    actions: [
      {
        account: TOKEN,
        name: "transfer",
        authorization: [session.permissionLevel],
        data: {
          from: session.actor,
          to: pool,
          quantity,
          memo: "swap",
        },
      },
    ],
  });
}
