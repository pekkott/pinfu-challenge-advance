class Mahjong {
    static get GET_WIND() {
        return [
            'east',
            'south',
            'west',
            'north'
        ];
    }

    static get GET_POSITION() {
        return [
            'self',
            'down',
            'opposite',
            'up'
        ];
    }

    static get POSITION_SELF() {
        return Mahjong.GET_POSITION[0];
    }

    static get POSITION_DOWN() {
        return Mahjong.GET_POSITION[1];
    }

    static get POSITION_OPPOSITE() {
        return Mahjong.GET_POSITION[2];
    }

    static get POSITION_UP() {
        return Mahjong.GET_POSITION[3];
    }

    static get HO_ROW_SIZE() {
        return 6;
    }

    static get HO_COLUMN_SIZE() {
        return 4;
    }

    static get HO_SIZE() {
        return this.HO_ROW_SIZE * this.HO_COLUMN_SIZE;
    }

    static get SELF() {
        return 0;
    }

    static get OPPOSITE() {
        return 1;
    }

    static get DOWN() {
        return 2;
    }

    static get UP() {
        return 3;
    }

    static get TILE_TYPES() {
        return [
            'ms1', 'ms2', 'ms3', 'ms4', 'ms5', 'ms6', 'ms7', 'ms8', 'ms9',
            'ps1', 'ps2', 'ps3', 'ps4', 'ps5', 'ps6', 'ps7', 'ps8', 'ps9',
            'ss1', 'ss2', 'ss3', 'ss4', 'ss5', 'ss6', 'ss7', 'ss8', 'ss9',
            'ji_e', 'ji_s', 'ji_w', 'ji_n', 'no', 'ji_h', 'ji_c'
        ];
    }

    static get RON_DURATION() {
        return 1000;
    }

    static get MODAL_DURATION() {
        return 2000;
    }
}

class MahjongManager {
    constructor() {
        this.wind = 0;
        this.players = [
            new PlayerSelf(0),
            new PlayerDown(1),
            new PlayerOpposite(2),
            new PlayerUp(3)
        ];
        this.ron = new Ron();
        this.startModal = new Modal('#modal-start');
        this.roundRonModal = new RoundResultModal('#modal-round-result');
        this.gameResultModal = new GameResultModal('#modal-game-result');
        this.operationButton = new OperationButton();
        this.webSocketManager = new WebSocketManager(this);

        $('#hands-tile-self').on('click', (event) => this.discard(event));
        $('#tile-drawn-self').on('click', (event) => this.discardDrawnTile(event));
        $('#close-modal-round-result').on('click', (event) => this.closeRoundResultModal());
        $('#close-modal-game-result').on('click', (event) => this.closeGameResultModal());
    }

    setPlayersId(playerIds) {
        this.players.forEach(function(player, i) {
            player.playerId = playerIds[i];
        });
    }

    initRound(playInfo) {
        this.setRound(playInfo.round);
        this.setWinds(playInfo.winds);
        this.updatePoints(playInfo.points);
        this.updatePlayerHands(playInfo.playerInfo);
        this.showPlayers();
        this.showPoint();
        this.showWind();
        this.showHands();
        this.showDrawnTile();
        this.clearHo();
        this.operationButton.hideButton();
    }

    setRound(round) {
        let windTable = {
            1:"東",
            2:"南"
        };
        let roundTable = {
            1:"一",
            2:"二",
            3:"三",
            4:"四"
        };
        $('#round').each(function(item) {
            item.innerHTML = windTable[round.wind] + roundTable[round.round] + "局";
        });
        if (round.subRound > 0) {
            $('#sub-round').each(function(item) {
                item.classList.remove("display-none");
            });
            $('.sub-round').each(function(item) {
                item.innerHTML = round.subRound;
            });
        } else {
            $('#sub-round').each(function(item) {
                item.classList.add("display-none");
            });
        }
    }

    setWinds(winds) {
        this.players.forEach(function(player, i) {
            player.wind.wind = winds[i];
        });
    }

    updatePlayerPoints(ronPoints) {
        this.roundRonModal.updatePlayerPoints(ronPoints);
    }

    updatePoints(points) {
        this.players.forEach(function(player, i) {
            player.point.point = points[i];
        });
    }

    updatePointsByRonInfo(ronInfo) {
        let points = [];
        ronInfo.ronPoints.forEach(function(ronPoint) {
            points.push(ronPoint.point);
        });

        this.updatePoints(points);
    }

