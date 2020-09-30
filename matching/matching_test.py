import pytest
from matching import is_matched, app, log_history
import datetime
import json

@pytest.fixture
def client():
    app.config['TESTING'] = True

    with app.test_client() as client:
        yield client

def test_is_matched_ok():

    matched_list = [{'uid':1, "strength":1500}, {'uid':2, "strength":1490}, {'uid':3, "strength":1515}]
    true_result = is_matched({'uid':4, "strength":1510}, matched_list, 30)
    assert True == true_result
    false_result = is_matched({'uid':4, "strength":1550}, matched_list, 30)
    assert False == false_result

def test_flask_simple(client):
    result = client.get('/')
    assert b'Hello, World!' == result.data

def test_log_history():
    game_id = 999
    date = datetime.datetime.now()
    result = json.dumps({"result": [{"uid": 111, "rank": 1}, {"uid": 222, "rank": 2}, {"uid": 333, "rank": 3}, {"uid": 444, "rank": 4}]})
    log_history(game_id, date, result)
