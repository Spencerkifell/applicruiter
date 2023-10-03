import pdfplumber
import json
import re

class Resume:
    candidate_name = ""
    pdf_location = ""
    pdf_content = None

    ranked = False
    similarityScore = -1

    id = -1

    def __init__(self, candidate_name, pdf_location, similarityScore = -1, id=-1):
        self.candidate_name = candidate_name
        self.pdf_location = pdf_location
        self.pdf_content = None
        self.pdf_content = self.extract_pdf_content()
        self.id = id

        # If is scored already.
        if similarityScore != -1:
            ranked = True
            self.similarityScore = similarityScore


    def extract_pdf_content(self):
        with pdfplumber.open(self.pdf_location) as pdf:
            text = ""
            for page in pdf.pages:
                text += page.extract_text()
        return self.cleanResume(text)

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

    def cleanResume(self, text):
        returnText = re.sub('http\S+\s*', ' ', text)
        returnText = re.sub('RT|cc', ' ', returnText)
        returnText = re.sub('#\S+', '', returnText)
        returnText = re.sub('@\S+', '  ', returnText)
        returnText = re.sub('[%s]' % re.escape("""!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~"""), ' ', returnText)
        returnText = re.sub(r'[^\x00-\x7f]', r' ', returnText)
        returnText = re.sub('\s+', ' ', returnText)
        return returnText