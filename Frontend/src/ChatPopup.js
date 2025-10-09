import React, { useState } from "react";

function ChatPopup() {
  const [open, setOpen] = useState(false);
  const [activeChat, setActiveChat] = useState("Habing Ibaan");

  const chats = [
    {
      name: "Habing Ibaan",
      date: "05/08/25",
      preview: "Hello po ma’am/sir, yes po! m...",
      messages: [
        { sender: "user", text: "Hello po, may available po ba na ibang color?" },
        {
          sender: "shop",
          text: `Hi there! 😊
Welcome to Habing Ibaan Shop — your place for proudly handcrafted treasures made by local artisans. Feel free to browse, and let us know if you need help! 🌿🧵`,
        },
        { sender: "shop", text: "Hello po ma’am/sir, yes po! may available po na ibang kulay. Thank you!" },
      ],
    },
    {
      name: "Iraya Lipa",
      date: "02/12/25",
      preview: "Welcome to Iraya! where tr...",
      messages: [],
    },
  ];

  const currentChat = chats.find((c) => c.name === activeChat);

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setOpen(!open)}
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
          zIndex: 999999, // ensures the button stays on top
        }}
      >
        💬
      </button>

      {/* Popup Window */}
      {open && (
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
            boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
            display: "flex",
            overflow: "hidden",
            zIndex: 999999, // 👈 updated to always stay on top
            fontFamily: "'Segoe UI', sans-serif",
            animation: "fadeIn 0.25s ease-in-out",
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
              Chat (1)
            </div>

            <input
              type="text"
              placeholder="Search name"
              style={{
                margin: "10px 14px",
                padding: "8px",
                borderRadius: "8px",
                border: "1px solid #e0d5ca",
                outline: "none",
                fontSize: "0.9rem",
                background: "#fff",
              }}
            />

            <div style={{ flex: 1, overflowY: "auto" }}>
              {chats.map((chat) => (
                <div
                  key={chat.name}
                  onClick={() => setActiveChat(chat.name)}
                  style={{
                    padding: "10px 12px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    background:
                      activeChat === chat.name ? "#e9dfd5" : "transparent",
                    transition: "0.2s",
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
                    {chat.name.charAt(0)}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: "600", color: "#4b3a2f" }}>
                      {chat.name}
                    </div>
                    <div
                      style={{
                        fontSize: "0.8rem",
                        color: "#6b5a4a",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        width: "140px",
                      }}
                    >
                      {chat.preview}
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "#7b6a59",
                      marginLeft: "5px",
                    }}
                  >
                    {chat.date}
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
              {currentChat.messages.map((msg, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    justifyContent:
                      msg.sender === "user" ? "flex-end" : "flex-start",
                    marginBottom: "12px",
                  }}
                >
                  <div
                    style={{
                      background:
                        msg.sender === "user" ? "#fff" : "#f2e6db",
                      color: "#4b3a2f",
                      padding: "10px 14px",
                      borderRadius: "14px",
                      maxWidth: "70%",
                      fontSize: "0.9rem",
                      whiteSpace: "pre-line",
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div
              style={{
                padding: "12px",
                borderTop: "1px solid #d1c3b3",
                background: "#fff",
              }}
            >
              <input
                type="text"
                placeholder="Type a message here"
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "10px",
                  border: "1px solid #d1c3b3",
                  outline: "none",
                  fontSize: "0.9rem",
                  background: "#fff",
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ChatPopup;
