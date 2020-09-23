- docker
  - network作成
    - `docker network create matching-network`
  - pythonコンテナ
    - イメージのビルド：`docker build -t python /home/vagrant/pinfu-challenge/docker-images/python `
    - シェルに入る：`docker run --rm --network matching-network  -v /home/vagrant/pinfu-challenge:/pinfu-challenge  --name python_c -it -p 5000:5000 python:latest /bin/ash`
  - mysqlコンテナ
    - イメージのビルド：`docker build -t mysql /home/vagrant/pinfu-challenge/docker-images/mysql`
    - mysqldの起動：`docker run --name mysql_c --network matching-network  -v /home/vagrant/pinfu-challenge/docker-images/mysql/data:/var/lib/mysql -p 3306:3306 -d mysql:latest`
    - シェルに入る： `docker exec -it mysql_c /bin/sh`
    - mysql起動確認：`mysql -umatching_api -p -h 127.0.0.1`


- DB初期化
  - `docker run --rm --network matching-network  -v /home/vagrant/pinfu-challenge:/pinfu-challenge  --name python_c -it python:latest  python /pinfu-challenge/app/init.py`
- DBテスト
  - `docker run --rm --network matching-network  -v /home/vagrant/pinfu-challenge:/pinfu-challenge  --name python_c -it -p 5000:5000 python:latest python /pinfu-challenge/app/test.py`