"use server";


import authOptions from "@/app/api/auth/[...nextauth]/auth-options";
import { getUserSubscription } from "@/lib/db/queries";
import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";
import { getServerSession } from "next-auth";

const returnUrl = absoluteUrl("/shop");

export const createStripeUrl = async () => {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!session || !user) throw new Error("Unauthorized.");

  const userSubscription = await getUserSubscription();
  
  // Make sure returnUrl has a proper scheme
  const returnUrl = absoluteUrl("/shop");
  console.log("Return URL:", returnUrl); // Add this for debugging

  // For existing customers
  if (userSubscription && userSubscription.stripeCustomerId) {
    const stripeSession = await stripe.billingPortal.sessions.create({
      customer: userSubscription.stripeCustomerId,
      return_url: returnUrl,
    });

    return { data: stripeSession.url };
  }

  // For checkout
  const params: any = {
    mode: "subscription",
    payment_method_types: ["card"],
    customer_email: user.email,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "USD",
          product_data: {
            name: "Syntaxia Pro",
            description: "Unlimited hearts.",
          },
          unit_amount: 2000,
          recurring: {
            interval: "month",
          },
        },
      },
    ],
    metadata: {
      userId: user.id,
    },
    success_url: returnUrl,
    cancel_url: returnUrl,
  };

  const stripeSession = await stripe.checkout.sessions.create(params);

  return { data: stripeSession.url };
};