    canDiscard(event) {
        return this.players[0].canDiscard();
    }

    discard(event) {
        self = this;
        this.players.forEach(function(player) {
            if (player.canDiscard()) {
                console.log("discard:" + event.target.value);
                let discarded = player.discard(event.target.value);
                player.updateHands(self);
                player.disableDiscard();
                player.showHo();
                player.showHands();
                player.showDrawnTile();
            }
        });
    }

    discardDrawnTile(event) {
        this.players.forEach(function(player) {
            if (player.canDiscard()) {
                player.discardDrawnTile();
                player.showHo();
            }
        });
    }

    updatePlayersPoint() {
    }

    updatePlayerHands(info) {
        this.players[0].hands = info.hands;
        this.players[0].drawnTile = info.drawnTile;
    }

    showHands() {
        this.players.forEach(function(player) {
            player.showHands();
        });
    }

    showDrawnTile() {
        this.players[0].showDrawnTile();
    }

    showWind() {
        this.players.forEach(function(player) {
            player.wind.show();
        });
    }

    showPlayers() {
        this.players.forEach(function(player) {
            player.showPlayer();
        });
    }

    showPoint() {
        this.players.forEach(function(player) {
            player.point.show();
        });
    }

    showRonMessage() {
        this.ron.showMessage();
    }

    hideRonMessage() {
        this.ron.hideMessage();
    }

    showRonPlayer(playerId) {
        this.ron.showPlayer(playerId);
    }

    hideRonPlayer() {
        this.ron.hidePlayer();
    }

    closeStartModal() {
        this.startModal.closeModal();
    }

    showRoundRonModal() {
        this.roundRonModal.showModal("和了");
    }

    closeRoundRonModal() {
        this.roundRonModal.closeModal();
    }

    showRoundDrawnGameModal() {
        this.roundRonModal.showModal("流局");
    }

    closeRoundDrawnGameModal() {
        this.roundRonModal.closeModal();
    }

    showGameResultModal(result) {
        this.gameResultModal.update(result);
        this.gameResultModal.showModal();
    }

    hideDrawnTile() {
        this.players[0].hideDrawnTile();
    }

    closeRoundResultModal() {
        this.roundRonModal.closeModal();
    }

    closeGameResultModal() {
        this.gameResultModal.closeModal();
    }

    clearHo() {
        this.players.forEach(function(player) {
            player.clearHo();
            player.showHo();
        });
    }
}

class Player {
    constructor(position, positionClassName, wind, pointClassName) {
        this.playerId = -1;
        this.position = position;
        this.positionClassName = positionClassName;
        this.wind = new Wind(wind, positionClassName);
        this.point = new Point(positionClassName);
        this.tilesDiscarded = new Map();
    }

    updateHands() {
    }

    showPlayer() {
        self = this;
        $('.player-' + self.positionClassName + '-image').each(function(item, i) {
            item.style.setProperty('--url-player', "url('/images/player_" + self.playerId + ".png')");
        });
    }

    showHands() {
    }

    showWind() {
        this.wind.show();
    }

    showHo() {
        let self = this;
        $('.tile-' + self.positionClassName).each(function(item, i) {
            self.showTile(item, self.tilesDiscarded.get(i));
            self.modifyTileLayout(item, i);
        });
    }

    toOrderedIndex() {
        return this.tilesDiscarded.size;
    }

    showTile(item, tileId) {
        let imageName = Mahjong.TILE_TYPES[this.toTileType(tileId)];
        if (imageName) {
            item.style.setProperty('--url-tile', "url('/images/p_" + imageName + '_' + (this.position + 1) + ".gif')");
        } else {
            item.style.setProperty('--url-tile', "");
        }
    }

    toTileType(i) {
        return Math.floor(i/4);
    }

    modifyTileLayout(i) {
    }

    canDiscard() {
        return false;
    }

    discard(tileIndex) {
    }

    discardOther(discardedTile) {
        if (discardedTile != -1) {
            let i = this.toOrderedIndex();
            this.tilesDiscarded.set(i, discardedTile);
        }
    }

    discardDrawnTile() {
    }

    clearHo() {
        this.tilesDiscarded = new Map();
        $('.tile-' + this.positionClassName).each(function(item, i) {
            item.style.setProperty('--url-tile', "");
        });
    }
}

class PlayerOpposite extends Player {
    constructor(wind) {
        super(Mahjong.OPPOSITE, Mahjong.POSITION_OPPOSITE, wind);
    }

