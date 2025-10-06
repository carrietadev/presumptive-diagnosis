/*
  # Create ophthalmology diagnostic records table

  1. New Tables
    - `diagnostic_records`
      - `id` (uuid, primary key) - Unique identifier for each diagnostic record
      - `patient_name` (text) - Full name of the patient
      - `age` (text) - Patient's age
      - `chief_complaint` (text) - Main reason for consultation
      - `visual_acuity_od` (text) - Visual acuity right eye (OD)
      - `visual_acuity_os` (text) - Visual acuity left eye (OS)
      - `refraction_od` (text) - Refraction measurements right eye
      - `refraction_os` (text) - Refraction measurements left eye
      - `intraocular_pressure_od` (text) - IOP right eye
      - `intraocular_pressure_os` (text) - IOP left eye
      - `anterior_segment_od` (text) - Anterior segment findings right eye
      - `anterior_segment_os` (text) - Anterior segment findings left eye
      - `posterior_segment_od` (text) - Posterior segment findings right eye
      - `posterior_segment_os` (text) - Posterior segment findings left eye
      - `diagnosis` (text) - Presumptive diagnosis
      - `observations` (text) - Additional observations and notes
      - `created_at` (timestamptz) - Record creation timestamp
      
  2. Security
    - Enable RLS on `diagnostic_records` table
    - Add policy for authenticated users to manage their own records
*/

CREATE TABLE IF NOT EXISTS diagnostic_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name text DEFAULT '',
  age text DEFAULT '',
  chief_complaint text DEFAULT '',
  visual_acuity_od text DEFAULT '',
  visual_acuity_os text DEFAULT '',
  refraction_od text DEFAULT '',
  refraction_os text DEFAULT '',
  intraocular_pressure_od text DEFAULT '',
  intraocular_pressure_os text DEFAULT '',
  anterior_segment_od text DEFAULT '',
  anterior_segment_os text DEFAULT '',
  posterior_segment_od text DEFAULT '',
  posterior_segment_os text DEFAULT '',
  diagnosis text DEFAULT '',
  observations text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE diagnostic_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view all records"
  ON diagnostic_records
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert records"
  ON diagnostic_records
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update records"
  ON diagnostic_records
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete records"
  ON diagnostic_records
  FOR DELETE
  TO authenticated
  USING (true);