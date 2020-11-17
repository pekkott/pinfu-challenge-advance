class EntryManager {
    constructor() {
        this.startModal = new StartModal('#modal-start');

        $('#start-free').on('click', (event) => this.openMatchingModal());
        $('#start-set').on('click', (event) => this.startSet());
    }

    openMatchingModal() {
        this.startModal.showModal();
    }

    startSet() {
        if (document.start.group_id.value != "") {
            document.start.submit();
        } else {
            alert("セット名を入力してください");
        }
    }
}

class Modal {
    constructor(modalId) {
        this.modalId = modalId;
    }

    showModal() {
        $(this.modalId).each(function(item, i) {
            item.classList.add("show-modal");
        });
    }

    closeModal() {
        $(this.modalId).each(function(item, i) {
            item.classList.remove("show-modal");
        });
    }
}

class StartModal extends Modal {
    showModal() {
        super.showModal();
    }
}

class WebSocketManager {
    constructor(mahjongManager) {
        let self = this;
        self.mahjongManager = mahjongManager;
        this.messageHandlers = [
            {type: "start", handler: this.receiveStart}
        ];
        if (window["WebSocket"]) {
            self.conn = new WebSocket("ws://" + document.location.host + "/ws");
            self.conn.onmessage = function (evt) {
                let message = JSON.parse(evt.data);
                self.messageHandlers.forEach(function(item) {
                    if (item.type == message["type"]) {
                        console.log("received message type:" + message["type"]);
                        item.handler(mahjongManager, message["values"]);
                    }
                });
            }
        }
    }

    receiveStart(mahjongManager, playInfo) {
        console.log(playInfo);
        mahjongManager.setPlayersId(playInfo.playerIds);
        mahjongManager.initRound(playInfo);
    }
}

window.onload = function() {
    new EntryManager();
}
