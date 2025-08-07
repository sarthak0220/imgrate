from PIL import Image
import io

def compress_image_to_target(img: Image.Image, target_kb: int) -> bytes:
    min_q, max_q = 10, 95
    best_result = None

    while min_q <= max_q:
        mid_q = (min_q + max_q) // 2
        buffer = io.BytesIO()
        img.save(buffer, format="JPEG", quality=mid_q, optimize=True)
        size_kb = buffer.tell() / 1024

        if size_kb <= target_kb:
            best_result = buffer.getvalue()
            min_q = mid_q + 1  # Try better quality
        else:
            max_q = mid_q - 1  # Lower quality to fit size

    return best_result if best_result else buffer.getvalue()

def process_image(image_bytes: bytes, max_size_kb: int = 300) -> bytes:
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")

    max_width = 1024
    if img.width > max_width:
        ratio = max_width / img.width
        new_height = int(img.height * ratio)
        img = img.resize((max_width, new_height))

    return compress_image_to_target(img, max_size_kb)
