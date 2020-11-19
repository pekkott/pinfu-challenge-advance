class Debug {
    constructor() {
        this.conn = mahjongManager.webSocketManager.conn;
        $('body').insertFirst('<div id="debug">');
        [
            ["debug-start", "スタート"],
            ["debug-discard-tile", "ツモ切り"],
            ["debug-ron", "ロン"],
            ["debug-next", "次局"],
            ["debug-result", "結果"],
        ].forEach(function(attribute) {
            $('#debug').insertFirst(`<button id="${attribute[0]}">${attribute[1]}</button>`);
        });
    }

    debugStart(event) {
        this.conn.send(JSON.stringify({operation: "start", target: event.target.value}));
    }

    debugDiscardTile(event) {
        this.conn.send(JSON.stringify({operation: "discard", target: -1}));
    }

    debugRon(event) {
        this.conn.send(JSON.stringify({operation: "ron", target: -1}));
    }

    debugNext(event) {
        this.conn.send(JSON.stringify({operation: "next", target: event.target.value}));
    }

    debugResult(event) {
        this.conn.send(JSON.stringify({operation: "result", target: event.target.value}));
    }
}

window.addEventListener("load", function() {
    let debug = new Debug();
    $('#debug-start').on('click', (event) => debug.debugStart(event));
    $('#debug-discard-tile').on('click', (event) => debug.debugDiscardTile(event));
    $('#debug-ron').on('click', (event) => debug.debugRon(event));
    $('#debug-next').on('click', (event) => debug.debugNext(event));
    $('#debug-result').on('click', (event) => debug.debugResult(event));
});
