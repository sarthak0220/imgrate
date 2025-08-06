from PIL import Image
import io

def process_image(image_bytes: bytes, max_size_kb: int = 300) -> bytes:
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")

    max_width = 1024
    if img.width > max_width:
        ratio = max_width / img.width
        new_height = int(img.height * ratio)
        img = img.resize((max_width, new_height))

    buffer = io.BytesIO()
    quality = 85
    while True:
        buffer.seek(0)
        img.save(buffer, format="JPEG", quality=quality, optimize=True)
        size_kb = buffer.tell() / 1024
        if size_kb <= max_size_kb or quality <= 20:
            break
        quality -= 5

    return buffer.getvalue()
