import sys
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, Float, DateTime
from setting import Base
from setting import ENGINE
from model.user import User
from model.user_game_history import UserGameHistory
from datetime import datetime, timedelta, timezone

def run():
    Base.metadata.create_all(bind=ENGINE)


if __name__ == '__main__':
    run()