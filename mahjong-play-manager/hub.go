// Copyright (c) 2013 The Gorilla WebSocket Authors. All rights reserved.
// https://github.com/gorilla/websocket/blob/master/LICENSE

package main
import (
	"log"
	"encoding/json"
	"net/http"
	"math/rand"
	"time"
	"io/ioutil"
	"strconv"
	"github.com/gorilla/websocket"
)

type HubManager struct {
	hubs map[string]*Hub
}

func newHubManager() *HubManager {
	return &HubManager{
		hubs: make(map[string]*Hub),
	}
}

func (hubManager *HubManager) createHub(groupId string) *Hub {
	m := MahjongPlayManager{}
	m.Init()
	hubManager.hubs[groupId] = newHub(groupId, &m)
	return hubManager.hubs[groupId]
}

func (hubManager *HubManager) getHub(groupId string) (*Hub, bool) {
	hub, exists := hubManager.hubs[groupId]
	return hub, exists
}

type Hub struct {
	clients map[*Client]bool
	broadcast chan []byte
	unregister chan *Client
	groupId string
	mahjongPlayManager *MahjongPlayManager
}

func newHub(groupId string, m *MahjongPlayManager) *Hub {
	return &Hub{
		broadcast:  make(chan []byte),
		unregister: make(chan *Client),
		clients:    make(map[*Client]bool),
                groupId:    groupId,
		mahjongPlayManager:    m,
	}
}

func (h *Hub) run() {
	for {
		select {
		case client := <-h.unregister:
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
			}
		case message := <-h.broadcast:
			var _ = message
			for client := range h.clients {
				log.Printf("client playerId:%d", client.playerId)
				select {
				case client.send <- h.mahjongPlayManager.sendMessages[client.playerId].ToBytes():
				log.Printf("sendMessage:%s", h.mahjongPlayManager.sendMessages[client.playerId].ToBytes())
				default:
					close(client.send)
					delete(h.clients, client)
				}
			}
		}
	}
}

func (h *Hub) setClient(client *Client) {
	h.clients[client] = true
}

type MatchedPlayers struct {
	Players [4]int "json:players"
}

// serveWs_matching handles websocket requests for matching from the peer.
func serveWs_matching(hubManager *HubManager, w http.ResponseWriter, r *http.Request) {
	log.Println("serveWs_matching")
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}
	log.Println("serveWs_matching")

	var uid = r.URL.Query().Get("uid");
	req, err := http.NewRequest(http.MethodGet, "http://localhost:5000/matching?uid="+uid, nil)
	if err != nil {
		log.Fatal(err)
	}
	
	resp, err := http.DefaultClient.Do(req)
    if err != nil {
        log.Fatal(err)
		}

	var matched_players MatchedPlayers
	var body []byte
	body, err = ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Fatal(err)
	}
	if err := json.Unmarshal(body,&matched_players); err != nil {
		// 空のjsonが返ってきた(マッチングが成立していない)場合。
		// log.Fatal(err)
		return
	}

	// uniqueなgroup_idを生成。
	rand.Seed(time.Now().UnixNano())
	var groupId = strconv.Itoa(rand.Intn(10000))
	// groupId := r.FormValue("group_id")
	hub, exists := hubManager.getHub(groupId)
	if !exists {
		hub = hubManager.createHub(groupId)
		defer hub.run()
	}
	log.Println(groupId)

	players := matched_players.Players
	for _, pid := range players {
		client := &Client{hub: hub, conn: conn, send: make(chan []byte, 256), playerId: pid}
		hub.setClient(client)
	}

	if hub.mahjongPlayManager.isReady() {
		hub.mahjongPlayManager.InitRound()
		hub.mahjongPlayManager.SendMessageStart()
		hub.broadcast <- []byte{}
		for c := range hub.clients {
			err = c.conn.WriteMessage(websocket.TextMessage, []byte(groupId))
			if err != nil {
				log.Fatal(err)
			}
		}
	}
}