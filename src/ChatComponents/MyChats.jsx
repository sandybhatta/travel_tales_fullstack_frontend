import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useFetchChatsQuery, useAccessChatMutation } from "../slices/chatApiSlice";
import { useGetUserFollowingsQuery } from "../slices/userApiSlice";
import { useSocketContext } from "../context/SocketContext";
import GroupChatModal from "./GroupChatModal";
import { getSender } from "../utils/chatLogics"; 

const MyChats = ({ selectedChat, setSelectedChat, chatIdToSelect }) => {
  const { data: chats, refetch, isLoading } = useFetchChatsQuery();
  const [accessChat] = useAccessChatMutation();
  const user = useSelector((state) => state.user);
  const [loggedUser, setLoggedUser] = useState();
  const [showGroupModal, setShowGroupModal] = useState(false);
  const { socket, onlineUsers } = useSocketContext();

  useEffect(() => {
    // Assuming user slice has _id. If not, parse from localStorage
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    setLoggedUser(userInfo);
  }, []);

  const { data: followingsData } = useGetUserFollowingsQuery(
    { userId: loggedUser?._id, limit: 100 }, 
    { skip: !loggedUser?._id }
  );

  const onlineFriends = followingsData?.followingList?.filter(u => onlineUsers.includes(u._id)) || [];

  const handleAccessChat = async (userId) => {
    try {
        const chat = await accessChat(userId).unwrap();
        setSelectedChat(chat);
        refetch();
    } catch (error) {
        console.error("Error accessing chat", error);
    }
  };

  useEffect(() => {
    refetch();
    if(socket) {
        socket.on("message received", () => refetch());
    }
    return () => {
        if(socket) socket.off("message received");
    }
  }, [refetch, socket]);

  // Auto-select chat based on chatIdToSelect prop
  useEffect(() => {
    if (chatIdToSelect && chats) {
      const targetChat = chats.find(c => c._id === chatIdToSelect);
      if (targetChat) {
        setSelectedChat(targetChat);
      }
    }
  }, [chatIdToSelect, chats, setSelectedChat]);

  if (isLoading) return (
      <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#EF233C]"></div>
      </div>
  );

  return (
    <div className="flex flex-col w-full h-full bg-[#F8FAFC]">
      {/* Header */}
      <div className="p-5 bg-white border-b border-gray-100 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <h2 className="text-xl font-bold text-gray-800">Messages</h2>
        <button
          onClick={() => setShowGroupModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#EF233C] text-white rounded-xl hover:bg-[#D90429] transition-all shadow-md hover:shadow-lg text-sm font-medium"
        >
          <i className="bx bx-plus text-lg"></i>
          <span>New Group</span>
        </button>
      </div>

      {/* Online Friends Section */}
      {onlineFriends.length > 0 && (
          <div className="p-4 border-b border-gray-100 overflow-x-auto whitespace-nowrap bg-white scrollbar-hide">
            <p className="text-xs text-gray-400 mb-3 font-bold tracking-wider uppercase">Online Friends</p>
            <div className="flex gap-5">
                {onlineFriends.map((friend) => (
                    <div 
                        key={friend._id} 
                        className="flex flex-col items-center gap-2 cursor-pointer group"
                        onClick={() => handleAccessChat(friend._id)}
                    >
                        <div className="relative">
                            <img 
                                src={friend.avatar?.url || "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"} 
                                alt={friend.username} 
                                className="w-12 h-12 rounded-full object-cover border-2 border-white ring-2 ring-gray-100 group-hover:ring-[#EF233C] transition-all" 
                            />
                            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
                        </div>
                        <span className="text-xs font-medium truncate w-16 text-center text-gray-600 group-hover:text-[#EF233C] transition-colors">{friend.username}</span>
                    </div>
                ))}
            </div>
          </div>
      )}

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 scrollbar-thin scrollbar-thumb-gray-200">
        {chats && [...chats].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).map((chat) => {
           const isGroup = chat.isGroupChat;
           const chatName = !isGroup 
                ? getSender(loggedUser, chat.users) 
                : chat.chatName;
           
           const otherUser = !isGroup ? chat.users.find(u => u._id !== loggedUser?._id) : null;
           const isOnline = otherUser && onlineUsers.includes(otherUser._id);
           
           // Determine styling based on selection
           const isSelected = selectedChat?._id === chat._id;

           return (
            <div
              key={chat._id}
              onClick={() => setSelectedChat(chat)}
              className={`
                p-4 rounded-xl cursor-pointer flex items-center gap-4 transition-all duration-200 border
                ${isSelected 
                    ? "bg-gradient-to-r from-[#EF233C] to-[#D90429] text-white shadow-md border-transparent" 
                    : "bg-white hover:bg-gray-50 text-gray-700 border-gray-100 hover:border-gray-200 hover:shadow-sm"
                }
              `}
            >
               {/* Avatar */}
               <div className="relative">
                  <img 
                    src={!isGroup && otherUser ? otherUser.avatar?.url : chat.chatImage || "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"} 
                    alt="avatar" 
                    className={`w-12 h-12 rounded-full object-cover border-2 ${isSelected ? "border-white/30" : "border-gray-100"}`}
                  />
                  {isOnline && (
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
                  )}
               </div>

               {/* Info */}
               <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-center mb-1">
                      <h4 className={`font-bold truncate text-base ${isSelected ? "text-white" : "text-gray-800"}`}>{chatName}</h4>
                      {/* Optional: Time */}
                  </div>
                  <p className={`text-sm truncate ${isSelected ? "text-red-100" : "text-gray-500"}`}>
                    {chat.latestMessage ? (
                        <span>
                            {chat.latestMessage.sender._id === loggedUser?._id ? "You: " : chat.isGroupChat ? `${chat.latestMessage.sender.name}: ` : ""}
                            {chat.latestMessage.content.length > 35 
                                ? chat.latestMessage.content.substring(0, 35) + "..." 
                                : chat.latestMessage.content}
                        </span>
                    ) : (
                        <span className="italic opacity-80">Start a conversation</span>
                    )}
                  </p>
               </div>
               
               {/* Trip Badge */}
               {chat.isTripChat && (
                   <div className={`p-1.5 rounded-lg ${isSelected ? "bg-white/20" : "bg-red-50"}`}>
                       <i className={`bx bx-trip text-lg ${isSelected ? "text-white" : "text-[#EF233C]"}`} title="Trip Group"></i>
                   </div>
               )}
            </div>
          );
        })}
      </div>

      {showGroupModal && (
        <GroupChatModal onClose={() => setShowGroupModal(false)} />
      )}
    </div>
  );
};

export default MyChats;