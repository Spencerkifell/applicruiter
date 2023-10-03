import os

from resume import Resume

pdfs_folder = "dataset/data/data/CHEF"



def processPDF(pdf_path, similarityScore = -1, id=-1):
    resumes = dict()

    resume = Resume(pdf_path.split('\\')[0], pdf_path, similarityScore, id)

    return resume


# if __name__ == '__main__':
#     resumes = dict()
#     pdf_files = [f for f in os.listdir(pdfs_folder) if f.endswith(".pdf")]
#
#     # Parse each resume.
#     for pdf_file in pdf_files:
#         pdf_file_path = os.path.join(pdfs_folder, pdf_file) # Get full filepath.
#
#         # Create a Resume object for each PDF and add to dictionary.
#         resume = Resume(pdf_file, pdf_file_path)
#
#         resumes[resume.get_candidate_name()] = resume
#
#         # Print or process the content as needed.
#
#     print("======================DONE PREPROCESSING DATA======================")
#
#     JobSorting.rank_jobs(resumes.values())
