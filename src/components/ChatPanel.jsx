import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle, Send, Wifi, WifiOff } from "lucide-react";
import {
  getChatMessages,
  getChatSocketUrl,
  getToken,
  sendChatMessage,
} from "./CouponService";

function parseStompMessage(frame) {
  const bodyStart = frame.indexOf("\n\n");
  if (bodyStart === -1) return null;
  const body = frame.slice(bodyStart + 2).replace(/\0$/, "");
  if (!body) return null;
  try {
    return JSON.parse(body);
  } catch {
    return null;
  }
}

export default function ChatPanel({ chatRoom, title = "Conversation", compact = false }) {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef(null);
  const bottomRef = useRef(null);

  const chatRoomId = chatRoom?.id;

  useEffect(() => {
    if (!chatRoomId) return;
    setLoading(true);
    getChatMessages(chatRoomId)
      .then((data) => setMessages(Array.isArray(data) ? data : []))
      .catch(() => setMessages([]))
      .finally(() => setLoading(false));
  }, [chatRoomId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  useEffect(() => {
    if (!chatRoomId) return undefined;

    const socket = new WebSocket(getChatSocketUrl());
    wsRef.current = socket;

    socket.onopen = () => {
      socket.send("CONNECT\naccept-version:1.2\nheart-beat:10000,10000\n\n\0");
    };

    socket.onmessage = (event) => {
      const frame = event.data;
      if (frame.startsWith("CONNECTED")) {
        setConnected(true);
        socket.send(`SUBSCRIBE\nid:chat-${chatRoomId}\ndestination:/topic/chats/${chatRoomId}\n\n\0`);
        return;
      }

      if (frame.startsWith("MESSAGE")) {
        const message = parseStompMessage(frame);
        if (message?.chatRoomId === chatRoomId) {
          setMessages((prev) => {
            if (message.id && prev.some((item) => item.id === message.id)) return prev;
            return [...prev, message];
          });
        }
      }
    };

    socket.onclose = () => setConnected(false);
    socket.onerror = () => setConnected(false);

    return () => {
      setConnected(false);
      socket.close();
    };
  }, [chatRoomId]);

  const sendViaSocket = useCallback((text) => {
    const socket = wsRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN || !connected) {
      return false;
    }

    const payload = JSON.stringify({
      chatRoomId,
      message: text,
      token: `Bearer ${getToken()}`,
    });

    socket.send(`SEND\ndestination:/app/chat.send\ncontent-type:application/json\n\n${payload}\0`);
    return true;
  }, [chatRoomId, connected]);

  const handleSend = useCallback(async (event) => {
    event?.preventDefault?.();
    const text = draft.trim();
    if (!text || !chatRoomId || sending) return;

    setDraft("");
    setSending(true);

    if (!sendViaSocket(text)) {
      try {
        const saved = await sendChatMessage(chatRoomId, text);
        setMessages((prev) => [...prev, saved]);
      } catch {
        setDraft(text);
      }
    }

    setSending(false);
  }, [chatRoomId, draft, sendViaSocket, sending]);

  const subtitle = useMemo(() => {
    if (!chatRoom) return "Select a chat to start messaging";
    return chatRoom.couponName || `Coupon #${chatRoom.couponId}`;
  }, [chatRoom]);

  return (
    <section className={`chat-panel ${compact ? "chat-panel--compact" : ""}`}>
      <div className="chat-panel__head">
        <div>
          <div className="eyebrow">Buyer Seller Chat</div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <div className={`socket-pill ${connected ? "socket-pill--on" : ""}`}>
          {connected ? <Wifi size={15} /> : <WifiOff size={15} />}
          {connected ? "Live" : "REST"}
        </div>
      </div>

      {!chatRoom ? (
        <div className="chat-empty">
          <MessageCircle size={34} />
          <p>Select or create a chat to continue.</p>
        </div>
      ) : (
        <>
          <div className="chat-log">
            {loading ? (
              <div className="chat-empty">Loading messages...</div>
            ) : messages.length === 0 ? (
              <div className="chat-empty">
                <MessageCircle size={32} />
                <p>No messages yet. Start the conversation.</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  className={`msg ${message.senderId === chatRoom.buyerId ? "msg--buyer" : "msg--seller"}`}
                  key={message.id || `${message.createdAt}-${message.message}`}
                >
                  <div className="msg__meta">
                    {message.senderId === chatRoom.buyerId ? "Buyer" : "Seller"}
                  </div>
                  <div className="msg__bubble">{message.message}</div>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

          <form className="chat-compose" onSubmit={handleSend}>
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Write a message..."
              maxLength={2000}
            />
            <button type="submit" disabled={!draft.trim() || sending} aria-label="Send message">
              <Send size={16} />
            </button>
          </form>
        </>
      )}
    </section>
  );
}
