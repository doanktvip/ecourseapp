import React, { createContext, useContext, useReducer } from 'react';
import MyUserReducer from '../reducers/reducers';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, dispatch] = useReducer(MyUserReducer, null);

  return (
    <UserContext.Provider value={{ user, dispatch }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    return { user: null, dispatch: () => {} };
  }
  return context;
};