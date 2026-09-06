"use client";
import { Badge } from "@turbotemplate/ui/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@turbotemplate/ui/components/ui/card";
import { TrendingDown, TrendingUp } from "lucide-react";
import { useFormatter } from "next-intl";
import { Copy } from "@/components/copy";

export function SectionCards() {
  const format = useFormatter();
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>
            <Copy id="TotalRevenue" />
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {format.number(1250, { style: "currency", currency: "USD" })}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUp />
              {format.number(0.125, {
                style: "percent",
                maximumFractionDigits: 1,
                signDisplay: "always",
              })}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            <Copy id="TrendingUpThisMonth" />
            <TrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            <Copy id="VisitorsForTheLast6Months" />
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>
            <Copy id="NewCustomers" />
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {format.number(1234)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingDown />
              {format.number(-0.2, { style: "percent" })}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            <Copy id="Down20ThisPeriod" />
            <TrendingDown className="size-4" />
          </div>
          <div className="text-muted-foreground">
            <Copy id="AcquisitionNeedsAttention" />
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>
            <Copy id="ActiveAccounts" />
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {format.number(45678)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUp />
              {format.number(0.125, {
                style: "percent",
                maximumFractionDigits: 1,
                signDisplay: "always",
              })}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            <Copy id="StrongUserRetention" />
            <TrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            <Copy id="EngagementExceedTargets" />
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>
            <Copy id="GrowthRate" />
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {format.number(0.045, {
              style: "percent",
              maximumFractionDigits: 1,
            })}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUp />
              {format.number(0.045, {
                style: "percent",
                maximumFractionDigits: 1,
                signDisplay: "always",
              })}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            <Copy id="SteadyPerformanceIncrease" />
            <TrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            <Copy id="MeetsGrowthProjections" />
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
