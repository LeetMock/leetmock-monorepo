import Stripe from "stripe";

import { get30DaysFromNowInSeconds, isDefined } from "@/lib/utils";
import { ConvexError } from "convex/values";
import { internal } from "./_generated/api";
import { ActionCtx, httpAction } from "./_generated/server";
import { SubscriptionTier } from "./schema";

const PRODUCT_NAMES = {
  EXTRA_MINUTES: "Extra 60 Mins",
  BASIC: "Basic Plan",
  PREMIUM: "Premium Plan",
} as const;

const ErrorCodes = {
  STRIPE_KEY_MISSING: "StripeKeyNotSet",
  USER_NOT_FOUND: "UserNotFound",
  INVALID_PRODUCT: "InvalidProduct",
  EMAIL_NOT_SET: "EmailNotSet",
  LINE_ITEMS_NOT_FOUND: "LineItemsNotFound",
  SUBSCRIPTION_NOT_PREMIUM: "SubscriptionNotPremium",
  SUBSCRIPTION_ITEMS_MULTIPLE: "SubscriptionItemsMultiple",
  INVALID_PRODUCT_NAME: "InvalidProductName",
  PRICING_NOT_FOUND: "PricingNotFound",
  SUBSCRIPTION_CUSTOMER_NOT_SET: "SubscriptionCustomerNotSet",
  SUBSCRIPTION_CUSTOMER_EMAIL_NOT_SET: "SubscriptionCustomerEmailNotSet",
} as const;

const getStripeClient = () => {
  if (!process.env.STRIPE_KEY) {
    throw new ConvexError({
      code: ErrorCodes.STRIPE_KEY_MISSING,
      message: "Stripe key is not set",
    });
  }
  return new Stripe(process.env.STRIPE_KEY);
};

const getPlanTransition = (from: string, to: string) => {
  console.log("from", from, "to", to);
  const transitions = {
    [`${SubscriptionTier.FREE}-${SubscriptionTier.PREMIUM}`]: "new-subscription",
    [`${SubscriptionTier.FREE}-${SubscriptionTier.BASIC}`]: "new-subscription",
    [`${SubscriptionTier.BASIC}-${SubscriptionTier.PREMIUM}`]: "upgrade",
    [`${SubscriptionTier.PREMIUM}-${SubscriptionTier.BASIC}`]: "downgrade",
    // Add other transitions as needed
  };
  return transitions[`${from}-${to}`] || "no-change";
};

function validateEmail(email?: string): string {
  if (!email?.trim()) {
    throw new ConvexError({
      code: ErrorCodes.EMAIL_NOT_SET,
      message: "Email is required for this operation",
    });
  }
  return email;
}

async function handleCheckoutSessionCompleted(
  ctx: ActionCtx,
  checkoutSession: Stripe.Checkout.Session
) {
  const stripe = getStripeClient();

  if (!checkoutSession.customer_details?.email) {
    throw new ConvexError({
      code: ErrorCodes.EMAIL_NOT_SET,
      message: "email is not set",
    });
  }
  const email = validateEmail(checkoutSession.customer_details?.email);

  const profile = await ctx.runQuery(internal.userProfiles.getByEmailInternal, {
    email,
  });
  if (!isDefined(profile)) {
    throw new ConvexError({
      code: ErrorCodes.USER_NOT_FOUND,
      message: "User not found",
    });
  }
  const lineItems = await stripe.checkout.sessions.listLineItems(checkoutSession.id);
  if (!lineItems.data.length) {
    throw new ConvexError({
      code: ErrorCodes.LINE_ITEMS_NOT_FOUND,
      message: "Line items not found",
    });
  }
  const product = await stripe.products.retrieve(lineItems.data[0].price?.product as string);
  if (product.name !== PRODUCT_NAMES.EXTRA_MINUTES) {
    console.log(
      `Payment received, but product name is not ${PRODUCT_NAMES.EXTRA_MINUTES}, skipping`
    );
    return;
  }
  if (profile.subscription !== "premium") {
    throw new ConvexError({
      code: ErrorCodes.SUBSCRIPTION_NOT_PREMIUM,
      message: "Subscription is not premium",
    });
  }

  await ctx.runMutation(internal.userProfiles.updateSubscriptionByEmailInternal, {
    email: profile.email,
    planName: profile.subscription,
    minutesRemaining: profile.minutesRemaining! + 60 * lineItems.data[0].quantity!,
  });
}

