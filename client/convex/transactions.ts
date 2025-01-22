import Stripe from "stripe";

import { get30DaysFromNowInSeconds, isDefined } from "@/lib/utils";
import { ConvexError } from "convex/values";
import { internal } from "./_generated/api";
import { ActionCtx, httpAction } from "./_generated/server";

async function handleCheckoutSessionCompleted(
  ctx: ActionCtx,
  checkoutSession: Stripe.Checkout.Session
) {
  // check if stripe key is set
  if (!process.env.STRIPE_KEY) {
    throw new ConvexError({
      code: "StripeKeyNotSet",
      message: "Stripe key is not set",
    });
  }
  const stripe = new Stripe(process.env.STRIPE_KEY);

  if (!checkoutSession.customer_details?.email) {
    throw new ConvexError({
      code: "email is not set",
      message: "email is not set",
    });
  }
  const email = checkoutSession.customer_details?.email;

  const profile = await ctx.runQuery(internal.userProfiles.getByEmailInternal, { email });
  if (!isDefined(profile)) {
    throw new ConvexError({
      code: "UserNotFound",
      message: "User not found",
    });
  }

  // only handle if amount_subtotal is 960, i.e. $9.6 for extra 60 minutes
  if (checkoutSession.amount_subtotal !== 960) {
    console.log("payment received, but not $9.6, skipping");
    return;
  }
  if (profile.subscriptionStatus !== "active") {
    throw new ConvexError({
      code: "SubscriptionNotActive",
      message: "Subscription is not active",
    });
  }
  // only handle if subscription is active
  if (profile.subscriptionStatus === "active") {
    await ctx.runMutation(internal.userProfiles.updateSubscriptionByEmailInternal, {
      email: profile.email,
      planName: profile.subscription,
      minutesRemaining: profile.minutesRemaining! + 60,
    });
  } else {
    throw new ConvexError({
      code: "SubscriptionNotActive",
      message: "Subscription is not active",
    });
  }
}

async function handleSubscriptionUpdate(ctx: ActionCtx, subscription: Stripe.Subscription) {
  // check if stripe key is set
  if (!process.env.STRIPE_KEY) {
    throw new ConvexError({
      code: "StripeKeyNotSet",
      message: "Stripe key is not set",
    });
  }
  const stripe = new Stripe(process.env.STRIPE_KEY);

  const { status, current_period_end, current_period_start } = subscription;
  const customer = (await stripe.customers.retrieve(
    subscription.customer as string
  )) as Stripe.Customer;

  if (subscription.items.data.length > 1) {
    throw new ConvexError({
      code: "SubscriptionItemsMultiple",
      message: "Subscription items are multiple",
    });
  }
  const product = (await stripe.products.retrieve(
    subscription.items.data[0].plan.product as string
  )) as Stripe.Product;
  const interval = subscription.items.data[0].plan.interval;
  const user = await ctx.runQuery(internal.userProfiles.getByEmailInternal, {
    email: customer.email!,
  });
  if (!isDefined(user)) {
    throw new ConvexError({
      code: "UserNotFound",
      message: "User not found",
    });
  }
  const tier = product.name.toLowerCase() as "basic" | "premium";

  if (!["basic", "premium"].includes(tier)) {
    throw new ConvexError({
      code: "InvalidProductName",
      message: "Invalid product name",
    });
  }

  const pricing = await ctx.runQuery(internal.pricings.getPricingsInternal, { tier });
  if (!isDefined(pricing)) {
    throw new ConvexError({
      code: "PricingNotFound",
      message: "Pricing not found",
    });
  }
  
  const { price, evalCount, minutes } = pricing;
  console.log("tier", product.name);
  console.log("price", price);
  console.log("evalCount", evalCount);
  console.log("minutes", minutes);
  console.log("subscription", subscription);

  const premiumPricing = await ctx.runQuery(internal.pricings.getPricingsInternal, {
    tier: "premium",
  });
  const basicPricing = await ctx.runQuery(internal.pricings.getPricingsInternal, {
    tier: "basic",
  });
  const premiumMinutes = premiumPricing!.minutes;
  const basicMinutes = basicPricing!.minutes;

  // payment successful
  if (status === "active") {
    const refreshDate =
      interval === "month" ? current_period_end : get30DaysFromNowInSeconds(current_period_start);
    let minutesRemaining = user.minutesRemaining || 0;
    if (user.subscriptionStatus !== "active") {
      // new subscription or returning from cancelled
      minutesRemaining += minutes;
    } else if (user.subscriptionStatus === "active") {
      if (user.subscription === "basic" && tier === "premium") {
        // user is upgrading
        minutesRemaining += premiumMinutes - basicMinutes;
      } else if (user.subscription === "premium" && tier === "basic") {
        // user is downgrading
        minutesRemaining -= premiumMinutes - basicMinutes;
      } else if (user.subscription === tier) {
        // no change in plan
        minutesRemaining += minutes;
      }
    }
    await ctx.runMutation(internal.userProfiles.updateSubscriptionByEmailInternal, {
      email: customer.email!,
      planName: tier,
      minutesRemaining,
      interval,
      refreshDate,
      currentPeriodEnd: current_period_end,
      currentPeriodStart: current_period_start,
      latestSubscriptionId: subscription.id,
      subscriptionStatus: status,
    });
  } else {
    // payment failed or subscription cancelled
    // await ctx.runMutation(internal.userProfiles.updateSubscriptionByEmailInternal, {
    //   email: customer.email!,
    //   planName: "free",
    //   minutesRemaining: 0,
    //   interval: undefined,
    //   refreshDate: undefined,
    //   currentPeriodEnd: undefined,
    //   currentPeriodStart: undefined,
    //   latestSubscriptionId: subscription.id,
    //   subscriptionStatus: status,
    // });
    console.log("payment failed or subscription cancelled, do nothing", subscription);
  } 
}

async function handleSubscriptionDeleted(ctx: ActionCtx, subscription: Stripe.Subscription) {
  // check if stripe key is set
  if (!process.env.STRIPE_KEY) {
    throw new ConvexError({
      code: "StripeKeyNotSet",
      message: "Stripe key is not set",
    });
  }
  const stripe = new Stripe(process.env.STRIPE_KEY);

  if (!subscription.customer) {
    throw new ConvexError({
      code: "SubscriptionCustomerNotSet",
      message: "Subscription customer is not set",
    });
  }

  const customer = (await stripe.customers.retrieve(
    subscription.customer as string
  )) as Stripe.Customer;

  if (!customer.email) {
    throw new ConvexError({
      code: "SubscriptionCustomerEmailNotSet",
      message: "Subscription customer email is not set",
    });
  }

  await ctx.runMutation(internal.userProfiles.voidSubscriptionInternal, {
    email: customer.email,
  });
}

export const stripeWebhookHandler = httpAction(async (ctx, req) => {
  const body = await req.json();

  switch (body.type) {
    case "checkout.session.completed":
      console.log("received checkout.session.completed event", body);
      const checkoutSession = body.data.object;
      await handleCheckoutSessionCompleted(ctx, checkoutSession);
      break;
    case "customer.subscription.updated":
      console.log("received customer.subscription.updated event", body);
      const subscription = body.data.object;
      await handleSubscriptionUpdate(ctx, subscription);
      break;
    case "customer.subscription.deleted":
      console.log("received customer.subscription.deleted event", body);
      await handleSubscriptionDeleted(ctx, body.data.object);
      break;
    default:
      console.log(`Unhandled event type ${body.type}`);
  }

  // Return a response to acknowledge receipt of the event
  return new Response(JSON.stringify({ received: true }), { status: 200 });
});
