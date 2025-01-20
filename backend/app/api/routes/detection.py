import os
import uuid
from typing import Any

from fastapi import APIRouter, HTTPException, File, UploadFile
from sqlmodel import func, select

from app.core.config import settings
from app.api.deps import CurrentUser, SessionDep
from app.detector import Detector
from app.utils import upload_file, generate_presigned_url
from app.models import MinioBucket
from contextlib import asynccontextmanager

detector: Detector | None = None


@asynccontextmanager
async def lifespan(app: APIRouter):
    global detector
    detector = Detector(
        model_path=os.path.join(settings.BASE_DIR, "yolo_models", "best.pt")
    )
    yield
    detector = None


router = APIRouter(tags=["detection"], lifespan=lifespan)


@router.post("/detect")
def detect_image(
    session: SessionDep, current_user: CurrentUser, file: UploadFile = File(...)
):
    # 确保文件名唯一
    unique_filename = f"{uuid.uuid4()}_{file.filename}"
    # 保存临时文件到本地
    temp_file_path = os.path.join(settings.BASE_DIR, "temp", unique_filename)
    os.makedirs(os.path.dirname(temp_file_path), exist_ok=True)
    with open(temp_file_path, "wb") as buffer:
        buffer.write(file.file.read())
        
    # 上传到Minio
    upload_file(temp_file_path, MinioBucket.UPLOAD, unique_filename)
    
    # 预测
    try:
        detections = detector.detect(temp_file_path)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        os.remove(temp_file_path)
    
    
    return {"detections": detections}
