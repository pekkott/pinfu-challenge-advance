class EntryManager {
    constructor() {
        $('#start-free').on('click', (event) => this.startFree());
        $('#start-set').on('click', (event) => this.startSet());
    }

    startFree() {
        if (window["WebSocket"]) {
            // let params = (new URL(document.location)).searchParams;
            // let uid = params.get('uid');
            let uid = Math.floor(Math.random() * (100 - 1)) + 1;
            let ws_protocol = location.protocol == 'https:' ? 'wss' : 'ws';
            let conn = new WebSocket(ws_protocol + "://" + document.location.host + "/ws_matching?uid=" + uid);
            document.getElementById("now_matching").classList.add("visible");
            conn.onmessage = function (evt) {
                // let message = JSON.parse(evt.data);
                // let group_id = message["group_id"];
                let group_id = parseInt(evt.data);

                // let params = (new URL(document.location)).searchParams;
                // params.set('group_id', group_id);
                // window.location.href = "/html/mahjong.html"

                document.getElementById("group_id").value = group_id;
                document.start.submit();
            }
        }
    }

    startSet() {
        if (document.start.group_id.value != "") {
            document.start.submit();
        } else {
            alert("セット名を入力してください");
        }
    }
}

window.onload = function() {
    new EntryManager();
}
