import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useSocketContext } from "../context/SocketContext";
import SingleChat from "./SingleChat";

const ChatBox = ({ selectedChat, setSelectedChat }) => {
  return (
    <div className="flex flex-col w-full h-full">
      <SingleChat selectedChat={selectedChat} setSelectedChat={setSelectedChat} />
    </div>
  );
};

export default ChatBox;
