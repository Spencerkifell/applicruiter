import pdfplumber

from pdf_process.resume import *

if __name__ == '__main__':
    pdf_file_path = input("What is the filepath?")

    resume = Resume("Joe Smith", pdf_file_path)

    print(resume.get_pdf_content())