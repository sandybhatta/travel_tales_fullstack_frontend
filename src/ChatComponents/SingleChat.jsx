import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useSocketContext } from "../context/SocketContext";
import { useSendMessageMutation, useAllMessagesQuery } from "../slices/messageApiSlice";
import ScrollableChat from "./ScrollableChat";
import { getSender, getSenderFull } from "../utils/chatLogics";
import UpdateGroupChatModal from "./UpdateGroupChatModal";
import { useNavigate } from "react-router-dom";

const SingleChat = ({ selectedChat, setSelectedChat }) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const { socket, onlineUsers } = useSocketContext();
  const user = useSelector((state) => state.user);
  const loggedUser = user; // Or parse from localStorage if needed

  const [sendMessage] = useSendMessageMutation();
  const { data: fetchedMessages, refetch, isLoading: messagesLoading } = useAllMessagesQuery(selectedChat?._id, {
    skip: !selectedChat,
  });

  // Handle Fetching Messages
  useEffect(() => {
    if (fetchedMessages) {
      setMessages(fetchedMessages);
      if(socket) socket.emit("join chat", selectedChat._id);
    }
  }, [fetchedMessages, selectedChat, socket]);

  // Socket Listeners
  useEffect(() => {
    if (!socket) return;
    
    const messageHandler = (newMessageReceived) => {
        if (!selectedChat || selectedChat._id !== newMessageReceived.chat._id) {
            // Notification logic handled elsewhere usually, or show toast
        } else {
            setMessages((prev) => [...prev, newMessageReceived]);
        }
    };

    const typingHandler = () => setIsTyping(true);
    const stopTypingHandler = () => setIsTyping(false);

    socket.on("message received", messageHandler);
    socket.on("typing", typingHandler);
    socket.on("stop typing", stopTypingHandler);

    return () => {
        socket.off("message received", messageHandler);
        socket.off("typing", typingHandler);
        socket.off("stop typing", stopTypingHandler);
    };
  }, [socket, selectedChat]);

  const sendMessageHandler = async (e) => {
    if (e.key === "Enter" && newMessage) {
      if(socket) socket.emit("stop typing", selectedChat._id);
      try {
        setNewMessage(""); // Optimistic clear
        const data = await sendMessage({
          content: newMessage,
          chatId: selectedChat._id,
        }).unwrap();
        
        if(socket) socket.emit("new message", data);
        setMessages([...messages, data]);
      } catch (error) {
        console.error("Failed to send message", error);
      }
    }
  };

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socket) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }

    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  const [showUpdateGroupModal, setShowUpdateGroupModal] = useState(false);
  // Removed ProfileModal state

  if (!selectedChat) {
    return (
      <div className="flex items-center justify-center h-full flex-col gap-4 text-gray-400">
         <i className="bx bx-message-square-dots text-8xl"></i>
         <p className="text-xl font-medium">Select a chat to start messaging</p>
      </div>
    );
  }

  return (
    <>
      {/* Chat Header */}
      <div className="p-3 bg-white border-b flex justify-between items-center z-10">
         <div className="flex items-center gap-3">
             <button 
                className="lg:hidden p-2 hover:bg-gray-100 rounded-full"
                onClick={() => setSelectedChat(null)}
             >
                <i className="bx bx-arrow-back text-2xl"></i>
             </button>

             {!selectedChat.isGroupChat ? (
                <div 
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => {
                        const sender = getSenderFull(loggedUser, selectedChat.users);
                        navigate(`/profile/${sender._id}`);
                    }}
                >
                    <img 
                        src={getSenderFull(loggedUser, selectedChat.users)?.avatar?.url || "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"} 
                        alt="User" 
                        className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                        <h3 className="font-bold text-[#2B2D42]">{getSender(loggedUser, selectedChat.users)}</h3>
                        {/* Online Status Text */}
                        {/* {onlineUsers.includes(getSenderFull(loggedUser, selectedChat.users)._id) && <p className="text-xs text-green-500">Online</p>} */}
                    </div>
                </div>
             ) : (
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => setShowUpdateGroupModal(true)}>
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold text-gray-600">
                        {selectedChat.chatName[0].toUpperCase()}
                    </div>
                    <div>
                         <h3 className="font-bold text-[#2B2D42]">{selectedChat.chatName.toUpperCase()}</h3>
                         <p className="text-xs text-gray-500">{selectedChat.users.length} members</p>
                    </div>
                </div>
             )}
         </div>
         
         <div className="flex items-center gap-2">
            {/* Options button or Info button */}
            {selectedChat.isGroupChat && (
                <button onClick={() => setShowUpdateGroupModal(true)} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
                    <i className="bx bx-info-circle text-2xl"></i>
                </button>
            )}
         </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-[#EDF2F4] flex flex-col gap-2">
         {messagesLoading ? (
             <div className="flex items-center justify-center h-full">Loading Messages...</div>
         ) : (
             <ScrollableChat messages={messages} />
         )}
         {isTyping && (
             <div className="self-start bg-gray-200 text-gray-500 text-xs px-3 py-1 rounded-full mb-2">
                 Typing...
             </div>
         )}
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white border-t">
          <input
            type="text"
            className="w-full bg-gray-100 p-3 rounded-full outline-none focus:ring-2 focus:ring-[#EF233C] transition-all"
            placeholder="Type a message..."
            value={newMessage}
            onChange={typingHandler}
            onKeyDown={sendMessageHandler}
          />
      </div>

      {showUpdateGroupModal && (
          <UpdateGroupChatModal 
            fetchAgain={refetch} 
            fetchMessages={refetch}
            onClose={() => setShowUpdateGroupModal(false)} 
            selectedChat={selectedChat}
            setSelectedChat={setSelectedChat}
          />
      )}
    </>
  );
};

export default SingleChat;
