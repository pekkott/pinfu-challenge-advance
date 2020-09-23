from models.user import User
from models.user_game_history import UserGameHistory
from datetime import datetime, timedelta, timezone
# import init


def main():
    # init.init()
    UserGameHistory.add_new_record(2, 3, 4, datetime.now(timezone(timedelta(hours=+9), 'JST')))
    print(User.get_strength_by_user_id(3))
    User.set_strength_by_user_id(3,3333)
    print(User.get_strength_by_user_id(3))

if __name__ == '__main__':
    main()