    toOrderedIndex() {
        let order = this.tilesDiscarded.size;

        return Mahjong.HO_SIZE - 1 - order;
    }
}

class PlayerUp extends Player {
    constructor(wind) {
        super(Mahjong.UP, Mahjong.POSITION_UP, wind);
    }

    toOrderedIndex() {
        let order = this.tilesDiscarded.size;

        return (order*4 + 3) % Mahjong.HO_SIZE - Math.floor(order/6);
    }

    modifyTileLayout(item, i) {
        let tileTypeClass = this.chooseTileTypeClass(i);
        if (tileTypeClass) {
            item.className = 'tile-' + this.positionClassName + ' tile-horizontal-' + tileTypeClass;
        }
    }

    chooseTileTypeClass(i) {
        if (this.tilesDiscarded.has(i) && this.isAtBottom(i)) {
            return 'bottom';
        } else if (!this.tilesDiscarded.has(i) && this.hasUpperTile(i)) {
            return 'bottom-parts';
        } else {
            return 'middle';
        }

        return null;
    }

    hasUpperTile(i) {
        return this.tilesDiscarded.has(i - Mahjong.HO_COLUMN_SIZE);
    }

    isAtBottom(i) {
        return i > Mahjong.HO_SIZE - Mahjong.HO_COLUMN_SIZE - 1;
    }
}

class PlayerDown extends Player {
    constructor(wind) {
        super(Mahjong.DOWN, Mahjong.POSITION_DOWN, wind);
    }

    toOrderedIndex() {
        let order = this.tilesDiscarded.size;

        return (Mahjong.HO_SIZE - 1 - ((order + 1) % Mahjong.HO_ROW_SIZE)*Mahjong.HO_COLUMN_SIZE + Math.ceil((order + 1)/Mahjong.HO_ROW_SIZE)) % Mahjong.HO_SIZE;
    }
}

class PlayerSelf extends Player {
    constructor(wind) {
        super(Mahjong.SELF, Mahjong.POSITION_SELF, wind);
        this.hands = [];
        this.drawnTile = null;
        this.i = 0;
    }

    updateHands(mahjongManager) {
        this.i++;
        this.hands.sort(function(a, b) {return a - b;});
    }

    showHands() {
        let self = this;
        $('.tile-in-hands').each(function(item, i) {
            self.showTile(item, self.hands[i]);
        });
    }

    showDrawnTile() {
        let self = this;
        $('#tile-drawn-self').each(function(item) {
            console.log("drawnTile:" + self.drawnTile);
            self.showTile(item, self.drawnTile);
        });
    }

    hideDrawnTile(item) {
        $('#tile-drawn-self').each(function(item) {
            item.style.setProperty('--url-tile', "");
        });
    }

    modifyTileLayout(item, i) {
        let tileTypeClass = this.chooseTileTypeClass(i);
        if (tileTypeClass) {
            item.className = 'tile-' + this.positionClassName + ' tile-vertical-' + tileTypeClass;
        }
    }

    chooseTileTypeClass(i) {
        if (!this.hasNextRow(i)) {
            if (this.tilesDiscarded.has(i)) {
                return 'bottom';
            } else if (this.hasSelfRow(i) && this.hasUpperTile(i)) {
                return 'bottom-parts';
            }
        } else if (this.tilesDiscarded.has(i) || !this.hasBelowTile(i)) {
            return 'middle';
        }

        return null;
    }

    hasSelfRow(i) {
        return this.tilesDiscarded.has(i - (i % Mahjong.HO_ROW_SIZE));
    }

    hasNextRow(i) {
        return this.tilesDiscarded.has(i + Mahjong.HO_ROW_SIZE - (i % Mahjong.HO_ROW_SIZE));
    }

    hasUpperTile(i) {
        return this.tilesDiscarded.has(i - Mahjong.HO_ROW_SIZE);
    }

    hasBelowTile(i) {
        return this.tilesDiscarded.has(i + Mahjong.HO_ROW_SIZE);
    }

    discard(tileIndex) {
        if (this.canDiscard()) {
            let discarded = this.hands.splice(tileIndex, 1)[0];
            let i = this.toOrderedIndex();
            this.tilesDiscarded.set(i, discarded);
            this.drawnTile = -1;
        }
    }

    discardDrawnTile() {
        if (this.canDiscard()) {
            console.log("discard:" + this.drawnTile);
            let i = this.toOrderedIndex();
            this.tilesDiscarded.set(i, this.drawnTile);
            this.drawnTile = -1;
            this.showDrawnTile();
        }
    }

