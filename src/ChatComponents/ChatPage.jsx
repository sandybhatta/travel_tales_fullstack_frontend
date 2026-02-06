import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom"; // Import useLocation
import MyChats from "./MyChats";
import ChatBox from "./ChatBox";

const ChatPage = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const user = useSelector((state) => state.user);
  const location = useLocation(); // Get location
  const chatIdToSelect = location.state?.chatId; // Extract chatId

  return (
    <div className="w-full h-[calc(100vh-80px)] lg:h-screen p-2 lg:p-6 flex gap-6 overflow-hidden bg-[#F8FAFC]">
      {/* 
         On mobile:
         - If no chat selected, show MyChats (full width)
         - If chat selected, show ChatBox (full width)
         On Desktop:
         - Always show both
      */}
      
      <div className={`
        ${selectedChat ? "hidden lg:flex" : "flex"} 
        w-full lg:w-[32%] h-full bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300
      `}>
        <MyChats 
            selectedChat={selectedChat} 
            setSelectedChat={setSelectedChat} 
            chatIdToSelect={chatIdToSelect} 
        />
      </div>

      <div className={`
        ${!selectedChat ? "hidden lg:flex" : "flex"} 
        w-full lg:w-[68%] h-full bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 relative
      `}>
        <ChatBox selectedChat={selectedChat} setSelectedChat={setSelectedChat} />
      </div>
    </div>
  );
};

export default ChatPage;
