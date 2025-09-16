import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Auth helpers
export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
};

export const signUpWithEmail = async (email: string, password: string, metadata?: any) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata
    }
  });
  
  if (error) throw error;
  return data;
};

export const signInWithOAuth = async (provider: 'google' | 'apple') => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  });
  
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

// Real-time subscriptions
export const subscribeToRides = (userId: string, callback: (payload: any) => void) => {
  return supabase
    .channel('rides')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'rides',
        filter: `user_id=eq.${userId}`
      },
      callback
    )
    .subscribe();
};

export const subscribeToRickshaws = (callback: (payload: any) => void) => {
  return supabase
    .channel('rickshaws')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public', 
        table: 'rickshaws'
      },
      callback
    )
    .subscribe();
};

export const subscribeToInventory = (rickshawId: string, callback: (payload: any) => void) => {
  return supabase
    .channel('rickshaw_inventory')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'rickshaw_inventory',
        filter: `rickshaw_id=eq.${rickshawId}`
      },
      callback
    )
    .subscribe();
};

export const subscribeToOrders = (userId: string, callback: (payload: any) => void) => {
  return supabase
    .channel('orders')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: `user_id=eq.${userId}`
      },
      callback
    )
    .subscribe();
};

// Storage helpers
export const uploadFile = async (bucket: string, path: string, file: File) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    });
    
  if (error) throw error;
  return data;
};

export const downloadFile = async (bucket: string, path: string) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .download(path);
    
  if (error) throw error;
  return data;
};

export const getPublicUrl = (bucket: string, path: string) => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
    
  return data.publicUrl;
};

// Database helpers
export const insertSpots = async (spotsData: any[]) => {
  const { data, error } = await supabase
    .from('spots')
    .insert(spotsData)
    .select();
    
  if (error) throw error;
  return data;
};

export const getSpots = async () => {
  const { data, error } = await supabase
    .from('spots')
    .select('*')
    .eq('is_active', true);
    
  if (error) throw error;
  return data;
};

export const getRickshaws = async () => {
  const { data, error } = await supabase
    .from('rickshaws')
    .select(`
      *,
      current_spot:spots(*)
    `);
    
  if (error) throw error;
  return data;
};

export const getAvailableRickshaws = async () => {
  const { data, error } = await supabase
    .from('rickshaws')
    .select(`
      *,
      current_spot:spots(*)
    `)
    .eq('is_available', true)
    .eq('is_charging', false);
    
  if (error) throw error;
  return data;
};

export const createRide = async (rideData: any) => {
  const { data, error } = await supabase
    .from('rides')
    .insert(rideData)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

export const updateRide = async (rideId: string, updates: any) => {
  const { data, error } = await supabase
    .from('rides')
    .update(updates)
    .eq('id', rideId)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

export const getBodegaItems = async (category?: string) => {
  let query = supabase
    .from('bodega_items')
    .select('*')
    .eq('is_available', true);
    
  if (category) {
    query = query.eq('category', category);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const createOrder = async (orderData: any) => {
  const { data, error } = await supabase
    .from('orders')
    .insert(orderData)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

export const createPayment = async (paymentData: any) => {
  const { data, error } = await supabase
    .from('payments')
    .insert(paymentData)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

// Row Level Security (RLS) policies would be set up in Supabase dashboard:
// - Users can only read/write their own rides, orders, payments
// - Drivers can read/write rickshaws they're assigned to
// - Admins have full access
// - Public read access to spots and bodega_items
