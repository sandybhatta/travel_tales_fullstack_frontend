import { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";
import { useSelector } from "react-redux";

const SocketContext = createContext();

export const useSocketContext = () => {
  return useContext(SocketContext);
};

export const SocketContextProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const user = useSelector((state) => state.user);

  useEffect(() => {
    if (user && user._id) {
      // Prioritize the LIVE URL env var, but ensure it's trimmed.
      // If it's missing, fallback to the hardcoded live URL to ensure connectivity.
      const envUrl = import.meta.env.VITE_BACKEND_LIVE_URL;
      const socketUrl = envUrl ? envUrl.trim() : "https://api.traveltalesapp.in";
      
      const socket = io(socketUrl, {
        query: {
          userId: user._id,
        },
      });

      setSocket(socket);

      socket.on("getOnlineUsers", (users) => {
        setOnlineUsers(users);
      });

      return () => socket.close();
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [user?._id]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
