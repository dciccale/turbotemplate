import { StripeSubscriptions } from "@convex-dev/stripe";
import type { Locale } from "@turbotemplate/i18n";
import { ConvexError, v } from "convex/values";
import StripeSDK from "stripe";
import { components } from "./_generated/api";
import {
  type ActionCtx,
  action,
  type QueryCtx,
  query,
} from "./_generated/server";
import {
  appReturnUrl,
  checkoutLocale,
  portalParameters,
} from "./billingLocale";
import { localeValidator } from "./validators";

const stripeClient = new StripeSubscriptions(components.stripe, {});
const STRIPE_PAGINATION_LIMIT = 100;

type CurrentUser = {
  userId: string;
  email?: string;
  name?: string;
};

type CurrentUserBillingContext = {
  customerId?: string;
  subscription?: {
    stripeSubscriptionId: string;
    stripeCustomerId: string;
    status: string;
    currentPeriodEnd: number;
    cancelAtPeriodEnd: boolean;
    cancelAt?: number;
    priceId: string;
    quantity?: number;
    metadata?: unknown;
    orgId?: string;
    userId?: string;
  } | null;
};

type StripeCatalogProduct = {
  stripeProductId: string;
  stripePriceId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  active: boolean;
  sortOrder: number;
  mode: "payment" | "subscription";
  unitAmount: number;
  currency: string;
  interval?: string;
  intervalCount?: number;
};

const stripeCatalogProductValidator = v.object({
  stripeProductId: v.string(),
  stripePriceId: v.string(),
  name: v.string(),
  description: v.optional(v.string()),
  imageUrl: v.optional(v.string()),
  active: v.boolean(),
  sortOrder: v.number(),
  mode: v.union(v.literal("payment"), v.literal("subscription")),
  unitAmount: v.number(),
  currency: v.string(),
  interval: v.optional(v.string()),
  intervalCount: v.optional(v.number()),
});

const stripeInvoiceSummaryValidator = v.object({
  stripeInvoiceId: v.string(),
  stripeCustomerId: v.string(),
  stripeSubscriptionId: v.optional(v.string()),
  status: v.string(),
  amountDue: v.number(),
  amountPaid: v.number(),
  created: v.number(),
  currency: v.string(),
  number: v.optional(v.string()),
});

async function requireCurrentUser(
  ctx: ActionCtx | QueryCtx,
): Promise<CurrentUser> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError({ code: "UNAUTHENTICATED" });
  }

  return {
    userId: identity.subject,
    email: identity.email ?? undefined,
    name: identity.name ?? undefined,
  };
}

