import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import init_db
from app.routers import (
    auth, users, themes, vehicles, menu,
    bookings, pricing, payments, rides, offers,
    recommendations, admin
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: connect to database & seed initial records
    await init_db()
    yield
    # Shutdown logic if any

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="Full-stack artisanal moving cafe experience booking platform",
    lifespan=lifespan
)

# CORS configuration
origins = [
    settings.FRONTEND_URL,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
api_v1 = settings.API_V1_STR
app.include_router(auth.router, prefix=api_v1)
app.include_router(users.router, prefix=api_v1)
app.include_router(themes.router, prefix=api_v1)
app.include_router(vehicles.router, prefix=api_v1)
app.include_router(menu.router, prefix=api_v1)
app.include_router(pricing.router, prefix=api_v1)
app.include_router(bookings.router, prefix=api_v1)
app.include_router(payments.router, prefix=api_v1)
app.include_router(rides.router, prefix=api_v1)
app.include_router(offers.router, prefix=api_v1)
app.include_router(recommendations.router, prefix=api_v1)
app.include_router(admin.router, prefix=api_v1)

# Root WebSocket alias for convenient connection
@app.websocket("/ws/ride/{booking_id}")
async def ws_ride_alias(websocket: WebSocket, booking_id: str):
    await rides.ride_websocket_endpoint(websocket, booking_id)

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "currency": "INR (₹)"
    }
