import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useCreateGroupChatMutation } from "../slices/chatApiSlice";
import { useLazySearchMentionableUsersQuery } from "../slices/userApiSlice";

const GroupChatModal = ({ onClose }) => {
  const [groupChatName, setGroupChatName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  
  const [createGroupChat] = useCreateGroupChatMutation();
  // Removed API search
  const user = useSelector((state) => state.user);

  const handleSearch = (query) => {
    setSearch(query);
    if (!query) {
        setSearchResult([]);
        return;
    }

    try {
      const filteredUsers = user.following.filter((u) => 
        u.name.toLowerCase().includes(query.toLowerCase()) || 
        u.username.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5);
      
      setSearchResult(filteredUsers);
    } catch (error) {
      console.error("Failed to search users", error);
    }
  };

  const handleSubmit = async () => {
    if (!groupChatName || !selectedUsers) {
      // Toast error
      return;
    }

    try {
      await createGroupChat({
        name: groupChatName,
        users: JSON.stringify(selectedUsers.map((u) => u._id)),
      }).unwrap();
      onClose();
      // Toast success
    } catch (error) {
      // Toast error
      console.error("Failed to create group", error);
    }
  };

  const handleGroup = (userToAdd) => {
    if (selectedUsers.includes(userToAdd)) {
      // Toast already added
      return;
    }
    setSelectedUsers([...selectedUsers, userToAdd]);
  };

  const handleDelete = (delUser) => {
    setSelectedUsers(selectedUsers.filter((sel) => sel._id !== delUser._id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 animate-scaleIn flex flex-col gap-4">
        <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-[#2B2D42]">Create Group Chat</h3>
            <button onClick={onClose}><i className="bx bx-x text-3xl text-gray-500"></i></button>
        </div>

        <div className="flex flex-col gap-3">
            <input
                type="text"
                placeholder="Chat Name"
                className="p-2 border rounded-lg outline-none focus:border-[#EF233C]"
                onChange={(e) => setGroupChatName(e.target.value)}
            />
            
            <input
                type="text"
                placeholder="Add Users eg: John, Jane"
                className="p-2 border rounded-lg outline-none focus:border-[#EF233C]"
                onChange={(e) => handleSearch(e.target.value)}
            />
        </div>

        {/* Selected Users Tags */}
        <div className="flex flex-wrap gap-2">
            {selectedUsers.map((u) => (
                <div key={u._id} className="bg-[#EF233C] text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                    {u.name}
                    <i className="bx bx-x cursor-pointer" onClick={() => handleDelete(u)}></i>
                </div>
            ))}
        </div>

      {/* Search Results */}
      <div className="max-h-40 overflow-y-auto flex flex-col gap-1">
          {searchResult?.slice(0, 5).map((u) => (
              <div 
                  key={u._id} 
                  className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer flex items-center gap-2"
                  onClick={() => handleGroup(u)}
              >
                  <img src={u.avatar?.url || u.pic || "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"} alt={u.name} className="w-8 h-8 rounded-full object-cover"/>
                  <div>
                      <p className="text-sm font-semibold text-[#2B2D42]">{u.name}</p>
                      <p className="text-xs text-gray-500">@{u.username}</p>
                  </div>
              </div>
          ))}
          {search && searchResult.length === 0 && (
              <div className="p-2 text-sm text-gray-500 text-center">No following users found</div>
          )}
      </div>

        <button 
            onClick={handleSubmit}
            className="w-full bg-[#EF233C] text-white py-2 rounded-lg font-bold hover:bg-[#D90429] transition-colors"
        >
            Create Chat
        </button>
      </div>
    </div>
  );
};

export default GroupChatModal;
