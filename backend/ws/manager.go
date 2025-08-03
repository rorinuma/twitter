package ws

import (
	"log"
	"net/http"
	"os"
	"sync"

	"github.com/gorilla/websocket"
	"github.com/rorinuma/twitter/utils"
)

type Client struct {
	UserID string
	Conn   *websocket.Conn
}

type Manager struct {
	clients map[string]*Client
	lock    sync.RWMutex
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		origin := r.Header.Get("Origin")
		allowedOrigin := os.Getenv("FRONTEND_URL")
		return origin == allowedOrigin
	},
}

var WsManager = &Manager{
	clients: make(map[string]*Client),
}

func (m *Manager) AddClient(userID string, conn *websocket.Conn) {
	m.lock.Lock()
	defer m.lock.Unlock()
	m.clients[userID] = &Client{UserID: userID, Conn: conn}
}

func (m *Manager) RemoveClient(userID string) {
	m.lock.Lock()
	defer m.lock.Unlock()
	delete(m.clients, userID)
}

func (m *Manager) NotifyUser(userID, eventType string, payload any) error {
	m.lock.RLock()
	defer m.lock.RUnlock()
	client, exists := m.clients[userID]
	if !exists {
		return nil
	}

	err := client.Conn.WriteJSON(map[string]any{
		"type": eventType,
		"data": payload,
	})

	if err != nil {
		m.RemoveClient(userID)
		client.Conn.Close()
	}

	return err
}

func WebSocketHandler(w http.ResponseWriter, r *http.Request) {
	userID, err := utils.ParseJWTFromRequest(r)

	if err != nil {
		log.Println("failed to read the user from context: ", err)
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		http.Error(w, "Failed to upgrade", http.StatusBadRequest)
		return
	}

	WsManager.AddClient(userID, conn)
	defer WsManager.RemoveClient(userID)

	for {
		_, _, err := conn.ReadMessage()
		if err != nil {
			break
		}
	}
}
