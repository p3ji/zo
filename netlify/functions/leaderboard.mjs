import { getStore } from "@netlify/blobs";
import { createHandler } from "../lib/leaderboard-core.mjs";

export default createHandler(() => getStore({ name: "piano-pals-leaderboard", consistency: "strong" }));
