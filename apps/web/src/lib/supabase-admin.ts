/**
 * Service-role Supabase client for admin pages.
 * Bypasses RLS so admins can read all data.
 * Use sparingly — prefer user-scoped queries where possible.
 */
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// ─── Admin Queries ──────────────────────────────────────────────────────────────

// Jobs
export async function adminListJobs(limit = 50) {
  const { data, error } = await supabaseAdmin
    .from("jobs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function adminGetJob(id: string) {
  const { data, error } = await supabaseAdmin
    .from("jobs")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

// Nodes
export async function adminListNodes(limit = 100) {
  const { data, error } = await supabaseAdmin
    .from("nodes")
    .select("*")
    .order("reputation_score", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function adminGetNode(id: string) {
  const { data, error } = await supabaseAdmin
    .from("nodes")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

// Users (auth.users — only accessible with service role)
export async function adminListUsers(limit = 50) {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("*, id")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function adminGetUserByWallet(walletAddress: string) {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("wallet_address", walletAddress.toLowerCase())
    .single();
  if (error) throw error;
  return data;
}

// Slash Events
export async function adminListSlashEvents(limit = 100) {
  const { data, error } = await supabaseAdmin
    .from("slashing_events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

// Alerts
export async function adminListAlerts(limit = 50) {
  const { data, error } = await supabaseAdmin
    .from("alerts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function adminGetAlert(id: string) {
  const { data, error } = await supabaseAdmin
    .from("alerts")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

// Governance / Proposals
export async function adminListProposals(limit = 50) {
  const { data, error } = await supabaseAdmin
    .from("proposals")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function adminGetProposal(id: string) {
  const { data, error } = await supabaseAdmin
    .from("proposals")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

// Disputes
export async function adminListDisputes(limit = 50) {
  const { data, error } = await supabaseAdmin
    .from("disputes")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function adminGetDispute(id: string) {
  const { data, error } = await supabaseAdmin
    .from("disputes")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

// Contracts
export async function adminListContracts() {
  const { data, error } = await supabaseAdmin
    .from("contracts")
    .select("*")
    .order("name");
  if (error) throw error;
  return data;
}

export async function adminGetContract(name: string) {
  const { data, error } = await supabaseAdmin
    .from("contracts")
    .select("*")
    .eq("name", name)
    .single();
  if (error) throw error;
  return data;
}

// Team members
export async function adminListTeamMembers(orgId: string) {
  const { data, error } = await supabaseAdmin
    .from("team_members")
    .select("*")
    .eq("org_id", orgId)
    .order("invited_at", { ascending: false });
  if (error) throw error;
  return data;
}

// Webhooks
export async function adminListWebhooks(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("webhooks")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function adminGetWebhook(id: string) {
  const { data, error } = await supabaseAdmin
    .from("webhooks")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function adminGetWebhookDeliveries(webhookId: string, limit = 20) {
  const { data, error } = await supabaseAdmin
    .from("webhook_deliveries")
    .select("*")
    .eq("webhook_id", webhookId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}
