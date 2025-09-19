import { createClient, type User } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xckggdmqfqajatytmiko.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhja2dnZG1xZnFhamF0eXRtaWtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1NjY0MzEsImV4cCI6MjA3MTE0MjQzMX0.16ENL-9-QPSxuN620NGO-BndYpHCLuEdVQeR_lZqYA0';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Database type definitions
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          username: string;
          full_name: string | null;
          avatar_url: string | null;
          role: 'user' | 'driver' | 'admin';
          eco_points: number;
          total_rides: number;
          co2_saved: string;
          has_ceo_tshirt: boolean;
          tshirt_purchase_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          email: string;
          username: string;
          full_name?: string;
          avatar_url?: string;
          role?: 'user' | 'driver' | 'admin';
        };
        Update: {
          username?: string;
          full_name?: string;
          avatar_url?: string;
          eco_points?: number;
          total_rides?: number;
          co2_saved?: string;
          has_ceo_tshirt?: boolean;
        };
      };
      spots: {
        Row: {
          id: string;
          name: string;
          latitude: string;
          longitude: string;
          description: string | null;
          amenities: string[] | null;
          is_active: boolean;
          created_at: string;
        };
      };
      airbears: {
        Row: {
          id: string;
          driver_id: string | null;
          current_spot_id: string | null;
          battery_level: number;
          is_available: boolean;
          is_charging: boolean;
          total_distance: string;
          maintenance_status: 'excellent' | 'good' | 'needs_service' | 'out_of_service';
          solar_panel_efficiency: string;
          created_at: string;
        };
      };
      rides: {
        Row: {
          id: string;
          user_id: string;
          driver_id: string | null;
          airbear_id: string | null;
          pickup_spot_id: string;
          destination_spot_id: string;
          status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
          distance: string | null;
          co2_saved: string | null;
          fare: string;
          is_free_tshirt_ride: boolean;
          requested_at: string;
        };
        Insert: {
          user_id: string;
          pickup_spot_id: string;
          destination_spot_id: string;
          fare: number;
          is_free_tshirt_ride?: boolean;
        };
      };
      bodega_items: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          price: string;
          image_url: string | null;
          category: string;
          is_eco_friendly: boolean;
          is_available: boolean;
          is_ceo_special: boolean;
          stock: number;
          created_at: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          items: any;
          total_amount: string;
          status: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          items: any;
          total_amount: number;
        };
      };
    };
  };
}

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

// Enhanced real-time subscriptions with proper typing
export const subscribeToRides = (userId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`rides:user_id=eq.${userId}`)
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

export const subscribeToAirbears = (callback: (payload: any) => void) => {
  return supabase
    .channel('airbears')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public', 
        table: 'airbears'
      },
      callback
    )
    .subscribe();
};

export const subscribeToInventory = (airbearId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`airbear_inventory:airbear_id=eq.${airbearId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'airbear_inventory',
        filter: `airbear_id=eq.${airbearId}`
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

// Enhanced database helpers with proper error handling
export const getAirbears = async () => {
  const { data, error } = await supabase
    .from('airbears')
    .select(`
      *,
      current_spot:spots(*)
    `);
    
  if (error) throw error;
  return data;
};

export const getAvailableAirbears = async () => {
  const { data, error } = await supabase
    .from('airbears')
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

// CEO T-shirt specific functions
export const getCeoTshirts = async () => {
  const { data, error } = await supabase
    .from('bodega_items')
    .select('*')
    .eq('is_ceo_special', true)
    .eq('is_available', true)
    .gt('stock', 0);
    
  if (error) throw error;
  return data;
};

export const purchaseCeoTshirt = async (userId: string, itemId: string) => {
  const { data, error } = await supabase.rpc('purchase_ceo_tshirt', {
    user_id: userId,
    item_id: itemId
  });
  
  if (error) throw error;
  return data;
};

// Real-time presence for drivers
export const trackDriverPresence = (driverId: string) => {
  return supabase.channel('driver_presence')
    .on('presence', { event: 'sync' }, () => {
      console.log('Driver presence synced');
    })
    .on('presence', { event: 'join' }, ({ key, newPresences }) => {
      console.log('Driver joined:', key, newPresences);
    })
    .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      console.log('Driver left:', key, leftPresences);
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await supabase.channel('driver_presence').track({
          driver_id: driverId,
          online_at: new Date().toISOString(),
        });
      }
    });
};

// Row Level Security (RLS) policies would be set up in Supabase dashboard:
// - Users can only read/write their own rides, orders, payments
// - Drivers can read/write rickshaws they're assigned to
// - Admins have full access
// - Public read access to spots and bodega_items