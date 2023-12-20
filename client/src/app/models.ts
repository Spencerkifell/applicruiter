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
  totalMembers: number;
  totalListings: number;
  dateCreated: string;
}
