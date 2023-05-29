// Entire file added by Audrey Tanama
import React from 'react';

export const ChannelsListContext = React.createContext();

export const ChannelsListProvider = ({ children }) => {
  const [myChannels, setMyChannels] = React.useState([]);
  const [allChannels, setAllChannels] = React.useState([]);

  return (
    <ChannelsListContext.Provider value={{myChannelsState: [myChannels, setMyChannels], allChannelsState: [allChannels, setAllChannels]}}>
      {children}
    </ChannelsListContext.Provider>
  );
};