function metadataValue(
  metadata: StripeSDK.Metadata | null | undefined,
  key: string,
): string | undefined {
  const value = metadata?.[key];
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function parseBoolean(raw: string | undefined, fallback = false): boolean {
  if (!raw) {
    return fallback;
  }

  const normalized = raw.trim().toLowerCase();
  if (normalized === "true" || normalized === "1" || normalized === "yes") {
    return true;
  }
  if (normalized === "false" || normalized === "0" || normalized === "no") {
    return false;
  }

  return fallback;
}

function isCheckoutEnabled(
  metadata: StripeSDK.Metadata | null | undefined,
): boolean {
  return parseBoolean(metadataValue(metadata, "checkout_enabled"), true);
}

function intervalPriority(interval?: string | null): number {
  if (interval === "month") return 0;
  if (interval === "year") return 1;
  if (interval === "week") return 2;
  if (interval === "day") return 3;
  if (!interval) return 10;
  return 99;
}

function isManagedSubscriptionStatus(status: string): boolean {
  const normalized = status.trim().toLowerCase();
  return (
    normalized === "active" ||
    normalized === "trialing" ||
    normalized === "past_due"
  );
}

function asActiveProduct(
  product: StripeSDK.Product | StripeSDK.DeletedProduct,
): StripeSDK.Product {
  if ("deleted" in product && product.deleted) {
    throw new ConvexError({ code: "PRODUCT_UNAVAILABLE" });
  }
  return product;
}

async function listAllProducts(
  stripe: StripeSDK,
): Promise<StripeSDK.Product[]> {
  const all: StripeSDK.Product[] = [];
  let startingAfter: string | undefined;

  while (true) {
    const page = await stripe.products.list({
      limit: STRIPE_PAGINATION_LIMIT,
      starting_after: startingAfter,
    });
    all.push(...page.data);

    if (!page.has_more) {
      break;
    }

    const last = page.data[page.data.length - 1];
    if (!last) {
      break;
    }
    startingAfter = last.id;
  }

  return all;
}

async function listAllPricesForProduct(
  stripe: StripeSDK,
  productId: string,
): Promise<StripeSDK.Price[]> {
  const all: StripeSDK.Price[] = [];
  let startingAfter: string | undefined;

  while (true) {
    const page = await stripe.prices.list({
      product: productId,
      limit: STRIPE_PAGINATION_LIMIT,
      starting_after: startingAfter,
    });
    all.push(...page.data);

    if (!page.has_more) {
      break;
    }

    const last = page.data[page.data.length - 1];
    if (!last) {
      break;
    }
    startingAfter = last.id;
  }

  return all;
}

function chooseCheckoutPrice(
  product: StripeSDK.Product,
  prices: StripeSDK.Price[],
): StripeSDK.Price | null {
  const eligible = prices.filter((price) => {
    if (!price.active) return false;
    if (!isCheckoutEnabled(price.metadata)) return false;
    return true;
  });

  if (eligible.length === 0) {
    return null;
  }

  const explicitDefault = eligible.find((price) =>
    parseBoolean(metadataValue(price.metadata, "checkout_default"), false),
  );
  if (explicitDefault) {
    return explicitDefault;
  }

  const defaultPriceId =
    typeof product.default_price === "string"
      ? product.default_price
      : product.default_price?.id;
  if (defaultPriceId) {
    const defaultPrice = eligible.find((price) => price.id === defaultPriceId);
    if (defaultPrice) {
      return defaultPrice;
    }
  }

  return (
    [...eligible].sort((a, b) => {
      const recurringRank = Number(!a.recurring) - Number(!b.recurring);
      if (recurringRank !== 0) {
        return recurringRank;
      }

      const intervalRank =
        intervalPriority(a.recurring?.interval) -
        intervalPriority(b.recurring?.interval);
      if (intervalRank !== 0) {
        return intervalRank;
      }

      const intervalCount =
        (a.recurring?.interval_count ?? 1) - (b.recurring?.interval_count ?? 1);
      if (intervalCount !== 0) {
        return intervalCount;
      }

      return (
        (a.unit_amount ?? Number.MAX_SAFE_INTEGER) -
        (b.unit_amount ?? Number.MAX_SAFE_INTEGER)
      );
    })[0] ?? null
  );
}

function catalogProductFromStripe(
  product: StripeSDK.Product,
  price: StripeSDK.Price,
): StripeCatalogProduct | null {
  if (!Number.isFinite(price.unit_amount)) {
    return null;
  }

  const sortOrderRaw = metadataValue(product.metadata, "ui_sort_order");
  const parsedSortOrder = sortOrderRaw
    ? Number.parseInt(sortOrderRaw, 10)
    : NaN;

  return {
    stripeProductId: product.id,
    stripePriceId: price.id,
    name: product.name,
    description: product.description ?? undefined,
    imageUrl: product.images[0] ?? undefined,
    active: Boolean(product.active && price.active),
    sortOrder:
      Number.isFinite(parsedSortOrder) && parsedSortOrder >= 0
        ? parsedSortOrder
        : product.created,
    mode: price.recurring ? "subscription" : "payment",
    unitAmount: price.unit_amount ?? 0,
    currency: price.currency.toLowerCase(),
    interval: price.recurring?.interval,
    intervalCount: price.recurring?.interval_count ?? undefined,
  };
}

async function fetchCatalogProducts(): Promise<StripeCatalogProduct[]> {
  const stripe = new StripeSDK(stripeClient.apiKey);
  const products = await listAllProducts(stripe);

  const catalog: StripeCatalogProduct[] = [];
  for (const product of products) {
    if (!product.active) continue;
    if (!isCheckoutEnabled(product.metadata)) continue;

    const prices = await listAllPricesForProduct(stripe, product.id);
    const price = chooseCheckoutPrice(product, prices);
    if (!price) continue;

    const catalogProduct = catalogProductFromStripe(product, price);
    if (!catalogProduct) continue;

    catalog.push(catalogProduct);
  }

  return catalog.sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) {
      return a.sortOrder - b.sortOrder;
    }
    return a.unitAmount - b.unitAmount;
  });
}

