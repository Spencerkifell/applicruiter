import os

from routes.utils.resume import Resume

pdfs_folder = "dataset/data/data/CHEF"

def processPDF(pdf_path, similarityScore = -1, id=-1):
    resume = Resume(pdf_path, similarityScore, id)

    return resume