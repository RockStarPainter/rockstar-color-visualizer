from fastapi import FastAPI, File, UploadFile, Request, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import json
import shutil
import os
from pathlib import Path

app = FastAPI()

# Configure CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:8000", "http://localhost:8000"],  # Allow specific origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Path variables
color_file_path = "static/500_colors.json"  # Corrected path for static file access
upload_folder = "uploads/"

# Serve static files and uploaded images
app.mount("/static", StaticFiles(directory="static"), name="static")
app.mount("/uploads", StaticFiles(directory=upload_folder), name="uploads")

# Setup Jinja2 templates
templates = Jinja2Templates(directory="templates")

# Route to serve the index.html page
@app.get("/")
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

# Route to serve the color palettes from the JSON file
@app.get("/colors")
async def get_colors():
    try:
        # Ensure that the file exists in the correct directory
        if not os.path.exists(color_file_path):
            raise FileNotFoundError

        # Load the JSON file containing colors
        with open(color_file_path, 'r') as file:
            data = json.load(file)
        
        return JSONResponse(content=data)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Color file not found")
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Error reading color file")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")

# Route to handle image uploads
@app.post("/upload/")
async def upload_image(file: UploadFile = File(...)):
    # Check for valid image file extensions
    valid_extensions = {".jpg", ".jpeg", ".png", ".gif"}
    file_extension = Path(file.filename).suffix.lower()
    
    if file_extension not in valid_extensions:
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload an image file.")
    
    # Ensure the upload folder exists
    if not os.path.exists(upload_folder):
        os.makedirs(upload_folder)
        
    file_path = os.path.join(upload_folder, file.filename)

    # Save the uploaded image
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload image: {str(e)}")
    
    # Return the path to the uploaded file so it can be previewed
    return {"file_path": f"/uploads/{file.filename}"}
