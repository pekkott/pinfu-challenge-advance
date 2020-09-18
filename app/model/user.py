import sys
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, Float, DateTime
from setting import Base, ENGINE, session

INITIAL_RATING = 1500
class User(Base):
    __tablename__ = 'users'
    user_id = Column('user_id', Integer, primary_key = True)
    strength = Column('strength', Integer)

    @staticmethod
    def add_new_user(user_id):
        try:
            user = User()
            user.id = user_id
            user.strength = INITIAL_RATING
            session.add(user)
            session.commit()
            return user
        except Exception as e:
            # TODO: エラーログ出力
            print(e)

    @staticmethod
    def get_strength_by_user_id(user_id):
        strength = session.query(User.strength).filter(User.user_id==user_id).one_or_none()
        if strength is None:
            User.add_new_user(user_id)
            return INITIAL_RATING
        else:
            return strength[0]

    @staticmethod
    def set_strength_by_user_id(user_id, strength):
        user = session.query(User).filter(User.user_id==user_id).one_or_none()
        print(type(user),user)
        if user is None:
            user = User.add_new_user(user_id)
        
        user.strength = strength
        session.commit()
