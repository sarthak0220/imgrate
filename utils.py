from PIL import Image
import io

def compress_image_to_target(img: Image.Image, target_kb: int) -> bytes:
    min_q, max_q = 10, 95
    best_result = None

    # Step 1: Quality-based compression
    while min_q <= max_q:
        mid_q = (min_q + max_q) // 2
        buffer = io.BytesIO()
        img.save(buffer, format="JPEG", quality=mid_q, optimize=True)
        size_kb = buffer.tell() / 1024

        if size_kb <= target_kb:
            best_result = buffer.getvalue()
            min_q = mid_q + 1
        else:
            max_q = mid_q - 1

    if best_result:
        return best_result

    # Step 2: Fallback — progressive resize
    width, height = img.size
    while width > 200:  # hard floor to avoid infinite loop
        width = int(width * 0.9)
        height = int(height * 0.9)
        resized = img.resize((width, height), Image.LANCZOS)

        buffer = io.BytesIO()
        resized.save(buffer, format="JPEG", quality=60, optimize=True)
        size_kb = buffer.tell() / 1024

        if size_kb <= target_kb:
            return buffer.getvalue()

    # Step 3: Absolute fallback (guaranteed small)
    buffer = io.BytesIO()
    img.resize((200, 200)).save(buffer, format="JPEG", quality=40)
    return buffer.getvalue()


def process_image(image_bytes: bytes, max_size_kb: int = 300) -> bytes:
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")

    max_width = 1024
    if img.width > max_width:
        ratio = max_width / img.width
        new_height = int(img.height * ratio)
        img = img.resize((max_width, new_height), Image.LANCZOS)

    return compress_image_to_target(img, max_size_kb)