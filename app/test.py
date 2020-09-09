import sys
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, Float, DateTime
from setting import Base
from setting import ENGINE
from model.user import User
from model.user_game_history import UserGameHistory
from datetime import datetime, timedelta, timezone
import init


def main():
    init.run()
    UserGameHistory.add_new_record(2, 3, 4, datetime.now(timezone(timedelta(hours=+9), 'JST')))
    print(User.get_strength_by_user_id(3))
    User.set_strength_by_user_id(3,3333)
    print(User.get_strength_by_user_id(3))


if __name__ == '__main__':
    main()