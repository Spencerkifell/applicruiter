export interface JobPosting {
    job_id: number;
    title: string;
    description: string;
    level: string;
    country: string;
    city: string;
    skills: string;
}

export interface ResumeRanking {
    id: number;
    pdf_data: string;
    similarity_score: number | undefined;
}