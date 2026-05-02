from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from routes import chat, rag, blogs, gallery

app = FastAPI(title="Portfolio OS Backend", version="2.0.0")

@app.middleware("http")
async def add_cors_headers(request: Request, call_next):
    if request.method == "OPTIONS":
        return JSONResponse(
            content={},
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "*",
                "Access-Control-Allow-Headers": "*",
            }
        )
    response = await call_next(request)
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "*"
    return response

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router,    prefix="/chat",    tags=["chat"])
app.include_router(rag.router,     prefix="/rag",     tags=["rag"])
app.include_router(blogs.router,   prefix="/blogs",   tags=["blogs"])
app.include_router(gallery.router, prefix="/gallery", tags=["gallery"])

@app.get("/")
async def root():
    return {"status": "Portfolio OS backend running"}

@app.get("/health")
async def health():
    return {"status": "ok"}
