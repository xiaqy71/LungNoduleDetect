from fastapi import APIRouter, HTTPException
from typing import Any
from app.models import HistoriesPublic, History, HistoryPublic, MinioBucket, Message
from app.api.deps import SessionDep, CurrentUser
from sqlmodel import col, delete, func, select
from app.utils import generate_presigned_url
import uuid

router = APIRouter(prefix='/histories', tags=["histories"])

@router.get("/", response_model=HistoriesPublic)
def read_histories(session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 10) -> Any:
    if current_user.is_superuser:
        count_statement = select(func.count()).select_from(History)
        count = session.exec(count_statement).one()
        statement = select(History).order_by(History.timestamp.desc()).offset(skip).limit(limit)
        histories = session.exec(statement).all()
    else:
        count_statement = select(func.count()).select_from(History).where(History.owner_id == current_user.id)
        count = session.exec(count_statement).one()
    
        statement = select(History).order_by(History.timestamp.desc()).where(History.owner_id == current_user.id).offset(skip).limit(limit)
        histories = session.exec(statement).all()
    histories = [detection.model_dump() for detection in histories]
    for detection in histories:
        detection["raw_image_url"] = generate_presigned_url(MinioBucket.UPLOAD, detection["raw_image"])
        detection["annotated_image_url"] = generate_presigned_url(MinioBucket.ANNOTATED, detection["annotated_image"])
        if detection["true_labels"]:
            detection["true_labels_url"] = generate_presigned_url(MinioBucket.TRUELABELS, detection["true_labels"])
        else:
            detection["true_labels_url"] = None
    return HistoriesPublic(data=histories, count=count)

@router.get("/{id}", response_model=HistoryPublic)
def read_history(session: SessionDep, current_user: CurrentUser, id: uuid.UUID) -> Any:
    history = session.get(History, id)
    if not history:
        return HTTPException(status_code=404, detail="History not found")
    if not current_user.is_superuser and (history.owner_id != current_user.id):
        return HTTPException(status_code=400, detail="Permission denied")
    history = history.model_dump()
    history["raw_image_url"] = generate_presigned_url(MinioBucket.UPLOAD, history["raw_image"])
    history["annotated_image_url"] = generate_presigned_url(MinioBucket.ANNOTATED, history["annotated_image"])
    if history["true_labels"]:
        history["true_labels_url"] = generate_presigned_url(MinioBucket.TRUELABELS, history["true_labels"])
    else:
        history["true_labels_url"] = None
    return HistoryPublic(**history)

@router.delete("/{id}")
def delete_history(session: SessionDep, current_user: CurrentUser, id: uuid.UUID) -> Message:
    history = session.get(History, id)
    if not history:
        return HTTPException(status_code=404, detail="History not found")
    if not current_user.is_superuser and (history.owner_id != current_user.id):
        return HTTPException(status_code=400, detail="Permission denied")
    session.delete(history)
    session.commit()
    return Message(message="History deleted successfully")
    