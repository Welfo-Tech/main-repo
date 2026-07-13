import { createClient } from "@supabase/supabase-js";

const url = import.meta.env["VITE_SUPABASE_URL"] as string;
const key = import.meta.env["VITE_SUPABASE_ANON_KEY"] as string;

if (!url || !key) {
  throw new Error(
    "VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in .env",
  );
}

export const supabase = createClient(url, key);

export interface ApplicationPayload {
  full_name: string;
  email: string;
  phone: string;
  linkedin_url: string;
  github_url: string;
  portfolio_url: string;
  college: string;
  degree: string;
  field_of_study: string;
  graduation_year: number;
  frontend_skills: string;
  backend_skills: string;
  db_experience: string;
  notable_projects: string;
  why_welfo: string;
  available_from: string;
  duration: string;
  work_preference: string;
  resume_link: string;
  additional_notes: string;
}

export async function submitApplication(data: ApplicationPayload) {
  const { error } = await supabase
    .from("internship_applications")
    .insert([data]);

  if (error) throw error;
}

export interface Application extends ApplicationPayload {
  id: string;
  created_at: string;
  status: string;
}

export async function getApplications(): Promise<Application[]> {
  const { data, error } = await supabase
    .from("internship_applications")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Application[];
}

export async function updateApplicationStatus(id: string, status: string) {
  const { error } = await supabase
    .from("internship_applications")
    .update({ status })
    .eq("id", id);

  if (error) throw error;
}
