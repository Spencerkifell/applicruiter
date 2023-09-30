import pdfplumber
import os

from pdf_process.resume import *

pdfs_folder = "D:\\AI_Projects\\Mais2023\\archive\\data\\data\\DESIGNER"

if __name__ == '__main__':
    pdf_files = [f for f in os.listdir(pdfs_folder) if f.endswith(".pdf")]
    # print(pdf_files)

    for pdf_file in pdf_files:
        pdf_file_path = os.path.join(pdfs_folder, pdf_file)

        # Create a Resume object for each PDF
        resume = Resume(pdf_file, pdf_file_path)

        # Print or process the content as needed
        print("===========================", resume.get_pdf_content())