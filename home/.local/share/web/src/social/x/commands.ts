import { fetchProfilePosts, watchlist, type SocialPost } from "./profile.js";

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
