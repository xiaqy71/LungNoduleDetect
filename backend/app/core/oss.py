from app.utils import upload_file
from app.core.config import settings
from app.models import MinioBucket
import os

def init_oss():
    # 遍历所有图片文件
    for image_file in os.listdir(os.path.join(settings.BASE_DIR, "datasets", "true_labels")):
        upload_file(
            str(os.path.join(settings.BASE_DIR, "datasets", "true_labels", image_file)),
            MinioBucket.TRUELABELS,
            image_file,
        )
if __name__ == "__main__":
    init_oss()