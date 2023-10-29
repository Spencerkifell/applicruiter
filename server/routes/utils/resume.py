from global_utils import get_signed_s3_url, parse_s3_location
import pdfplumber
import json
import re
import requests
import io

class Resume:
    pdf_location = ""
    pdf_content = None

    ranked = False
    similarityScore = -1
    id = -1

    def __init__(self, pdf_location, similarityScore = -1, id=-1):
        self.pdf_location = pdf_location
        self.pdf_content = self.extract_pdf_content()
        self.id = id

        # If is scored already.
        if similarityScore != -1:
            ranked = True
            self.similarityScore = similarityScore

    def extract_pdf_content(self):        
        s3_file = get_signed_s3_url(**parse_s3_location(self.pdf_location))
        pdf_file = self.parse_file_content(s3_file)
        text = Resume.extract_text_pdf(pdf_file)
        return self.cleanResume(text)

    def get_pdf_content(self):
        return self.pdf_content

    # To be used in the future for storing json.
    def to_json(self):
        resume_dict = {
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
    
    def parse_file_content(self, file):
        file_content = self._request_resume_content(file)
        file = io.BytesIO()
        file.write(file_content)
        return file
    
    @staticmethod
    def extract_text_pdf(pdf_file):
        text = ''
        with pdfplumber.open(pdf_file) as pdf:
            for page in pdf.pages:
                text += page.extract_text()
        if not text:
            raise Exception("Unable to extract text from pdf")
        return text
    
    @staticmethod
    def _request_resume_content(url):
        response = requests.get(url)
        if response.status_code != 200:
            raise Exception(f"Unable to retrieve resume from url: {url}")
        return response.content
    