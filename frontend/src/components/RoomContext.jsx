// RoomContext.js
import { createContext, useState, useContext } from "react";

const RoomContext = createContext();

export const RoomProvider = ({ children }) => {
  const [roomCode, setRoomCode] = useState(null);
  const [username, setUsername] = useState(null);

  return (
    <RoomContext.Provider value={{ roomCode, setRoomCode, username, setUsername }}>
      {children}
    </RoomContext.Provider>
  );
};

export const useRoom = () => useContext(RoomContext);