    canDiscard() {
        return this.drawnTile != -1;
    }

    disableDiscard() {
        this.drawnTile = -1;
    }

    clearHo() {
        super.clearHo();
        $('.tile-' + this.positionClassName).each(function(item, i) {
            item.className = "tile-self tile-vertical-middle";
        });
    }
}

class Wind {
    constructor(wind, positionClassName) {
        this.wind = wind;
        this.positionClassName = positionClassName;
    }

    show() {
        self = this;
        $('#wind-' + self.positionClassName).each(function(item, i) {
            item.firstElementChild.className = 'wind-' + Mahjong.GET_WIND[self.wind - 1] + '-' + self.positionClassName;
        });
    }
}

class Point {
    constructor(positionClassName) {
        this.point = 0;
        this.positionClassName = positionClassName;
    }

    show() {
        self = this;
        $('#point-' + self.positionClassName).each(function(item, i) {
            item.innerHTML = self.point;
        });
    }
}

class Ron {
    showMessage() {
        $('.ron').each(function(item, i) {
            item.classList.add("ron-message");
        });
    }

    hideMessage() {
        $('.ron').each(function(item, i) {
            item.classList.remove("ron-message");
        });
    }

    showPlayer(playerId) {
        $('.ron').each(function(item, i) {
            item.style.setProperty('--url-ron', "url('/images/ron_" + playerId + ".png')");
            item.classList.add("ron-player");
        });
    }

