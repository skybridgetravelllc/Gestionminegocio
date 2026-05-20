import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ybyhwotxrtpvelotkcyd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlieWh3b3R4cnRwdmVsb3RrY3lkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4MTY5MzUsImV4cCI6MjA5NDM5MjkzNX0.58fhlWM1KEDZppIb_zl-I1yDRBN7pfpTtu33NMic-cs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const RAPIDAPI_KEY = '64f8c405ebmsh6f6e46adfdb4015p11800ajsnca51de007226';

export type UserRole = 'director_general' | 'supervisor' | 'employee';

export interface Employee {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
  status?: 'available' | 'busy' | 'away';
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read: boolean;
}

export interface Call {
  id: string;
  caller_id: string;
  receiver_id?: string;
  status: 'ringing' | 'active' | 'ended' | 'missed';
  started_at: string;
  ended_at?: string;
  duration?: number;
}

export interface Reservation {
  id: string;
  employee_id: string;
  client_name: string;
  type: 'flight' | 'hotel' | 'car' | 'package';
  details: any;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
  total_amount?: number;
}
