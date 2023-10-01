import os

from resume import Resume
from sort_jobs import JobSorting

pdfs_folder = "D:\\AI_Projects\\Mais2023\\archive\\data\\data\\DESIGNER"

resumes = dict()

if __name__ == '__main__':
    pdf_files = [f for f in os.listdir(pdfs_folder) if f.endswith(".pdf")]

    # Parse each resume.
    for pdf_file in pdf_files:
        pdf_file_path = os.path.join(pdfs_folder, pdf_file) # Get full filepath.

        # Create a Resume object for each PDF and add to dictionary.
        resume = Resume(pdf_file, pdf_file_path)

        resumes[resume.get_candidate_name()] = resume

        # Print or process the content as needed.

    JobSorting.rank_jobs(resumes.values())