import os
import uuid
from typing import Any

from fastapi import APIRouter, HTTPException, File, UploadFile
import aioredis
from app.core.config import settings
from app.api.deps import CurrentUser, SessionDep
from app.core.cache import calculate_md5
from app.detector import Detector
from app.utils import upload_file, generate_presigned_url
from app.models import (
    MinioBucket,
    DetectionResponse,
    HistoryCreate,
)
from contextlib import asynccontextmanager
from app.crud import create_history
from datetime import datetime, timezone
import json

detector: Detector | None = None
redis: aioredis.Redis | None = None


@asynccontextmanager
async def lifespan(app: APIRouter):
    global detector
    detector = Detector(
        model_path=os.path.join(settings.BASE_DIR, "yolo_models", "best.pt")
    )
    global redis
    redis = await aioredis.from_url(
        "redis://localhost", encoding="utf-8", decode_responses=True
    )
    yield
    detector = None
    await redis.close()


router = APIRouter(tags=["detection"], lifespan=lifespan)


@router.post("/detect", response_model=DetectionResponse)
async def detect_image(
    session: SessionDep,
    current_user: CurrentUser,
    file: UploadFile = File(...),
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
        truelabel_file_name = await redis.get(calculate_md5(temp_file_path))
        current_time = datetime.now(timezone.utc)
        create_history(
            session=session,
            history_in=HistoryCreate(
                raw_image=unique_filename,
                annotated_image=unique_filename.replace(".png", "_annotated.png"),
                true_labels=truelabel_file_name,
                timestamp=current_time.isoformat(),
                detections=json.dumps(detections),
            ),
            owner_id=current_user.id,
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        os.remove(temp_file_path)
    true_labels_url = None
    if truelabel_file_name:
        true_labels_url = generate_presigned_url(
            MinioBucket.TRUELABELS, truelabel_file_name
        )
    return DetectionResponse(
        raw_image_url=generate_presigned_url(MinioBucket.UPLOAD, unique_filename),
        annotated_image_url=generate_presigned_url(
            MinioBucket.ANNOTATED, unique_filename.replace(".png", "_annotated.png")
        ),
        true_labels_url=true_labels_url,
        **detections,
    )
