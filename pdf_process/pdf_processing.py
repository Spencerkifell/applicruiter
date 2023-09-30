from pypdf import PdfReader

def parse_pdf(file_path):
    pdf = PdfReader(file_path)
    text = ''
    for page in pdf.pages:
        text += page.extract_text()
    return text

if __name__ == '__main__':
    pdf_file_path = input("What is the filepath?")
    parsed_text = parse_pdf(pdf_file_path)
    print(parsed_text)