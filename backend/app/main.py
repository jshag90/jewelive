
from fastapi import FastAPI
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from pathlib import Path

app = FastAPI(title="Jewelive Jewelry Trading", version="0.1.0")

# CORS Setup
default_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
configured_origins = os.getenv("CORS_ORIGINS", "")
origins = [
    origin.strip()
    for origin in configured_origins.split(",")
    if origin.strip()
] or default_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.staticfiles import StaticFiles

upload_dir = Path(os.getenv("UPLOAD_DIR", "D:\\Dev\\EveryZoom\\uploads"))
upload_dir.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(upload_dir)), name="uploads")

import traceback
from fastapi import Request
from fastapi.responses import JSONResponse

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    error_msg = traceback.format_exc()
    with open("backend_errors.log", "a") as f:
        f.write(f"\n\n--- Error at {str(datetime.utcnow())} ---\n")
        f.write(error_msg)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error. Check backend_errors.log"},
    )

@app.get("/")
def read_root():
    return {"message": "Welcome to Jewelive API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

# API Routes
from app.api import auth, products, categories
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(products.router, prefix="/api/products", tags=["products"])
app.include_router(categories.router, prefix="/api/categories", tags=["categories"])


if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