async function getStripePriceAndProduct(
  stripe: StripeSDK,
  priceId: string,
): Promise<{
  price: StripeSDK.Price;
  product: StripeSDK.Product;
  mode: "payment" | "subscription";
}> {
  const price = await stripe.prices.retrieve(priceId, {
    expand: ["product"],
  });

  if (!price.active) {
    throw new ConvexError({ code: "PRICE_UNAVAILABLE" });
  }
  if (!isCheckoutEnabled(price.metadata)) {
    throw new ConvexError({ code: "PRICE_UNAVAILABLE" });
  }

  const product =
    typeof price.product === "string"
      ? asActiveProduct(await stripe.products.retrieve(price.product))
      : asActiveProduct(price.product);

  if (!product.active || !isCheckoutEnabled(product.metadata)) {
    throw new ConvexError({ code: "PRODUCT_UNAVAILABLE" });
  }

  return {
    price,
    product,
    mode: price.recurring ? "subscription" : "payment",
  };
}

async function createCheckoutForUser(
  ctx: ActionCtx,
  args: {
    currentUser: CurrentUser;
    priceId: string;
    successUrl: string;
    cancelUrl: string;
    locale: Locale;
    expectedMode?: "payment" | "subscription";
  },
) {
  const stripe = new StripeSDK(stripeClient.apiKey);
  const { mode } = await getStripePriceAndProduct(stripe, args.priceId);

  if (args.expectedMode && mode !== args.expectedMode) {
    throw new ConvexError({
      code: "INVALID_PRICE_MODE",
      mode: args.expectedMode,
    });
  }

  const customer = await stripeClient.getOrCreateCustomer(ctx, {
    userId: args.currentUser.userId,
    email: args.currentUser.email,
    name: args.currentUser.name,
  });

  const metadata = {
    userId: args.currentUser.userId,
  };

  return await stripeClient.createCheckoutSession(ctx, {
    priceId: args.priceId,
    params: checkoutLocale(args.locale),
    customerId: customer.customerId,
    mode,
    successUrl: appReturnUrl(args.successUrl),
    cancelUrl: appReturnUrl(args.cancelUrl),
    metadata,
    subscriptionMetadata: mode === "subscription" ? metadata : undefined,
    paymentIntentMetadata: mode === "payment" ? metadata : undefined,
  });
}

async function resolveCurrentUserBillingContext(
  ctx: Pick<ActionCtx, "runQuery">,
  currentUser: CurrentUser,
): Promise<CurrentUserBillingContext> {
  const subscriptions = await ctx.runQuery(
    components.stripe.public.listSubscriptionsByUserId,
    { userId: currentUser.userId },
  );
  const sortedSubscriptions = [...subscriptions].sort(
    (a, b) => b.currentPeriodEnd - a.currentPeriodEnd,
  );
  const subscription =
    sortedSubscriptions.find((candidate) =>
      isManagedSubscriptionStatus(candidate.status),
    ) ??
    sortedSubscriptions[0] ??
    null;

  if (subscription?.stripeCustomerId) {
    return {
      customerId: subscription.stripeCustomerId,
      subscription,
    };
  }

  const payments = await ctx.runQuery(
    components.stripe.public.listPaymentsByUserId,
    {
      userId: currentUser.userId,
    },
  );
  const paymentCustomer = payments.find(
    (payment) => typeof payment.stripeCustomerId === "string",
  );

  return {
    customerId: paymentCustomer?.stripeCustomerId,
    subscription,
  };
}

