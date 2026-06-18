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
