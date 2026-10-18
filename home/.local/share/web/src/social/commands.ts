import { loadXConfig } from "../config.js";
import { fetchProfilePosts, watchlist, UA, type SocialPost } from "./profile.js";

// api.fxtwitter.com is a free public mirror: full post JSON with metrics, no login.
export async function socialPost(url: string, opts: { json?: boolean }): Promise<void> {
  const m = /(?:x|twitter)\.com\/([^/]+)\/status\/(\d+)/.exec(url);
  if (!m) throw new Error("Expected an x.com/twitter.com status URL");
  const api = `https://api.fxtwitter.com/${m[1]}/status/${m[2]}`;
  const res = await fetch(api, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`fxtwitter returned ${res.status}`);
  const body = (await res.json()) as { code: number; tweet?: Record<string, unknown> };
  if (body.code !== 200 || !body.tweet) throw new Error("fxtwitter: post not found");
  const t = body.tweet as Record<string, any>;
  if (opts.json) {
    console.log(JSON.stringify(t, null, 2));
    return;
  }
  const author = `${t.author?.name ?? ""} (@${t.author?.screen_name ?? m[1]})`;
  const stats = `❤ ${t.likes ?? "?"} · 🔁 ${t.reposts ?? "?"} · 💬 ${t.replies ?? "?"} · ${t.created_at ?? ""}`;
  const quote = t.quoted_tweet ? `\n> Quoting @${t.quoted_tweet.author?.screen_name}: ${String(t.quoted_tweet.text ?? "").slice(0, 200)}\n` : "";
  console.log(`# ${author}\n\n${t.text ?? ""}${quote}\n**${stats}**\n**URL:** https://x.com/${m[1]}/status/${m[2]}`);
}

export async function socialNews(opts: { limit: number; hours?: number; json?: boolean }): Promise<void> {
  const accounts = watchlist();
  const cutoff = opts.hours ? Date.now() - opts.hours * 3600_000 : 0;
  const settled = await Promise.allSettled(accounts.map((a) => fetchProfilePosts(a)));
  const posts: SocialPost[] = [];
  const failed: string[] = [];
  settled.forEach((s, i) => {
    if (s.status === "fulfilled") posts.push(...s.value);
    else failed.push(accounts[i]);
  });
  const ranked = posts
    .filter((p) => (p.createdAtMs ?? Infinity) >= cutoff && p.text.trim().length > 0)
    .sort((a, b) => (b.favorites ?? 0) - (a.favorites ?? 0))
    .slice(0, opts.limit);
  if (opts.json) {
    console.log(JSON.stringify({ posts: ranked, failed }, null, 2));
    return;
  }
  for (const p of ranked) {
    const when = p.createdAtMs ? new Date(p.createdAtMs).toISOString().slice(0, 16).replace("T", " ") : "?";
    console.log(`## @${p.author} · ${when} · ❤ ${p.favorites ?? "?"}\n**URL:** ${p.url}\n${p.text}\n`);
  }
  if (!ranked.length) console.log(`No posts found${opts.hours ? ` in the last ${opts.hours}h` : ""}.`);
}

export async function socialSearch(
  query: string,
  opts: { limit: number; json?: boolean },
): Promise<void> {
  const cfg = loadXConfig();
  if (!cfg.authToken || !cfg.ct0) {
    throw new Error(
      'X search needs cookies. Add to ~/.pi/agent/auth.json: "x": {"authToken": "...", "ct0": "...", "bearer": "...", "searchQueryId": "..."} ' +
        "authToken and ct0 come from your logged-in x.com cookies; bearer and searchQueryId from devtools Network (any x.com/i/api/graphql/ request: token after 'Bearer ', id in the URL path). " +
        'No cookies? Fallback: web search "site:x.com ' + query + '"',
    );
  }
  const qid = cfg.searchQueryId ?? "nKQ8KlOzgBoLCiQENdWKBg";
  const variables = JSON.stringify({ rawQuery: query, count: opts.limit, querySource: "typed_query" });
  const features = JSON.stringify({
    rweb_tipjar_consumption_enabled: true, responsive_web_graphql_exclude_directive_enabled: true,
    verified_phone_label_enabled: false, creator_subscriptions_tweet_preview_api_enabled: true,
    responsive_web_graphql_timeline_navigation_enabled: true, responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
    communities_web_enable_tweet_community_results_fetch: true, c9s_tweet_anatomy_moderator_badge_enabled: true,
    articles_rweb_enabled: true, responsive_web_enhance_cards_enabled: false,
  });
  const url = new URL(`https://x.com/i/api/graphql/${qid}/SearchTimeline`);
  url.searchParams.set("variables", variables);
  url.searchParams.set("features", features);
  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${cfg.bearer ?? ""}`,
      Cookie: `auth_token=${cfg.authToken}; ct0=${cfg.ct0}`,
      "x-csrf-token": cfg.ct0,
      "x-twitter-active-user": "yes",
      "x-twitter-auth-type": "OAuth2Session",
      "User-Agent": UA,
      Accept: "application/json",
    },
  });
  if (res.status === 400 || res.status === 404) {
    throw new Error(`X API ${res.status}: likely a stale searchQueryId. Re-copy it from devtools into auth.json "x". `);
  }
  if (res.status === 401 || res.status === 403) {
    throw new Error("X API rejected the cookies (expired or account flagged). Re-export auth_token/ct0.");
  }
  if (!res.ok) throw new Error(`X API returned ${res.status}`);
  const body = await res.json();
  const out: SocialPost[] = [];
  const walk = (node: any) => {
    if (!node || typeof node !== "object") return;
    const result = node.result?.legacy ?? node.result;
    if (result?.full_text && result?.user?.screen_name) {
      out.push({
        author: result.user.screen_name,
        url: `https://x.com/${result.user.screen_name}/status/${result.id_str}`,
        text: result.full_text,
        createdAtMs: result.created_at ? Date.parse(result.created_at) : undefined,
        favorites: result.favorite_count,
      });
    }
    for (const v of Object.values(node)) walk(v);
  };
  walk(body);
  const results = out.slice(0, opts.limit);
  if (opts.json) {
    console.log(JSON.stringify({ results }, null, 2));
    return;
  }
  if (!results.length) {
    console.log("No results.");
    return;
  }
  console.log(
    results
      .map((p, i) => {
        const when = p.createdAtMs ? new Date(p.createdAtMs).toISOString().slice(0, 16).replace("T", " ") : "?";
        return `## ${i + 1}. @${p.author} · ${when} · ❤ ${p.favorites ?? "?"}\n**URL:** ${p.url}\n${p.text}`;
      })
      .join("\n\n---\n\n"),
  );
}

export async function socialUser(handle: string, opts: { limit: number; json?: boolean }): Promise<void> {
  const h = handle.replace(/^@/, "");
  const posts = (await fetchProfilePosts(h)).slice(0, opts.limit);
  if (opts.json) {
    console.log(JSON.stringify({ posts }, null, 2));
    return;
  }
  if (!posts.length) {
    console.log(`No posts parsed for @${h}.`);
    return;
  }
  console.log(
    posts
      .map((p, i) => {
        const when = p.createdAtMs ? new Date(p.createdAtMs).toISOString().slice(0, 16).replace("T", " ") : "?";
        return `## ${i + 1}. @${h} · ${when} · ❤ ${p.favorites ?? "?"}\n**URL:** ${p.url}\n${p.text}`;
      })
      .join("\n\n---\n\n"),
  );
}
