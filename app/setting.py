from sqlalchemy import *
from sqlalchemy.orm import *
from sqlalchemy.ext.declarative import declarative_base
import os

# DATABASE = 'mysql://{user}:{password}@{host}/matching_service?charset=utf8'.format(**{
#         'user': os.getenv('MYSQL_USER', 'root'),
#         'password': os.getenv('MYSQL_PASSWORD', 'rootpassword12345hogefuga'),
#         'host': os.getenv('DB_HOST', 'mysql_c'),
#     })

DATABASE = 'mysql://{user}:{password}@{host}/{database}?charset=utf8'.format(**{
        'database' : os.getenv('MYSQL_DATABASE'),
        'user': os.getenv('MYSQL_USER'),
        'password': os.getenv('MYSQL_PASSWORD'),
        'host': os.getenv('DB_HOST'),
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