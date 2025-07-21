from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from schemas.errors import SimpleErrorResponse
from config.settings import settings
from database.startup import create_indexes

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from routes.auth import router as auth_router
from routes.route import router
#from backend.src.database.db import connect_to_mongo, close_mongo_connection


# App
app = FastAPI(
    title="AlgaeTrack API",
    description="API for AlgaeTrack - Macroalgae Growth Prediction System",
    version="1.0.0"
)

# Handle Errors ValueError
@app.exception_handler(RequestValidationError)
async def simplify_validation_errors(request: Request, exc: RequestValidationError):
    simplified_errors = [
        {"message": error["msg"], "field": error["loc"][-1]}
        for error in exc.errors()
    ]
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"errors": simplified_errors}
    )




@app.on_event("startup")
def on_startup():
    create_indexes()



# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)




# ROUTERS
# Router Login
app.include_router(auth_router)
app.include_router(router)



# Database connection events
# @app.on_event("startup")
# async def startup_event():
#     await connect_to_mongo()

# @app.on_event("shutdown")
# async def shutdown_event():
#     await close_mongo_connection()


@app.get("/")
async def root():
    return {"message": "Welcome to AlgaeTrack API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": "2025-07-18T00:00:00Z"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)