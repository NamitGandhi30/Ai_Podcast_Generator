from PIL import Image
import pytesseract

def process_images(image_paths):
    descriptions = []
    
    for image_path in image_paths:
        try:
            img = Image.open(image_path)
            text = pytesseract.image_to_string(img)
            descriptions.append(text)
        except Exception as e:
            descriptions.append(f"Error processing image {image_path}: {str(e)}")

    return " ".join(descriptions)
