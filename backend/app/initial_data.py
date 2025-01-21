import logging

from sqlmodel import Session

from app.core.db import engine, init_db
from app.core.cache import init_cache
from app.core.oss import init_oss
import asyncio

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def init() -> None:
    with Session(engine) as session:
        init_db(session)
    init_oss()
    await init_cache()


async def main() -> None:
    logger.info("Creating initial data")
    await init()
    logger.info("Initial data created")



if __name__ == "__main__":
    asyncio.run(main())
