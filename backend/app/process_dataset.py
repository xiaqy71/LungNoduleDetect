from app.core.config import settings
import os
import cv2
from tqdm import tqdm


def draw_yolo_bboxes(image_path, txt_path, output_path, box_thickness=1):
    # 读取图片
    image = cv2.imread(image_path)

    # 读取YOLO格式的txt文件
    with open(txt_path, "r") as f:
        lines = f.readlines()

    for line in lines:
        # YOLO格式: class_id center_x center_y width height (相对于图片尺寸的比例)
        parts = line.strip().split()
        class_id, center_x, center_y, width, height = map(float, parts[0:5])

        # 获取图片的尺寸
        img_height, img_width, _ = image.shape

        # 将相对坐标转换为绝对坐标
        center_x_abs = int(center_x * img_width)
        center_y_abs = int(center_y * img_height)
        width_abs = int(width * img_width)
        height_abs = int(height * img_height)

        # 计算矩形的左上角和右下角坐标
        x1 = center_x_abs - width_abs // 2
        y1 = center_y_abs - height_abs // 2
        x2 = center_x_abs + width_abs // 2
        y2 = center_y_abs + height_abs // 2

        # 在图片上绘制蓝色矩形框，线宽为 1
        cv2.rectangle(image, (x1, y1), (x2, y2), (255, 0, 0), box_thickness)

    # 保存标注后的图片
    cv2.imwrite(output_path, image)


def process_batch(image_folder, label_folder, output_folder, box_thickness=1):
    # 获取所有图片文件
    image_files = [
        f for f in os.listdir(image_folder) if f.endswith((".jpg", ".jpeg", ".png"))
    ]

    # 使用 tqdm 显示进度条
    for image_file in tqdm(image_files, desc="Processing images", unit="image"):
        # 构建图片路径和对应的标签路径
        image_path = os.path.join(image_folder, image_file)
        label_file = image_file.replace(
            image_file.split(".")[-1], "txt"
        )  # 替换文件后缀为.txt
        label_path = os.path.join(label_folder, label_file)

        # 检查标签文件是否存在
        if not os.path.exists(label_path):
            print(f"Warning: Label file for {image_file} not found, skipping.")
            continue

        # 构建输出图片路径
        output_image_path = os.path.join(output_folder, image_file)

        # 绘制并保存标注后的图片
        draw_yolo_bboxes(image_path, label_path, output_image_path, box_thickness)


def init_dataset():
    # 使用示例
    image_folder = str(
        os.path.join(settings.BASE_DIR, "datasets", "val", "images")
    )  # 图片文件夹路径
    label_folder = str(
        os.path.join(settings.BASE_DIR, "datasets", "val", "labels")
    )  # 标签文件夹路径
    output_folder = str(
        os.path.join(settings.BASE_DIR, "datasets", "true_labels")
    )  # 输出文件夹路径

    # 确保输出文件夹存在
    os.makedirs(output_folder, exist_ok=True)

    # 批量处理
    process_batch(image_folder, label_folder, output_folder, box_thickness=2)

if __name__ == "__main__":
    init_dataset()