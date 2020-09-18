from sqlalchemy import Column, Integer, String, Float, DateTime
from setting import Base, ENGINE, session


class UserGameHistory(Base):
    __tablename__ = 'user_game_histories'
    user_game_history_id = Column('user_game_history_id', Integer, primary_key = True)
    user_id = Column('user_id', Integer)
    game_id = Column('game_id', Integer)
    rank = Column('rank', Integer)
    date = Column('date', DateTime)


    @staticmethod
    def add_new_record(user_id, game_id, rank, date):
        user_game_history = UserGameHistory()
        user_game_history.user_id = user_id
        user_game_history.game_id = game_id
        user_game_history.rank = rank
        user_game_history.date = date
        session.add(user_game_history)
        session.commit()
