import aioredis
import os
from app.core.config import settings
import hashlib
from tqdm import tqdm


def calculate_md5(file_path):
    # 创建一个 MD5 哈希对象
    md5_hash = hashlib.md5()

    # 以二进制方式读取文件，并逐块更新哈希对象
    with open(file_path, "rb") as f:
        # 分块读取文件内容，防止大文件占用过多内存
        for chunk in iter(lambda: f.read(4096), b""):
            md5_hash.update(chunk)

    # 返回 MD5 值的十六进制表示
    return md5_hash.hexdigest()


async def init_cache():
    redis = await aioredis.from_url(
        "redis://" + settings.REDIS_SERVER, encoding="utf-8", decode_responses=True
    )
    images_dir = os.path.join(settings.BASE_DIR, "datasets", "val", "images")
    images = os.listdir(images_dir)

    for image in tqdm(images, desc="Processing images"):
        file_path = os.path.join(images_dir, image)
        md5 = calculate_md5(file_path)
        await redis.set(md5, image)
    await redis.close()


if __name__ == "__main__":
    import asyncio

    asyncio.run(init_cache())
