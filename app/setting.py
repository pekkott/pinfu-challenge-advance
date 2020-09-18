from sqlalchemy import *
from sqlalchemy.orm import *
from sqlalchemy.ext.declarative import declarative_base
import os

DATABASE = 'mysql://{user}:{password}@{host}/matching_service?charset=utf8'.format(**{
        'user': os.getenv('MYSQL_USER', 'root'),
        'password': os.getenv('MYSQL_PASSWORD', ''),
        'host': os.getenv('DB_HOST', 'mysql_c'),
    })

ENGINE = create_engine(
    DATABASE,
    encoding = "utf-8",
    echo=False
)

session = scoped_session(
    sessionmaker(
        autocommit = False,
        autoflush = False,
        bind = ENGINE
    )
)

Base = declarative_base()
Base.query = session.query_property()