async function handleSubscriptionUpdate(ctx: ActionCtx, subscription: Stripe.Subscription) {
  const stripe = getStripeClient();

  const { status, current_period_end, current_period_start } = subscription;
  const customer = (await stripe.customers.retrieve(
    subscription.customer as string
  )) as Stripe.Customer;

  if (subscription.items.data.length > 1) {
    throw new ConvexError({
      code: ErrorCodes.SUBSCRIPTION_ITEMS_MULTIPLE,
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
      code: ErrorCodes.USER_NOT_FOUND,
      message: "User not found",
    });
  }
  const tier = product.name.toLowerCase() as "basic" | "premium";

  if (!["basic", "premium"].includes(tier)) {
    return;
  }

  const pricing = await ctx.runQuery(internal.pricings.getPricingsInternal, {
    tier,
  });
  if (!isDefined(pricing)) {
    throw new ConvexError({
      code: ErrorCodes.PRICING_NOT_FOUND,
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
  const premiumEvalCount = premiumPricing!.evalCount;
  const basicMinutes = basicPricing!.minutes;
  const basicEvalCount = basicPricing!.evalCount;
  if (status !== "active") {
    console.log("payment status", status, "do nothing", subscription);
    return;
  }

  const transitionType = getPlanTransition(user.subscription, tier);
  const minutesRemaining = user.minutesRemaining || 0;
  const evaluationCount = user.evaluationCount || 0;
  switch (transitionType) {
    case "new-subscription":
      console.log("user is subscribing from free plan");
      await ctx.runMutation(internal.userProfiles.updateSubscriptionByEmailInternal, {
        email: customer.email!,
        planName: tier,
        minutesRemaining: minutesRemaining + minutes,
        evaluationCount: evaluationCount + evalCount,
        interval,
        refreshDate:
          interval === "month"
            ? current_period_end
            : get30DaysFromNowInSeconds(current_period_start),
        currentPeriodEnd: current_period_end,
        currentPeriodStart: current_period_start,
        latestSubscriptionId: subscription.id,
        subscriptionStatus: status,
      });
      break;
    case "upgrade":
      console.log("user is upgrading");
      await ctx.runMutation(internal.userProfiles.updateSubscriptionByEmailInternal, {
        email: customer.email!,
        planName: tier,
        minutesRemaining: minutesRemaining + (premiumMinutes - basicMinutes),
        evaluationCount: evaluationCount + (premiumEvalCount - basicEvalCount),
        interval,
        refreshDate:
          interval === "month"
            ? current_period_end
            : get30DaysFromNowInSeconds(current_period_start),
        currentPeriodEnd: current_period_end,
        currentPeriodStart: current_period_start,
        latestSubscriptionId: subscription.id,
        subscriptionStatus: status,
      });
      break;
    case "downgrade":
      console.log("user is downgrading");
      await ctx.runMutation(internal.userProfiles.updateSubscriptionByEmailInternal, {
        email: customer.email!,
        planName: tier,
        minutesRemaining: minutesRemaining - (premiumMinutes - basicMinutes),
        evaluationCount: evaluationCount - (premiumEvalCount - basicEvalCount),
        interval,
        refreshDate:
          interval === "month"
            ? current_period_end
            : get30DaysFromNowInSeconds(current_period_start),
        currentPeriodEnd: current_period_end,
        currentPeriodStart: current_period_start,
        latestSubscriptionId: subscription.id,
        subscriptionStatus: status,
      });
      break;
    case "no-change":
      console.log("no change in plan, do nothing");
      break;
    default:
      console.log("unknown subscription, do nothing", user.subscription, tier);
  }
}

async function handleSubscriptionDeleted(ctx: ActionCtx, subscription: Stripe.Subscription) {
  const stripe = getStripeClient();

  if (!subscription.customer) {
    throw new ConvexError({
      code: ErrorCodes.SUBSCRIPTION_CUSTOMER_NOT_SET,
      message: "Subscription customer is not set",
    });
  }

  const customer = (await stripe.customers.retrieve(
    subscription.customer as string
  )) as Stripe.Customer;

  if (!customer.email) {
    throw new ConvexError({
      code: ErrorCodes.SUBSCRIPTION_CUSTOMER_EMAIL_NOT_SET,
      message: "Subscription customer email is not set",
    });
  }

  await ctx.runMutation(internal.userProfiles.voidSubscriptionInternal, {
    email: customer.email,
  });
}

export const stripeWebhookHandler = httpAction(async (ctx, req) => {
  const stripe = getStripeClient();

  const signature = req.headers.get("stripe-signature")!;

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    throw new ConvexError({
      code: ErrorCodes.STRIPE_KEY_MISSING,
      message: "Stripe webhook secret not configured",
    });
  }

  const body = await req.text();

  try {
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    switch (event.type) {
      case "checkout.session.completed":
        console.log("received checkout.session.completed event", event);
        const checkoutSession = event.data.object;
        await handleCheckoutSessionCompleted(ctx, checkoutSession);
        break;
      case "customer.subscription.updated":
      case "customer.subscription.created":
        console.log("received customer.subscription.updated/created event", event);
        const subscription = event.data.object;
        await handleSubscriptionUpdate(ctx, subscription);
        break;
      case "customer.subscription.deleted":
        console.log("received customer.subscription.deleted event", event);
        await handleSubscriptionDeleted(ctx, event.data.object);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }
});
