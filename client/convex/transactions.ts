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

  const profile = await ctx.runQuery(internal.userProfiles.getByEmailInternal, {
    email,
  });
  if (!isDefined(profile)) {
    throw new ConvexError({
      code: "UserNotFound",
      message: "User not found",
    });
  }
  const lineItems = await stripe.checkout.sessions.listLineItems(
    checkoutSession.id
  );
  if (!lineItems.data.length) {
    throw new ConvexError({
      code: "LineItemsNotFound",
      message: "Line items not found",
    });
  }
  const product = await stripe.products.retrieve(
    lineItems.data[0].price?.product as string
  );
  if (product.name !== "Extra 60 Mins") {
    console.log(
      "payment received, but product nameis not Extra 60 Mins, skipping"
    );
    return;
  }
  if (profile.subscription !== "premium") {
    throw new ConvexError({
      code: "SubscriptionNotPremium",
      message: "Subscription is not premium",
    });
  }

  await ctx.runMutation(
    internal.userProfiles.updateSubscriptionByEmailInternal,
    {
      email: profile.email,
      planName: profile.subscription,
      minutesRemaining:
        profile.minutesRemaining! +
        60 * (lineItems.data[0].quantity!),
    }
  );
}

async function handleSubscriptionUpdate(
  ctx: ActionCtx,
  subscription: Stripe.Subscription
) {
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

  const pricing = await ctx.runQuery(internal.pricings.getPricingsInternal, {
    tier,
  });
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

  const premiumPricing = await ctx.runQuery(
    internal.pricings.getPricingsInternal,
    {
      tier: "premium",
    }
  );
  const basicPricing = await ctx.runQuery(
    internal.pricings.getPricingsInternal,
    {
      tier: "basic",
    }
  );
  const premiumMinutes = premiumPricing!.minutes;
  const premiumEvalCount = premiumPricing!.evalCount;
  const basicMinutes = basicPricing!.minutes;
  const basicEvalCount = basicPricing!.evalCount;
  if (status !== "active") {
    console.log("payment status", status, "do nothing", subscription);
    return;
  }

  // payment successful
  const refreshDate =
    interval === "month"
      ? current_period_end
      : get30DaysFromNowInSeconds(current_period_start);
  let minutesRemaining = user.minutesRemaining || 0;
  let evaluationCount = user.evaluationCount || 0;
  if (user.currentPeriodEnd && user.currentPeriodEnd < Date.now() / 1000) {
    console.log("subscription is expired, this is a renewal");
    minutesRemaining = minutes;
    evaluationCount = evalCount;
  } else {
    if (user.subscription === "free") {
      console.log("new subscription");
      minutesRemaining = minutes;
      evaluationCount = evalCount;
    } else if (user.subscription === "basic" && tier === "premium") {
      console.log("user is upgrading");
      minutesRemaining += premiumMinutes - basicMinutes;
      evaluationCount += premiumEvalCount - basicEvalCount;
    } else if (user.subscription === "premium" && tier === "basic") {
      console.log("user is downgrading");
      minutesRemaining -= premiumMinutes - basicMinutes;
      evaluationCount -= premiumEvalCount - basicEvalCount;
    } else if (user.subscription === tier) {
      console.log("no change in plan, do nothing");
    } else {
      console.log("unknown subscription, do nothing", user.subscription, tier);
    }
  }

  await ctx.runMutation(
    internal.userProfiles.updateSubscriptionByEmailInternal,
    {
      email: customer.email!,
      planName: tier,
      minutesRemaining,
      evaluationCount,
      interval,
      refreshDate,
      currentPeriodEnd: current_period_end,
      currentPeriodStart: current_period_start,
      latestSubscriptionId: subscription.id,
      subscriptionStatus: status,
    }
  );
}

async function handleSubscriptionDeleted(
  ctx: ActionCtx,
  subscription: Stripe.Subscription
) {
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
