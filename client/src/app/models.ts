export interface JobPosting {
  job_id: number;
  title: string;
  description: string;
  level: string;
  country: string;
  city: string;
  skills: string;
  checked: boolean;
}

export interface ResumeRanking {
  id: number;
  pdf_data: string;
  similarity_score: number | undefined;
  signed_url: string | undefined;
}

export interface Organization {
  id: number;
  name: string;
  owner: string;
  address: string;
  country: string;
  city: string;
  totalMembers: number;
  totalListings: number;
  dateCreated: string;
}

export interface User {
  auth_id: string;
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  email_verified: number;
  picture: string;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}
