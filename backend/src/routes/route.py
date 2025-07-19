from fastapi import APIRouter
from models.user import Todo
from database.db import get_collection
from schemas.schema import list_serial
from bson import ObjectId

router = APIRouter()

# GET Request Method
@router.get("/track/")
async def get_todos():
    todos = list_serial(get_collection("todo_collection").find())
    return todos

# POST Reques Method
@router.post("/track")
async def post_todo(todo: Todo):
    get_collection("todo_collection").insert_one(dict(todo))