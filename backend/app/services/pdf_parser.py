import fitz

def extract_text_from_pdf(pdf_input) -> str:
    """
    Extracts plain text from a PDF document using PyMuPDF.
    Automatically detects if the input is a file path string or raw bytes stream.
    """
    if not pdf_input:
        return ""
        
    try:
        # 🚀 THE BULLETPROOF FIX: Auto-detect input type to prevent filename type crashes
        if isinstance(pdf_input, bytes):
            # If raw bytes are passed, open it directly from the memory buffer stream
            document = fitz.open(stream=pdf_input, filetype="pdf")
        else:
            # If a string path is passed, open the file from the disk storage layout
            document = fitz.open(str(pdf_input))
            
        text_pages = []

        for page in document:
            page_text = page.get_text()
            if page_text:
                text_pages.append(page_text)

        document.close()
        
        return "\n".join(text_pages).strip()
        
    except Exception as e:
        print(f"ERROR - PyMuPDF failed to process PDF input: {str(e)}")
        raise e