async function listStripeInvoicesForCustomer(
  stripe: StripeSDK,
  customerId: string,
): Promise<StripeSDK.Invoice[]> {
  const all: StripeSDK.Invoice[] = [];
  let startingAfter: string | undefined;

  while (true) {
    const page = await stripe.invoices.list({
      customer: customerId,
      limit: STRIPE_PAGINATION_LIMIT,
      starting_after: startingAfter,
    });
    all.push(...page.data);

    if (!page.has_more) {
      break;
    }

    const last = page.data[page.data.length - 1];
    if (!last) {
      break;
    }
    startingAfter = last.id;
  }

  return all;
}

function defaultAppDashboardUrl() {
  const appOrigin = process.env.APP_ORIGIN ?? "http://localhost:3000";
  return `${appOrigin.replace(/\/$/, "")}/app`;
}

export const listSubscriptionsForCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const subscriptions = await ctx.runQuery(
      components.stripe.public.listSubscriptionsByUserId,
      { userId: identity.subject },
    );

    return [...subscriptions].sort(
      (a, b) => b.currentPeriodEnd - a.currentPeriodEnd,
    );
  },
});

export const listAvailableProducts = action({
  args: {},
  returns: v.array(stripeCatalogProductValidator),
  handler: async (ctx) => {
    await requireCurrentUser(ctx);
    return await fetchCatalogProducts();
  },
});

export const listInvoicesForCurrentUser = action({
  args: {},
  returns: v.array(stripeInvoiceSummaryValidator),
  handler: async (ctx) => {
    const currentUser = await requireCurrentUser(ctx);
    const billingContext = await resolveCurrentUserBillingContext(
      ctx,
      currentUser,
    );
    if (!billingContext.customerId) {
      return [];
    }
    const customerId = billingContext.customerId;

    const stripe = new StripeSDK(stripeClient.apiKey);
    const stripeInvoices = await listStripeInvoicesForCustomer(
      stripe,
      customerId,
    );
    const invoices = stripeInvoices.map((invoice) => ({
      stripeInvoiceId: invoice.id,
      stripeCustomerId:
        typeof invoice.customer === "string" ? invoice.customer : customerId,
      stripeSubscriptionId:
        typeof invoice.parent?.subscription_details?.subscription === "string"
          ? invoice.parent.subscription_details.subscription
          : invoice.parent?.subscription_details?.subscription?.id,
      status: invoice.status ?? "draft",
      amountDue: invoice.amount_due,
      amountPaid: invoice.amount_paid,
      created: invoice.created,
      currency: invoice.currency.toLowerCase(),
      number: invoice.number ?? undefined,
    }));

    return invoices.sort((a, b) => b.created - a.created);
  },
});

