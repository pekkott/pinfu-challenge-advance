from sqlalchemy import *
from sqlalchemy.orm import *
from sqlalchemy.ext.declarative import declarative_base
import os

# mysqlのDBの設定
# DATABASE = 'mysql://%s:%s@%s/%s?charset=utf8' % (
#     "user_name",
#     "password",
#     "host_ip",
#     "db_name",
# )
DATABASE = 'mysql://{user}:{password}@{host}/matching_service?charset=utf8'.format(**{
        'user': os.getenv('MYSQL_USER', 'root'),
        'password': os.getenv('MYSQL_PASSWORD', ''),
        'host': os.getenv('DB_HOST', 'mysql_c'),
    })
ENGINE = create_engine(
    DATABASE,
    encoding = "utf-8",
    echo=False # Trueだと実行のたびにSQLが出力される
)

# Sessionの作成
session = scoped_session(
  # ORM実行時の設定。自動コミットするか、自動反映するなど。
        sessionmaker(
            autocommit = False,
            autoflush = False,
            bind = ENGINE
        )
)

# modelで使用する
Base = declarative_base()
Base.query = session.query_property()