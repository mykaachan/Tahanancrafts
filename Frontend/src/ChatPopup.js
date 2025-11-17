import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = "https://tahanancrafts.onrender.com";

function ChatPopup() {
  const [open, setOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [newMessage, setNewMessage] = useState("");

  // New message modal states
  const [newMsgMode, setNewMsgMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedReceiver, setSelectedReceiver] = useState(null);

  const navigate = useNavigate();
  const userId = localStorage.getItem("user_id");

  // Click chat button → check login
  const handleOpenChat = () => {
    if (!userId) {
      navigate("/login");
      return;
    }
    setOpen(!open);
  };

  // Fetch conversations
  useEffect(() => {
    if (!open || !userId) return;

    axios
      .get(`${API}/api/chat/conversations/${userId}/`)
      .then((res) => {
        setConversations(res.data);

        if (!activeConversation && res.data.length > 0) {
          setActiveConversation(res.data[0]);
          markAsSeen(res.data[0].id);
        }
      })
      .catch(console.error);
  }, [open]);

  // Mark as seen
  const markAsSeen = (conversationId) => {
    axios.post(`${API}/api/chat/messages/${conversationId}/mark-seen/`, {
      user_id: userId,
    });
  };

  // Switch conversation
  const openChatWindow = (convo) => {
    setActiveConversation(convo);
    markAsSeen(convo.id);
  };

  // Send message in existing conversation
  const sendMessage = () => {
    if (!newMessage.trim() || !activeConversation) return;

    const receiver =
      activeConversation.user1 === parseInt(userId)
        ? activeConversation.user2
        : activeConversation.user1;

    axios
      .post(`${API}/api/chat/messages/send/`, {
        sender: userId,
        receiver: receiver,
        text: newMessage,
      })
      .then((res) => {
        setActiveConversation(res.data.conversation);
        setNewMessage("");

        axios
          .get(`${API}/api/chat/conversations/${userId}/`)
          .then((res) => setConversations(res.data));
      });
  };

  // Search users (new message modal)
  const searchUsers = (q) => {
    setSearchQuery(q);
    if (q.length < 1) {
      setSearchResults([]);
      return;
    }

    axios
      .get(`${API}/api/chat/users/search/?q=${q}`)
      .then((res) => setSearchResults(res.data));
  };

  // Send first message to a selected user
  const sendNewMessage = () => {
    if (!selectedReceiver || !newMessage.trim()) return;

    axios
      .post(`${API}/api/chat/messages/send/`, {
        sender: userId,
        receiver: selectedReceiver.id,
        text: newMessage,
      })
      .then(() => {
        setNewMsgMode(false);
        setSelectedReceiver(null);
        setSearchQuery("");
        setSearchResults([]);
        setNewMessage("");

        axios
          .get(`${API}/api/chat/conversations/${userId}/`)
          .then((res) => setConversations(res.data));
      });
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        type="button"
        onClick={handleOpenChat}
        style={{
          position: "fixed",
          bottom: "25px",
          right: "25px",
          background: "#c3a98d",
          color: "#fff",
          border: "none",
          borderRadius: "50%",
          width: "55px",
          height: "55px",
          fontSize: "24px",
          cursor: "pointer",
          boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
          zIndex: 999999,
        }}
      >
        💬
      </button>

      {/* Chat Window */}
      {open && userId && (
        <div
          style={{
            position: "fixed",
            bottom: "90px",
            right: "25px",
            width: "720px",
            height: "500px",
            background: "#f5f1ec",
            border: "1px solid #d1c3b3",
            borderRadius: "14px",
            display: "flex",
            overflow: "hidden",
            zIndex: 999999,
          }}
        >
          {/* Sidebar */}
          <div
            style={{
              width: "35%",
              background: "#f0e9e2",
              borderRight: "1px solid #d8ccc0",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                padding: "16px",
                fontWeight: "bold",
                fontSize: "1.1rem",
                color: "#4b3a2f",
                borderBottom: "1px solid #d8ccc0",
              }}
            >
              Chats
            </div>

            {/* NEW MESSAGE BUTTON */}
            <button
              onClick={() => setNewMsgMode(true)}
              style={{
                margin: "10px",
                padding: "10px",
                background: "#c3a98d",
                border: "none",
                borderRadius: "8px",
                color: "white",
                cursor: "pointer",
                fontSize: "0.9rem",
              }}
            >
              ➕ New Message
            </button>

            {/* Conversation List */}
            <div style={{ flex: 1, overflowY: "auto" }}>
              {conversations.map((convo) => (
                <div
                  key={convo.id}
                  onClick={() => openChatWindow(convo)}
                  style={{
                    padding: "10px 12px",
                    cursor: "pointer",
                    background:
                      activeConversation?.id === convo.id
                        ? "#e9dfd5"
                        : "transparent",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: "#d4c3b7",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "bold",
                      color: "#4b3a2f",
                      marginRight: "10px",
                    }}
                  >
                    {convo.other_user_initial}
                  </div>

                  <div>
                    <div style={{ fontWeight: "600" }}>
                      {convo.other_user_name}
                    </div>

                    <div
                      style={{
                        fontSize: "0.8rem",
                        color: "#625d57",
                        whiteSpace: "nowrap",
                        width: "140px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {convo.last_message}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div
            style={{
              width: "65%",
              display: "flex",
              flexDirection: "column",
              background: "#fdfaf7",
            }}
          >
            {/* Messages */}
            <div
              style={{
                flex: 1,
                padding: "20px",
                overflowY: "auto",
              }}
            >
              {activeConversation?.messages?.map((msg) => {
                const isUser = msg.sender === parseInt(userId);
                const senderName = isUser ? "You" : activeConversation.other_user_name;

                return (
                  <div
                    key={msg.id}
                    style={{
                      marginBottom: "12px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: isUser ? "flex-end" : "flex-start",
                    }}
                  >
                    {/* Sender name */}
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "#6d5a4b",
                        marginBottom: "2px",
                        marginLeft: isUser ? "0" : "6px",
                        marginRight: isUser ? "6px" : "0",
                      }}
                    >
                      {senderName}
                    </div>

                    {/* Bubble */}
                    <div
                      style={{
                        background: isUser ? "#fff" : "#f2e6db",
                        color: "#4b3a2f",
                        padding: "10px 14px",
                        borderRadius: "14px",
                        maxWidth: "70%",
                      }}
                    >
                      {msg.text}

                      {/* Seen status */}
                      {isUser && (
                        <div
                          style={{
                            fontSize: "0.7rem",
                            marginTop: "3px",
                            color: msg.seen ? "green" : "gray",
                            textAlign: "right",
                          }}
                        >
                          {msg.seen ? "Seen" : "Sent"}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input + SEND BUTTON */}
            <div
              style={{
                padding: "12px",
                borderTop: "1px solid #d1c3b3",
                background: "#fff",
                display: "flex",
                gap: "10px",
                alignItems: "center",
              }}
            >
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                type="text"
                placeholder="Type a message here"
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "10px",
                  border: "1px solid #d1c3b3",
                }}
              />

              <button
                onClick={sendMessage}
                style={{
                  padding: "10px 16px",
                  background: "#c3a98d",
                  borderRadius: "10px",
                  border: "none",
                  color: "white",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Message Modal */}
      {newMsgMode && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 99999999,
          }}
        >
          <div
            style={{
              width: "400px",
              background: "#fff",
              borderRadius: "12px",
              padding: "20px",
            }}
          >
            <h3 style={{ marginTop: 0 }}>New Message</h3>

            <label style={{ fontWeight: "bold" }}>To:</label>
            <input
              value={searchQuery}
              onChange={(e) => searchUsers(e.target.value)}
              placeholder="Search user name"
              style={{
                width: "100%",
                padding: "10px",
                marginBottom: "10px",
                borderRadius: "8px",
                border: "1px solid #ccc",
              }}
            />

            {searchResults.map((u) => (
              <div
                key={u.id}
                onClick={() => {
                  setSelectedReceiver(u);
                  setSearchResults([]);
                  setSearchQuery(u.name);
                }}
                style={{
                  padding: "8px",
                  background: "#f2f2f2",
                  borderRadius: "6px",
                  marginBottom: "5px",
                  cursor: "pointer",
                }}
              >
                {u.name}
              </div>
            ))}

            <label style={{ fontWeight: "bold" }}>Message:</label>
            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message"
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                marginBottom: "10px",
              }}
            />

            <div style={{ textAlign: "right" }}>
              <button
                onClick={() => setNewMsgMode(false)}
                style={{
                  marginRight: "10px",
                  padding: "6px 12px",
                  background: "#ccc",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>

              <button
                onClick={sendNewMessage}
                style={{
                  padding: "6px 12px",
                  background: "#c3a98d",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ChatPopup;
