// Copyright (c) 2013 The Gorilla WebSocket Authors. All rights reserved.
// https://github.com/gorilla/websocket/blob/master/LICENSE

package main
import "log"

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
