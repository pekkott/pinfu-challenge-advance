// Copyright 2013 The Gorilla WebSocket Authors. All rights reserved.
// https://github.com/gorilla/websocket/blob/master/LICENSE

package main

import (
	"flag"
	"log"
	"net/http"
)

var addr = flag.String("addr", ":8080", "http service address")

func main() {
	hubManager := newHubManager()
	flag.Parse()
	http.Handle("/mahjong-ui/", http.StripPrefix("/mahjong-ui/", http.FileServer(http.Dir("../mahjong-ui"))))
	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		serveWs(hubManager, w, r)
	})
	err := http.ListenAndServe(*addr, nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
