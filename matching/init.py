from setting import Base, ENGINE
from models.user import User
from models.user_game_history import UserGameHistory

def init():
    Base.metadata.create_all(bind=ENGINE)

if __name__ == '__main__':
    init()