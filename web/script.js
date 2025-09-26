import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json"
};
const GITHUB_GRAPHQL = "https://api.github.com/graphql";
const token = Deno.env.get("GITHUB_PAT");
/**
 * Dépôts fixes à agréger
 */ const REPOS = [
  "supabase/postgres",
  "supabase/supabase",
  "supabase/edge-runtime",
  "supabase/storage",
  "supabase/cli",
  "supabase/auth"
];
function qRepo(repos) {
  return repos.map((r) => `repo:${r}`).join(" ");
}
function aliasify(slug) {
  return slug.replace(/[^\w]+/g, "_");
}
export async function isPublicMemberOfSupabase(username) {
  const url = `https://api.github.com/orgs/supabase/members/${username}`;
  const headers = {
    "Accept": "application/vnd.github+json",
    "User-Agent": "supapass-edge-fn",
    "Authorization": `Bearer ${token}`
  };
  const res = await fetch(url, {
    headers
  });
  if (res.status === 204) return true;
  if (res.status === 404) return false;
  console.warn(`[isPublicMemberOfSupabase] Unexpected status: ${res.status}`);
  return false;
}
function buildPerRepoQueryAndVars(username) {
  const author = `author:${username}`;
  const qAllRepos = qRepo(REPOS);
  // --- global (tous repos) ---
  const fields = [
    `prsOpen: search(query: $qPrOpenAll, type: ISSUE, first: 1) { issueCount }`,
    `prsMerged: search(query: $qPrMergedAll, type: ISSUE, first: 1) { issueCount }`,
    `issuesAll: search(query: $qIssuesAll, type: ISSUE, first: 1) { issueCount }`,
    `rateLimit { cost remaining resetAt }`
  ];
  const variables = {
    qPrOpenAll: `${author} ${qAllRepos} is:pr is:open`,
    qPrMergedAll: `${author} ${qAllRepos} is:pr is:merged`,
    qIssuesAll: `${author} ${qAllRepos} is:issue`
  };
  for (const slug of REPOS) {
    const a = aliasify(slug);
    fields.push(`${a}__prsOpen: search(query: $q_${a}_prsOpen, type: ISSUE, first: 1) { issueCount }`, `${a}__prsMerged: search(query: $q_${a}_prsMerged, type: ISSUE, first: 1) { issueCount }`, `${a}__issuesAll: search(query: $q_${a}_issuesAll, type: ISSUE, first: 1) { issueCount }`);
    variables[`q_${a}_prsOpen`] = `${author} repo:${slug} is:pr is:open`;
    variables[`q_${a}_prsMerged`] = `${author} repo:${slug} is:pr is:merged`;
    variables[`q_${a}_issuesAll`] = `${author} repo:${slug} is:issue`;
  }
  const query = `
    query SupapassPerRepo(
      $qPrOpenAll: String!,
      $qPrMergedAll: String!,
      $qIssuesAll: String!,
      ${Object.keys(variables).filter((k) => k.startsWith("q_")).map((k) => `$${k}: String!`).join(",\n      ")}
    ) {
      ${fields.join("\n      ")}
    }
  `;
  const vars = {
    qPrOpenAll: variables.qPrOpenAll,
    qPrMergedAll: variables.qPrMergedAll,
    qIssuesAll: variables.qIssuesAll,
    ...Object.fromEntries(Object.entries(variables).filter(([k]) => k.startsWith("q_")))
  };
  return {
    query,
    variables: vars
  };
}
async function getGitHubUserStatsWithDetails(username) {
  try {
    const { query, variables } = buildPerRepoQueryAndVars(username);
    const resp = await fetch(GITHUB_GRAPHQL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "supapass-edge-fn"
      },
      body: JSON.stringify({
        query,
        variables
      })
    });
    if (!resp.ok) throw new Error(`GitHub API error: ${resp.status}`);
    const { data, errors } = await resp.json();
    if (errors?.length) throw new Error(`GraphQL errors: ${errors.map((e) => e.message).join("; ")}`);
    // Globaux
    const prs = data?.prsOpen?.issueCount ?? 0;
    const merged = data?.prsMerged?.issueCount ?? 0;
    const issues = data?.issuesAll?.issueCount ?? 0;
    // Détails par repo
    const details = {};
    for (const slug of REPOS) {
      const a = aliasify(slug);
      const rPrs = data?.[`${a}__prsOpen`]?.issueCount ?? 0;
      const rMerg = data?.[`${a}__prsMerged`]?.issueCount ?? 0;
      const rIss = data?.[`${a}__issuesAll`]?.issueCount ?? 0;
      details[slug] = {
        prs: rPrs,
        merged: rMerg,
        issues: rIss,
        total: rPrs + rMerg + rIss
      };
    }
    return {
      prs,
      merged,
      issues,
      total: prs + merged + issues,
      details
    };
  } catch (error) {
    console.error(`Error fetching per-repo stats for ${username}:`, error);
    const emptyDetails = Object.fromEntries(REPOS.map((r) => [
      r,
      {
        prs: 0,
        merged: 0,
        issues: 0,
        total: 0
      }
    ]));
    return {
      prs: 0,
      merged: 0,
      issues: 0,
      total: 0,
      details: emptyDetails
    };
  }
}
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders
    });
  }
  try {
    if (!token) throw new Error("GitHub token not configured");
    const { username } = await req.json();
    if (!username?.trim()) throw new Error("Missing username");
    const stats = await getGitHubUserStatsWithDetails(username.trim());
    const isCoreMember = await isPublicMemberOfSupabase(username.trim());
    return Response.json({
      stats,
      isCoreMember
    }, {
      headers: corsHeaders
    });
  } catch (error) {
    const status = String(error.message || "").includes("Missing") ? 400 : 500;
    return Response.json({
      error: error.message
    }, {
      status,
      headers: corsHeaders
    });
  }
});
