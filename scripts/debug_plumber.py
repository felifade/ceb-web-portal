import pdfplumber

pdf_path = "Listas_Originales/test_lista.pdf"
with pdfplumber.open(pdf_path) as pdf:
    for page in pdf.pages:
        text = page.extract_text()
        print("--- PAGE TEXT ---")
        print(text[:1000])