export const getInvoiceDownloadLink = action({
  args: { stripeInvoiceId: v.string() },
  returns: v.object({
    stripeInvoiceId: v.string(),
    hostedInvoiceUrl: v.optional(v.string()),
    invoicePdfUrl: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    const currentUser = await requireCurrentUser(ctx);
    const billingContext = await resolveCurrentUserBillingContext(
      ctx,
      currentUser,
    );
    if (!billingContext.customerId) {
      throw new ConvexError({ code: "INVOICE_NOT_FOUND" });
    }

    const stripe = new StripeSDK(stripeClient.apiKey);
    const stripeInvoice = await stripe.invoices.retrieve(args.stripeInvoiceId);
    const invoiceCustomerId =
      typeof stripeInvoice.customer === "string"
        ? stripeInvoice.customer
        : stripeInvoice.customer?.id;

    if (invoiceCustomerId !== billingContext.customerId) {
      throw new ConvexError({ code: "INVOICE_NOT_FOUND" });
    }

    return {
      stripeInvoiceId: args.stripeInvoiceId,
      hostedInvoiceUrl: stripeInvoice.hosted_invoice_url ?? undefined,
      invoicePdfUrl: stripeInvoice.invoice_pdf ?? undefined,
    };
  },
});

export const cancelSubscriptionForCurrentUser = action({
  args: {
    immediate: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const currentUser = await requireCurrentUser(ctx);
    const billingContext = await resolveCurrentUserBillingContext(
      ctx,
      currentUser,
    );
    const subscription = billingContext.subscription;

    if (!subscription || !isManagedSubscriptionStatus(subscription.status)) {
      throw new ConvexError({ code: "SUBSCRIPTION_NOT_FOUND" });
    }

    await stripeClient.cancelSubscription(ctx, {
      stripeSubscriptionId: subscription.stripeSubscriptionId,
      cancelAtPeriodEnd: !args.immediate,
    });

    return null;
  },
});

export const createCheckoutForCurrentUser = action({
  args: {
    priceId: v.string(),
    successUrl: v.string(),
    cancelUrl: v.string(),
    locale: localeValidator,
  },
  returns: v.object({
    sessionId: v.string(),
    url: v.union(v.string(), v.null()),
  }),
  handler: async (ctx, args) => {
    const currentUser = await requireCurrentUser(ctx);

    return await createCheckoutForUser(ctx, {
      currentUser,
      locale: args.locale,
      priceId: args.priceId,
      successUrl: args.successUrl,
      cancelUrl: args.cancelUrl,
    });
  },
});

export const createCustomerPortalSessionForCurrentUser = action({
  args: { returnUrl: v.string(), locale: localeValidator },
  returns: v.object({ url: v.string() }),
  handler: async (ctx, args) => {
    const currentUser = await requireCurrentUser(ctx);
    const customer = await stripeClient.getOrCreateCustomer(ctx, {
      userId: currentUser.userId,
      email: currentUser.email,
      name: currentUser.name,
    });

    const stripe = new StripeSDK(stripeClient.apiKey);
    const session = await stripe.billingPortal.sessions.create(
      portalParameters({
        customerId: customer.customerId,
        returnUrl: args.returnUrl,
        locale: args.locale,
      }),
    );
    return { url: session.url };
  },
});

export const createSubscriptionCheckout = action({
  args: { priceId: v.string(), locale: localeValidator },
  returns: v.object({
    sessionId: v.string(),
    url: v.union(v.string(), v.null()),
  }),
  handler: async (ctx, args) => {
    const currentUser = await requireCurrentUser(ctx);

    return await createCheckoutForUser(ctx, {
      currentUser,
      locale: args.locale,
      priceId: args.priceId,
      successUrl: `${defaultAppDashboardUrl()}?checkout=success`,
      cancelUrl: `${defaultAppDashboardUrl()}?checkout=canceled`,
      expectedMode: "subscription",
    });
  },
});

export const createPaymentCheckout = action({
  args: { priceId: v.string(), locale: localeValidator },
  returns: v.object({
    sessionId: v.string(),
    url: v.union(v.string(), v.null()),
  }),
  handler: async (ctx, args) => {
    const currentUser = await requireCurrentUser(ctx);

    return await createCheckoutForUser(ctx, {
      currentUser,
      locale: args.locale,
      priceId: args.priceId,
      successUrl: `${defaultAppDashboardUrl()}?checkout=success`,
      cancelUrl: `${defaultAppDashboardUrl()}?checkout=canceled`,
      expectedMode: "payment",
    });
  },
});
