import pdfplumber
import json

class Resume:
    candidate_name = ""
    pdf_location = ""
    pdf_content = None

    def __init__(self, candidate_name, pdf_location):
        self.candidate_name = candidate_name
        self.pdf_location = pdf_location
        self.pdf_content = None
        self.pdf_content = self.extract_pdf_content()

    def extract_pdf_content(self):
        with pdfplumber.open(self.pdf_location) as pdf:
            text = ""
            for page in pdf.pages:
                text += page.extract_text()
        return text

    def set_candidate_name(self, name):
        self.candidate_name = name

    def get_candidate_name(self):
        return self.candidate_name

    def get_pdf_content(self):
        return self.pdf_content

    # To be used in the future for storing json.
    def to_json(self):
        resume_dict = {
            "candidate_name": self.candidate_name,
            "pdf_location": self.pdf_location,
            "pdf_content": self.pdf_content
        }
        return json.dumps(resume_dict)