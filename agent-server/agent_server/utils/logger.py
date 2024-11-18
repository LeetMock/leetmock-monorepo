import logging


def get_logger(name: str) -> logging.Logger:
    # Configure the logger
    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)

    return logger
