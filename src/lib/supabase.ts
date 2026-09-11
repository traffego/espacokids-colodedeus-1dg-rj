import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials missing in environment variables.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Child = {
  id?: string;
  responsible_id?: string;
  name: string;
  age: number;
  gender?: string;
  is_potty_trained: boolean;
  has_food_restriction: boolean;
  food_restriction_details?: string;
  observations?: string;
  created_at?: string;
};

export type Responsible = {
  id?: string;
  name: string;
  phone: string;
  notes?: string;
  payment_status: "pending" | "paid";
  total_amount: number;
  created_at?: string;
  updated_at?: string;
  children?: Child[];
};
