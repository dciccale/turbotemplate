import plunk from "@clipin/convex-plunk/convex.config.js";
import stripe from "@convex-dev/stripe/convex.config.js";
import { defineApp } from "convex/server";

const app = defineApp();
app.use(plunk);
app.use(stripe);

export default app;
