import React, { useState } from "react";
import { useSelector } from "react-redux";
import { 
  useRenameGroupMutation, 
  useAddToGroupMutation, 
  useRemoveFromGroupMutation 
} from "../slices/chatApiSlice";
import { useLazySearchMentionableUsersQuery } from "../slices/userApiSlice";

const UpdateGroupChatModal = ({ fetchAgain, fetchMessages, onClose, selectedChat, setSelectedChat }) => {
  const [groupChatName, setGroupChatName] = useState("");
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [renameLoading, setRenameLoading] = useState(false);

  const user = useSelector((state) => state.user);
  const userInfo = user;

  const [renameGroup] = useRenameGroupMutation();
  const [addToGroup] = useAddToGroupMutation();
  const [removeFromGroup] = useRemoveFromGroupMutation();
  const [searchUsers] = useLazySearchMentionableUsersQuery();

  const handleRemove = async (user1) => {
    if (selectedChat.groupAdmin._id !== userInfo._id && user1._id !== userInfo._id) {
      // toast.error("Only admins can remove someone!");
      alert("Only admins can remove someone!");
      return;
    }

    try {
      setLoading(true);
      const data = await removeFromGroup({
        chatId: selectedChat._id,
        userId: user1._id,
      }).unwrap();

      user1._id === userInfo._id ? setSelectedChat(null) : setSelectedChat(data);
      // fetchAgain(); // Handled by tags?
      fetchMessages(); 
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleAddUser = async (user1) => {
    if (selectedChat.users.find((u) => u._id === user1._id)) {
      // toast.error("User Already in group!");
        alert("User Already in group!");
      return;
    }

    if (selectedChat.groupAdmin._id !== userInfo._id) {
      // toast.error("Only admins can add someone!");
      alert("Only admins can add someone!");
      return;
    }

    try {
      setLoading(true);
      const data = await addToGroup({
        chatId: selectedChat._id,
        userId: user1._id,
      }).unwrap();

      setSelectedChat(data);
      // fetchAgain();
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleRename = async () => {
    if (!groupChatName) return;

    try {
      setRenameLoading(true);
      const data = await renameGroup({
        chatId: selectedChat._id,
        chatName: groupChatName,
      }).unwrap();

      setSelectedChat(data);
      // fetchAgain();
      setRenameLoading(false);
    } catch (error) {
      console.error(error);
      setRenameLoading(false);
      setGroupChatName("");
    }
  };

  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) return;

    try {
      setLoading(true);
      const { data } = await searchUsers(query);
      setLoading(false);
      setSearchResult(data);
    } catch (error) {
        setLoading(false);
      console.error("Failed to search users", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 animate-scaleIn flex flex-col gap-4">
        <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-[#2B2D42]">{selectedChat.chatName}</h3>
            <button onClick={onClose}><i className="bx bx-x text-3xl text-gray-500"></i></button>
        </div>

        <div className="flex flex-col gap-3">
            <div className="flex gap-2">
                <input
                    type="text"
                    placeholder="Chat Name"
                    className="p-2 border rounded-lg outline-none focus:border-[#EF233C] flex-1"
                    value={groupChatName}
                    onChange={(e) => setGroupChatName(e.target.value)}
                />
                <button 
                    className="bg-[#EF233C] text-white px-4 py-2 rounded-lg hover:bg-[#D90429]"
                    onClick={handleRename}
                    disabled={renameLoading}
                >
                    {renameLoading ? "Updating..." : "Update"}
                </button>
            </div>
            
            <input
                type="text"
                placeholder="Add User to group"
                className="p-2 border rounded-lg outline-none focus:border-[#EF233C]"
                onChange={(e) => handleSearch(e.target.value)}
            />
        </div>

        {/* Selected Users Tags */}
        <div className="flex flex-wrap gap-2">
            {selectedChat.users.map((u) => (
                <div key={u._id} className="bg-[#EF233C] text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                    {u.name}
                    {/* Only show remove X if admin or self */}
                    <i className="bx bx-x cursor-pointer" onClick={() => handleRemove(u)}></i>
                </div>
            ))}
        </div>

        {/* Search Results */}
        <div className="max-h-40 overflow-y-auto flex flex-col gap-1">
            {loading ? <div>Loading...</div> : (
                searchResult?.slice(0, 4).map((user) => (
                    <div 
                        key={user._id} 
                        className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer flex items-center gap-2"
                        onClick={() => handleAddUser(user)}
                    >
                        <img src={user.avatar?.url || user.pic || "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"} alt={user.name} className="w-8 h-8 rounded-full object-cover"/>
                        <div>
                            <p className="text-sm font-semibold text-[#2B2D42]">{user.name}</p>
                            <p className="text-xs text-gray-500">@{user.username}</p>
                        </div>
                    </div>
                ))
            )}
        </div>

        <button 
            onClick={() => handleRemove(userInfo)}
            className="w-full bg-red-600 text-white py-2 rounded-lg font-bold hover:bg-red-700 transition-colors"
        >
            Leave Group
        </button>
      </div>
    </div>
  );
};

export default UpdateGroupChatModal;
