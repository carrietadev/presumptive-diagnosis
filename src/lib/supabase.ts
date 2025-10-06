import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type DiagnosticRecord = {
  id?: string;
  patient_name: string;
  age: string;
  chief_complaint: string;
  visual_acuity_od: string;
  visual_acuity_os: string;
  refraction_od: string;
  refraction_os: string;
  intraocular_pressure_od: string;
  intraocular_pressure_os: string;
  anterior_segment_od: string;
  anterior_segment_os: string;
  posterior_segment_od: string;
  posterior_segment_os: string;
  diagnosis: string;
  observations: string;
  created_at?: string;
};
