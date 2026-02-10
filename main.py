from fastapi import FastAPI, UploadFile, File, Request ,Query
from fastapi.responses import StreamingResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from utils import process_image
import io

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/optimize")
async def optimize_image(
    image: UploadFile = File(...),
    max_size_kb: int = Query(300, description="Max output image size in KB")
):
    original = await image.read()
    optimized = process_image(original, max_size_kb=max_size_kb)
    return StreamingResponse(
    io.BytesIO(optimized),
    media_type="image/jpeg",
    headers={
        "Content-Disposition": "inline; filename=optimized.jpg"
    }
)

