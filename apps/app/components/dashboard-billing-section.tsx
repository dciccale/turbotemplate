"use client";

import { api } from "@turbotemplate/backend/api";

import {
  formatMoney as localizedMoney,
  parseLocale,
} from "@turbotemplate/i18n";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@turbotemplate/ui/components/ui/alert-dialog";
import { Badge } from "@turbotemplate/ui/components/ui/badge";
import { Button } from "@turbotemplate/ui/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@turbotemplate/ui/components/ui/card";
import { Skeleton } from "@turbotemplate/ui/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@turbotemplate/ui/components/ui/table";
import { useAction, useQuery } from "convex/react";
import {
  CreditCard,
  Download,
  ExternalLink,
  Loader2,
  Receipt,
  RefreshCcw,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Copy } from "@/components/copy";
import { billingIntervalKey, billingStatusKey } from "@/i18n/labels";

type BillingProduct = {
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

type BillingInvoice = {
  stripeInvoiceId: string;
  stripeCustomerId: string;
  stripeSubscriptionId?: string;
  status: string;
  amountDue: number;
  amountPaid: number;
  created: number;
  currency: string;
  number?: string;
};

function normalizeStatus(status: string) {
  return status.trim().toLowerCase();
}

function isActiveSubscriptionStatus(status: string) {
  const normalized = normalizeStatus(status);
  return (
    normalized === "active" ||
    normalized === "trialing" ||
    normalized === "past_due"
  );
}

function badgeClassNameForStatus(status: string) {
  const normalized = normalizeStatus(status);
  if (normalized === "paid" || normalized === "active") {
    return "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";
  }
  if (normalized === "trialing") {
    return "border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-400";
  }
  if (normalized === "past_due") {
    return "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-400";
  }
  if (normalized === "open" || normalized === "draft") {
    return "border-border bg-muted text-muted-foreground";
  }
  return "border-destructive/20 bg-destructive/10 text-destructive";
}

export function DashboardBillingSection() {
  const t = useTranslations("billing");
  const locale = parseLocale(useLocale()) ?? "en";
  const format = useFormatter();
  const formatMoney = (amount: number, currency: string) =>
    localizedMoney(amount, currency, locale);
  const formatInvoiceDate = (seconds: number) =>
    format.dateTime(new Date(seconds * 1000), {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  const statusLabel = (status: string) => t(billingStatusKey(status));
  const formatProductPrice = (product: BillingProduct) => {
    const amount = formatMoney(product.unitAmount, product.currency);
    const count = product.intervalCount ?? 1;
    const interval = billingIntervalKey(product.interval);
    return product.mode === "payment"
      ? amount
      : t("recurringPrice", {
          amount,
          count,
          interval: t(interval, { count }),
        });
  };
  const toUserFacingBillingError = (_error: unknown, fallback: string) =>
    fallback;
  const searchParams = useSearchParams();
  const checkoutState = searchParams.get("checkout");
  const checkoutHandledRef = useRef<string | null>(null);
  const latestRefreshRef = useRef(0);

  const subscriptions = useQuery(
    api.stripe.listSubscriptionsForCurrentUser,
    {},
  );
  const listAvailableProducts = useAction(api.stripe.listAvailableProducts);
  const listInvoicesForCurrentUser = useAction(
    api.stripe.listInvoicesForCurrentUser,
  );
  const createCustomerPortalSessionForCurrentUser = useAction(
    api.stripe.createCustomerPortalSessionForCurrentUser,
  );
  const cancelSubscriptionForCurrentUser = useAction(
    api.stripe.cancelSubscriptionForCurrentUser,
  );
  const getInvoiceDownloadLink = useAction(api.stripe.getInvoiceDownloadLink);

  const [products, setProducts] = useState<BillingProduct[]>([]);
  const [invoices, setInvoices] = useState<BillingInvoice[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingInvoices, setLoadingInvoices] = useState(true);
  const [productsError, setProductsError] = useState<
    "loadProducts" | "loadInvoices" | null
  >(null);
  const [invoicesError, setInvoicesError] = useState<
    "loadProducts" | "loadInvoices" | null
  >(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<
    string | null
  >(null);
  const [openingPortal, setOpeningPortal] = useState(false);
  const [cancelNowOpen, setCancelNowOpen] = useState(false);
  const [cancelingNow, setCancelingNow] = useState(false);

  useEffect(() => {
    let cancelled = false;
    latestRefreshRef.current = refreshToken;
    setLoadingProducts(true);
    setProductsError(null);

    void (async (runToken: number) => {
      const result = await listAvailableProducts();
      if (cancelled || runToken !== latestRefreshRef.current) return;

      setProducts(
        [...result].sort((a, b) => {
          if (a.sortOrder !== b.sortOrder) {
            return a.sortOrder - b.sortOrder;
          }
          return a.unitAmount - b.unitAmount;
        }),
      );
    })(refreshToken)
      .catch(() => {
        if (cancelled) return;
        setProductsError("loadProducts");
      })
      .finally(() => {
        if (cancelled) return;
        setLoadingProducts(false);
      });

    return () => {
      cancelled = true;
    };
  }, [listAvailableProducts, refreshToken]);

  useEffect(() => {
    let cancelled = false;
    latestRefreshRef.current = refreshToken;
    setLoadingInvoices(true);
    setInvoicesError(null);

    void (async (runToken: number) => {
      const result = await listInvoicesForCurrentUser();
      if (cancelled || runToken !== latestRefreshRef.current) return;

      setInvoices([...result].sort((a, b) => b.created - a.created));
    })(refreshToken)
      .catch(() => {
        if (cancelled) return;
        setInvoicesError("loadInvoices");
      })
      .finally(() => {
        if (cancelled) return;
        setLoadingInvoices(false);
      });

    return () => {
      cancelled = true;
    };
  }, [listInvoicesForCurrentUser, refreshToken]);

  useEffect(() => {
    if (!checkoutState) return;
    if (checkoutHandledRef.current === checkoutState) return;

    checkoutHandledRef.current = checkoutState;

    if (checkoutState === "success") {
      toast.success(t("checkoutComplete"));
      setRefreshToken((current) => current + 1);
    } else if (checkoutState === "canceled") {
      toast.message(t("checkoutCanceled"));
    }

    const next = new URL(window.location.href);
    next.searchParams.delete("checkout");
    window.history.replaceState({}, "", `${next.pathname}${next.search}`);
  }, [checkoutState, t]);

  const sortedSubscriptions = subscriptions
    ? [...subscriptions].sort((a, b) => b.currentPeriodEnd - a.currentPeriodEnd)
    : [];
  const activeSubscription =
    sortedSubscriptions.find((subscription) =>
      isActiveSubscriptionStatus(subscription.status),
    ) ??
    sortedSubscriptions[0] ??
    null;
  const activeProduct = activeSubscription
    ? (products.find(
        (product) => product.stripePriceId === activeSubscription.priceId,
      ) ?? null)
    : null;
  const hasManagedSubscription = activeSubscription
    ? isActiveSubscriptionStatus(activeSubscription.status)
    : false;
  const scheduledCancellationDate =
    activeSubscription?.cancelAt ?? activeSubscription?.currentPeriodEnd;
  const lastInvoice = invoices[0] ?? null;

  const handleRefresh = () => {
    setRefreshToken((current) => current + 1);
  };

  const handleOpenPortal = async () => {
    setOpeningPortal(true);

    try {
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.delete("checkout");

      const result = await createCustomerPortalSessionForCurrentUser({
        returnUrl: currentUrl.toString(),
        locale,
      });

      window.location.href = result.url;
    } catch (error) {
      toast.error(toUserFacingBillingError(error, t("openPortalError")));
      setOpeningPortal(false);
    }
  };

  const handleCancelNow = async () => {
    setCancelingNow(true);

    try {
      await cancelSubscriptionForCurrentUser({ immediate: true });
      toast.success(t("canceled"));
      setCancelNowOpen(false);
      setRefreshToken((current) => current + 1);
    } catch (error) {
      toast.error(toUserFacingBillingError(error, t("cancelError")));
    } finally {
      setCancelingNow(false);
    }
  };

  const handleDownloadInvoice = async (stripeInvoiceId: string) => {
    setDownloadingInvoiceId(stripeInvoiceId);

    try {
      const result = await getInvoiceDownloadLink({ stripeInvoiceId });
      const url = result.invoicePdfUrl ?? result.hostedInvoiceUrl;
      if (!url) {
        toast.error(t("pdfUnavailable"));
        return;
      }

      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      toast.error(toUserFacingBillingError(error, t("downloadError")));
    } finally {
      setDownloadingInvoiceId((current) =>
        current === stripeInvoiceId ? null : current,
      );
    }
  };

  return (
    <section id="billing" className="space-y-4 px-4 lg:px-6">
      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="size-4" />
              <Copy id="BillingDashboard" />
            </CardTitle>
            <CardDescription>
              <Copy id="ViewYourCurrentPlanManageItInTheStripePortalAndDownloadInvoicePdfs" />
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border bg-muted/20 p-4">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                <Copy id="CurrentPlan" />
              </div>
              <div className="mt-2 text-lg font-semibold">
                {activeProduct?.name ??
                  (activeSubscription
                    ? activeSubscription.priceId
                    : t("noSubscription"))}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                {activeProduct
                  ? formatProductPrice(activeProduct)
                  : activeSubscription
                    ? t("priceId", { id: activeSubscription.priceId })
                    : t("noLinkedSubscription")}
              </div>
            </div>
            <div className="rounded-xl border bg-muted/20 p-4">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                <Copy id="SubscriptionStatus" />
              </div>
              <div className="mt-2 text-lg font-semibold">
                {activeSubscription
                  ? statusLabel(activeSubscription.status)
                  : t("inactive")}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                {activeSubscription?.cancelAtPeriodEnd &&
                scheduledCancellationDate
                  ? t("endDate", {
                      date: formatInvoiceDate(scheduledCancellationDate),
                    })
                  : activeSubscription
                    ? t("renewDate", {
                        date: formatInvoiceDate(
                          activeSubscription.currentPeriodEnd,
                        ),
                      })
                    : t("portalHelp")}
              </div>
            </div>
            <div className="rounded-xl border bg-muted/20 p-4">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                <Copy id="LatestInvoice" />
              </div>
              <div className="mt-2 text-lg font-semibold">
                {lastInvoice
                  ? formatMoney(
                      lastInvoice.amountPaid || lastInvoice.amountDue,
                      lastInvoice.currency,
                    )
                  : t("noInvoices")}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                {lastInvoice
                  ? `${formatInvoiceDate(lastInvoice.created)} · ${statusLabel(lastInvoice.status)}`
                  : t("invoiceHelp")}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <Copy id="Subscription" />
            </CardTitle>
            <CardDescription>
              <Copy id="ManageYourSubscriptionFromStripeWithCurrentCancellationStateMirroredHere" />
            </CardDescription>
            <CardAction>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={loadingInvoices || loadingProducts}
              >
                <RefreshCcw />
                <Copy id="Refresh" />
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-4">
            {subscriptions === undefined ? (
              <Skeleton className="h-24 rounded-xl" />
            ) : activeSubscription ? (
              <div className="space-y-3 rounded-xl border bg-muted/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-medium">
                      {activeProduct?.name ?? activeSubscription.priceId}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {activeSubscription.cancelAtPeriodEnd &&
                      scheduledCancellationDate
                        ? t("endDate", {
                            date: formatInvoiceDate(scheduledCancellationDate),
                          })
                        : t("renewDate", {
                            date: formatInvoiceDate(
                              activeSubscription.currentPeriodEnd,
                            ),
                          })}
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={badgeClassNameForStatus(
                      activeSubscription.status,
                    )}
                  >
                    {statusLabel(activeSubscription.status)}
                  </Badge>
                </div>
                {activeSubscription.cancelAtPeriodEnd ? (
                  <p className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-300">
                    {t("cancelScheduled", {
                      date: scheduledCancellationDate
                        ? formatInvoiceDate(scheduledCancellationDate)
                        : t("nextBillingDate"),
                    })}
                  </p>
                ) : null}
                {productsError ? (
                  <p className="text-sm text-muted-foreground">
                    <Copy id="CouldNotLoadPlanCatalogMetadataStripePortalAccessStillWorks" />
                  </p>
                ) : null}
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    className="flex-1"
                    variant="outline"
                    onClick={handleOpenPortal}
                    disabled={openingPortal}
                  >
                    {openingPortal ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <ExternalLink />
                    )}
                    <Copy id="OpenBillingPortal" />
                  </Button>
                  {hasManagedSubscription ? (
                    <Button
                      className="flex-1"
                      variant="destructive"
                      onClick={() => setCancelNowOpen(true)}
                      disabled={cancelingNow}
                    >
                      {cancelingNow ? (
                        <Loader2 className="animate-spin" />
                      ) : null}
                      <Copy id="CancelNow" />
                    </Button>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                <Copy id="NoActiveSubscriptionFoundForThisAccount" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="size-4" />
            <Copy id="Invoices" />
          </CardTitle>
          <CardDescription>
            <Copy id="DownloadStripeHostedInvoicePdfsForCompletedBillingEvents" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingInvoices ? (
            <div className="space-y-3">
              {[
                "invoice-skeleton-1",
                "invoice-skeleton-2",
                "invoice-skeleton-3",
                "invoice-skeleton-4",
              ].map((key) => (
                <Skeleton key={key} className="h-10 w-full rounded-lg" />
              ))}
            </div>
          ) : invoicesError ? (
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
              {t(invoicesError)}
            </div>
          ) : invoices.length === 0 ? (
            <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
              <Copy id="NoInvoicesFoundForThisUserYet" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Copy id="Invoice" />
                  </TableHead>
                  <TableHead>
                    <Copy id="Date" />
                  </TableHead>
                  <TableHead>
                    <Copy id="Status" />
                  </TableHead>
                  <TableHead>
                    <Copy id="Amount" />
                  </TableHead>
                  <TableHead className="text-right">
                    <Copy id="Download" />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.stripeInvoiceId}>
                    <TableCell>
                      <div className="font-medium">
                        {invoice.number ?? invoice.stripeInvoiceId}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {invoice.stripeInvoiceId}
                      </div>
                    </TableCell>
                    <TableCell>{formatInvoiceDate(invoice.created)}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={badgeClassNameForStatus(invoice.status)}
                      >
                        {statusLabel(invoice.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatMoney(
                        invoice.amountPaid || invoice.amountDue,
                        invoice.currency,
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleDownloadInvoice(invoice.stripeInvoiceId)
                        }
                        disabled={
                          downloadingInvoiceId === invoice.stripeInvoiceId
                        }
                      >
                        {downloadingInvoiceId === invoice.stripeInvoiceId ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          <Download />
                        )}
                        <Copy id="Pdf" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={cancelNowOpen} onOpenChange={setCancelNowOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              <Copy id="CancelSubscriptionImmediately" />
            </AlertDialogTitle>
            <AlertDialogDescription>
              <Copy id="ThisEndsAccessNowInsteadOfWaitingForTheBillingPeriodToFinishStripeWillMarkTheSubscriptionA" />
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelingNow}>
              <Copy id="KeepIt" />
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleCancelNow}
              disabled={cancelingNow}
            >
              {cancelingNow ? <Loader2 className="animate-spin" /> : null}
              <Copy id="CancelNow" />
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
