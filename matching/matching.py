import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from flask import Flask, request, jsonify
import json
from app.models.user import User
from app.models.user_game_history import UserGameHistory

app = Flask(__name__)

THRESHOLD = 70.0
waiting_list = []

def is_matched(candidate_user, matched_list, THRESHOLD=THRESHOLD):
  s = 0.0
  for tmp in matched_list:
    s += tmp['strength']
  c = s/len(matched_list)
  return abs(c - candidate_user['strength']) < THRESHOLD

@app.route("/")
def hello_world():
  app.logger.debug("waiting_list: {}".format(waiting_list))
  return "Hello, World!"

@app.route("/matching", methods=['GET'])
def matching():
  app.logger.debug("waiting_list: {}".format(waiting_list))

  uid = int(request.args.get("uid"))
  for dic in waiting_list:
    if uid in dic.values():
      return json.dumps({"players": []})
  
  # 新規ユーザーであれば登録.それ以外はdbから強さ取ってくる。
  strength = User.get_strength_by_user_id(uid)

  incoming_user = {'uid':uid, "strength":strength}
  matched_list = [incoming_user]
  for waiting_user in waiting_list:
    if is_matched(waiting_user, matched_list):
      matched_list.append(waiting_user)
      app.logger.debug("matched_list: {}".format(matched_list))
      if len(matched_list) == 4:
        app.logger.debug("these players are matched: {}".format(matched_list))
        res_list = []
        for matched_user in matched_list:
          res_list.append(matched_user['uid'])
        matched_list.remove(incoming_user)
        for matched_user in matched_list:
          waiting_list.remove(matched_user)
        res_json = json.dumps({"players": res_list})
        matched_list = []
        print("res json: {}".format(res_json))
        return res_json

  waiting_list.append(incoming_user)
  matched_list = []

  return json.dumps({"players": []})

def update_rate(result):
  sum_strength = []

  for i in result:
    sum_strength.append(User.get_strength_by_user_id(i["uid"]))
  mean_strength = sum(sum_strength)/4

  for res in result:
    rank = int(res["rank"])
    uid = res["uid"]
    now_strength = User.get_strength_by_user_id(uid)
    if rank == 1:
      point = 50
    elif rank == 2:
      point = 10
    elif rank == 3:
      point = -20
    else:
      point = -40
    hendou = (point + (mean_strength - now_strength) / 80) * 0.1
    print("uid: {}, hendou: {}".format(uid, hendou))
    new_strength = now_strength + hendou

    User.set_strength_by_user_id(uid, new_strength)
  
  return 

def log_history(game_id, date, result):
  for res in result:
    rank = res["rank"]
    uid = res["uid"]
    UserGameHistory.add_new_record(user_id=uid, game_id=game_id, rank=rank, date=date)

  return


@app.route("/game_end", methods=['POST'])
def game_end():
  print(request.json)
  game_id = request.json['game_id']
  date = request.json['date']
  result = request.json['result']
  update_rate(result)
  log_history(game_id, date, result)

  return jsonify({'message': 'ok.'}), 200



if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)