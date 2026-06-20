import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Auth helpers
export const signInWithGitHub = () =>
  supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  })

export const signInWithGoogle = () =>
  supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  })

export const signInWithDiscord = () =>
  supabase.auth.signInWithOAuth({
    provider: 'discord',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  })

export const signOut = () => supabase.auth.signOut()

export const getSession = () => supabase.auth.getSession()

export const getUser = () => supabase.auth.getUser()

// Database types
export type Profile = {
  id: string
  email: string
  display_name: string | null
  avatar_url: string | null
  wallet_address: string | null
  created_at: string
  updated_at: string
}

export type ApiKey = {
  id: string
  user_id: string
  key_prefix: string
  name: string
  last_used_at: string | null
  expires_at: string | null
  created_at: string
}

export type Node = {
  id: string
  wallet_address: string
  display_name: string | null
  gpu_model: string | null
  vram_total_mb: number
  status: 'online' | 'offline' | 'busy' | 'maintenance'
  reputation_score: number
  total_jobs_completed: number
  last_heartbeat_at: string | null
  location: string | null
  price_per_minute_usd: number
  created_at: string
  updated_at: string
  // Migration 004 columns
  stake_amount?: string
  vram_used_mb?: number
  cpu_cores?: number
  uptime_seconds?: number
  total_jobs_failed?: number
}

export type Job = {
  id: string
  job_id_256: string
  user_id: string
  node_id: string | null
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  job_type: string
  input_payload: Record<string, unknown>
  output_payload: Record<string, unknown> | null
  estimated_duration_minutes: number | null
  actual_duration_minutes: number | null
  checkpoint_url: string | null
  sla_uptime_required: number | null
  sla_throughput_required: number | null
  deadline: string | null
  budget_usd: number | null
  price_charged_usd: number | null
  paid_at: string | null
  created_at: string
  updated_at: string
  completed_at: string | null
}

// API wrapper functions
export const profileApi = {
  get: async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .single()
    if (error) throw error
    return data as Profile
  },

  update: async (updates: Partial<Profile>) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .select()
      .single()
    if (error) throw error
    return data as Profile
  },

  updateWallet: async (walletAddress: string) => {
    return profileApi.update({ wallet_address: walletAddress })
  }
}

export const apiKeysApi = {
  list: async () => {
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data as ApiKey[]
  },

  create: async (name: string = 'Default') => {
    const { data, error } = await supabase
      .from('api_keys')
      .insert({ name })
      .select()
      .single()
    if (error) throw error
    return data as ApiKey & { key: string } // Returns unhashed key only once
  },

  revoke: async (id: string) => {
    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', id)
    if (error) throw error
  }
}

export const jobsApi = {
  list: async (limit: number = 50) => {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) throw error
    return data as Job[]
  },

  get: async (id: string) => {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data as Job
  },

  create: async (job: Omit<Job, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('jobs')
      .insert(job)
      .select()
      .single()
    if (error) throw error
    return data as Job
  },

  updateStatus: async (id: string, status: Job['status']) => {
    const updates: Partial<Job> = { status }
    if (status === 'completed' || status === 'failed') {
      updates.completed_at = new Date().toISOString()
    }
    const { data, error } = await supabase
      .from('jobs')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data as Job
  }
}

export const nodesApi = {
  list: async () => {
    const { data, error } = await supabase
      .from('nodes')
      .select('*')
      .order('reputation_score', { ascending: false })
    if (error) throw error
    return data as Node[]
  },

  get: async (id: string) => {
    const { data, error } = await supabase
      .from('nodes')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data as Node
  },

  getByWallet: async (walletAddress: string) => {
    const { data, error } = await supabase
      .from('nodes')
      .select('*')
      .eq('wallet_address', walletAddress.toLowerCase())
      .single()
    if (error) throw error
    return data as Node
  },

  register: async (node: Omit<Node, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('nodes')
      .insert(node)
      .select()
      .single()
    if (error) throw error
    return data as Node
  },

  updateHeartbeat: async (id: string, vramUsedMb: number, vramTotalMb: number, latencyMs: number) => {
    const { error } = await supabase
      .from('node_heartbeats')
      .insert({
        node_id: id,
        vram_used_mb: vramUsedMb,
        vram_total_mb: vramTotalMb,
        packet_latency_ms: latencyMs
      })
    if (error) throw error
  }
}

// Notification preference keys
export type NotifPrefKey =
  | 'jobCompleted' | 'jobFailed' | 'slaBreached' | 'nodeOffline'
  | 'slashEvent' | 'weeklyReport' | 'priceAlerts' | 'newJobOffer'

export interface NotificationPrefs {
  jobCompleted: boolean
  jobFailed: boolean
  slaBreached: boolean
  nodeOffline: boolean
  slashEvent: boolean
  weeklyReport: boolean
  priceAlerts: boolean
  newJobOffer: boolean
}

export interface NodeProviderPrefs {
  uptimeSLA: string
  minJobPrice: string
  autoAccept: boolean
  region: string
}

export const prefsApi = {
  // Notification prefs: get all as NotificationPrefs object
  getNotificationPrefs: async (): Promise<NotificationPrefs> => {
    const defaults: NotificationPrefs = {
      jobCompleted: true, jobFailed: true, slaBreached: true,
      nodeOffline: true, slashEvent: true, weeklyReport: false,
      priceAlerts: true, newJobOffer: false,
    }
    const { data, error } = await supabase
      .from('user_notification_prefs')
      .select('key, value')
    if (error || !data) return defaults
    const prefs = { ...defaults }
    for (const row of data) {
      if (row.key in prefs) {
        (prefs as Record<string, boolean>)[row.key] = row.value === 'true'
      }
    }
    return prefs
  },

  // Save individual notification pref
  setNotificationPref: async (key: NotifPrefKey, value: boolean) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase
      .from('user_notification_prefs')
      .upsert({ user_id: user.id, key, value: String(value) },
        { onConflict: 'user_id,key' })
    if (error) throw error
  },

  // Node provider prefs
  getNodeProviderPrefs: async (): Promise<NodeProviderPrefs> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { uptimeSLA: '99.5', minJobPrice: '0.001', autoAccept: false, region: 'auto' }
    const { data, error } = await supabase
      .from('user_node_provider_prefs')
      .select('*')
      .eq('user_id', user.id)
      .single()
    if (error || !data) return { uptimeSLA: '99.5', minJobPrice: '0.001', autoAccept: false, region: 'auto' }
    return {
      uptimeSLA: String(data.uptime_sla),
      minJobPrice: String(data.min_job_price_eth),
      autoAccept: data.auto_accept_jobs,
      region: data.preferred_region,
    }
  },

  saveNodeProviderPrefs: async (prefs: NodeProviderPrefs) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase
      .from('user_node_provider_prefs')
      .upsert({
        user_id: user.id,
        uptime_sla: parseFloat(prefs.uptimeSLA),
        min_job_price_eth: parseFloat(prefs.minJobPrice),
        preferred_region: prefs.region,
        auto_accept_jobs: prefs.autoAccept,
      }, { onConflict: 'user_id' })
    if (error) throw error
  },
}
