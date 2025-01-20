import os.path
from ultralytics import YOLO
from app.core.config import settings
from app.models import MinioBucket
from app.utils import upload_file, generate_presigned_url


class Detector:
    """
    yolo detector class
    """

    def __init__(self, model_path: str):
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found: {model_path}")
        self.model = YOLO(model_path)

    def detect(self, image_path: str) -> dict:

        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image file not found: {image_path}")

        results = self.model(image_path)
        result = results[0]

        image_name = os.path.basename(image_path).replace(".png", "_annotated.png")
        save_path = os.path.join(settings.BASE_DIR, "temp", str(image_name))
        result.save(save_path)

        # 保存到minio
        upload_file(save_path, MinioBucket.ANNOTATED, str(image_name))
        os.remove(save_path)

        nodules = []

        for box in result.boxes:
            x, y, w, h = (
                box.xywh[0][0].item(),
                box.xywh[0][1].item(),
                box.xywh[0][2].item(),
                box.xywh[0][3].item(),
            )

            nodules.append(
                {"x": x, "y": y, "width": w, "height": h, "confidence": box.conf.item()}
            )

        detections = {"Speed": result.speed["inference"], "Nodules": nodules}

        return detections