    hidePlayer() {
        $('.ron').each(function(item, i) {
            item.classList.remove("ron-player");
        });
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

class RoundResultModal extends Modal {
    updatePlayerPoints(ronPoints) {
        console.log(ronPoints);
        $('.player-icon-round-result').each(function(item, i) {
            item.style.setProperty('--url-player', "url('/images/player_" + ronPoints[i].playerId + ".png')");
        });
        $('.player-point').each(function(item, i) {
            item.innerHTML = ronPoints[i].point;
        });
        $('.player-point-diff').each(function(item, i) {
            if (ronPoints[i].pointDiff == 0) {
                item.innerHTML = "";
            } else {
                item.innerHTML = (ronPoints[i].pointDiff > 0 ? "+" : "") + ronPoints[i].pointDiff;
            }
        });
    }

    showModal(modalTitle) {
        $('.round-result-header').each(function(item, i) {
            item.innerHTML = modalTitle;
        });
        super.showModal();
    }
}

class GameResultModal extends Modal {
    update(result) {
        $('.player-icon-game-result').each(function(item, i) {
            item.style.setProperty('--url-player', "url('/images/player_" + result[i].playerId + ".png')");
        });
        $('.result-order').each(function(item, i) {
            item.innerHTML = result[i].order > 0 ? result[i].order : "-";
        });
        $('.result-point').each(function(item, i) {
            item.innerHTML = (result[i].point > 0 ? "+" : "") + result[i].point;
        });
    }
}

class OperationButton {
    showButton() {
        $('#operation').each(function(item) {
            item.classList.remove("display-none");
        });
    }

    hideButton() {
        $('#operation').each(function(item) {
            item.classList.add("display-none");
        });
    }
}

class WebSocketManager {
    constructor(mahjongManager) {
        let self = this;
        self.mahjongManager = mahjongManager;
        mahjongManager.webSocketManager = this;
        this.messageHandlers = [
            {type: "start", handler: this.receiveStart},
            {type: "discard", handler: this.receiveDiscard},
            {type: "drawn", handler: this.receiveDrawn},
            {type: "discardOther", handler: this.receiveDiscardOther},
            {type: "ron", handler: this.receiveRon},
            {type: "skip", handler: this.receiveSkip},
            {type: "drawnRound", handler: this.receiveDrawnRound},
            {type: "next", handler: this.receiveNext},
            {type: "result", handler: this.receiveResult}
        ];
        if (window["WebSocket"]) {
            let params = (new URL(document.location)).searchParams;
            let group_id = params.get('group_id');
            let ws_protocol = location.protocol == 'https:' ? 'wss' : 'ws';
            self.conn = new WebSocket(ws_protocol + "://" + document.location.host + "/ws?group_id=" + group_id);
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
        $('#hands-tile-self').on('click', (event) => this.sendDiscard(event));
        $('#tile-drawn-self').on('click', (event) => this.sendDiscard(event));
        $('#ron').on('click', (event) => this.sendRon(event, mahjongManager));
        $('#skip').on('click', (event) => this.sendSkip(event, mahjongManager));
    }

    receiveStart(mahjongManager, playInfo) {
        console.log(playInfo);
        mahjongManager.setPlayersId(playInfo.playerIds);
        mahjongManager.initRound(playInfo);
        mahjongManager.closeStartModal();
    }

    receiveDiscard(mahjongManager, playerInfo) {
        console.log(playerInfo);
        mahjongManager.updatePlayerHands(playerInfo);
        mahjongManager.showHands();
    }

    receiveDrawn(mahjongManager, playerInfo) {
        console.log(playerInfo);
        mahjongManager.updatePlayerHands(playerInfo);
        mahjongManager.showDrawnTile();
        mahjongManager.players[3].discardOther(playerInfo.discardedTileUp);
        mahjongManager.players[3].showHo();
        mahjongManager.operationButton.hideButton();
    }

    receiveDiscardOther(mahjongManager, discardedTileInfo) {
        console.log("discard other position:" + discardedTileInfo.playerPosition);
        console.log("discard other tile:" + discardedTileInfo.discardedTile);
        if (discardedTileInfo.canRon) {
            mahjongManager.operationButton.showButton();
        }
        mahjongManager.players[discardedTileInfo.playerPosition].discardOther(discardedTileInfo.discardedTile);
        mahjongManager.players[discardedTileInfo.playerPosition].showHo();
    }

    receiveRon(mahjongManager, ronInfo) {
        console.log(ronInfo);
        mahjongManager.updatePlayerPoints(ronInfo.ronPoints);

        mahjongManager.showRonMessage();
        setTimeout(function () {
            mahjongManager.hideRonMessage()
        }, Mahjong.RON_DURATION);

        setTimeout(function () {
            mahjongManager.showRonPlayer(ronInfo.ronPlayerId);
        }, Mahjong.RON_DURATION);
        setTimeout(function () {
            mahjongManager.hideRonPlayer()
        }, Mahjong.RON_DURATION*2);

        setTimeout(function () {
            mahjongManager.showRoundRonModal();
        }, Mahjong.RON_DURATION*2);
        setTimeout(function () {
            mahjongManager.closeRoundRonModal();
            mahjongManager.webSocketManager.sendNext();
        }, Mahjong.RON_DURATION*2 + Mahjong.MODAL_DURATION);

        mahjongManager.updatePointsByRonInfo(ronInfo);
        mahjongManager.showPoint();
    }

    receiveSkip(mahjongManager, skipInfo) {
        console.log(skipInfo);
        mahjongManager.operationButton.hideButton();
    }

    receiveDrawnRound(mahjongManager, drawnRoundInfo) {
        console.log(drawnRoundInfo);
        let playerPosition = drawnRoundInfo.discardedTileInfo.playerPosition;
        if (playerPosition != 0) {
            mahjongManager.players[playerPosition].discardOther(drawnRoundInfo.discardedTileInfo.discardedTile);
            mahjongManager.players[playerPosition].showHo();
        }
        mahjongManager.updatePlayerPoints(drawnRoundInfo.ronPoints);

        mahjongManager.showRoundDrawnGameModal();
        setTimeout(function() {
            mahjongManager.closeRoundRonModal();
            mahjongManager.webSocketManager.sendNext();
        }, Mahjong.MODAL_DURATION);
    }

    receiveNext(mahjongManager, playInfo) {
        mahjongManager.initRound(playInfo);
    }

    receiveResult(mahjongManager, resultInfo) {
        console.log(resultInfo);
        mahjongManager.showGameResultModal(resultInfo);
    }

    sendDiscard(event) {
        if (this.mahjongManager.canDiscard()) {
            console.log("send:" + event.target.value);
            this.conn.send(JSON.stringify({operation: "discard", target: event.target.value}));
        }
    }

    sendRon(event, mahjongManager) {
        console.log("send ron");
        mahjongManager.operationButton.hideButton();
        this.conn.send(JSON.stringify({operation: "ron", target: -1}));
    }

    sendSkip(event, mahjongManager) {
        console.log("send skip");
        mahjongManager.operationButton.hideButton();
        this.conn.send(JSON.stringify({operation: "skip", target: -1}));
    }

    sendNext() {
        this.conn.send(JSON.stringify({operation: "next", target: -1}));
    }
}

let mahjongManager;

window.addEventListener("load", function() {
    mahjongManager = new MahjongManager();
    mahjongManager.showHands();
});
