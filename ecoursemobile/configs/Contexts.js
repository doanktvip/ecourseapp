import React, { createContext, useContext, useReducer } from 'react';
import MyUserReducer from '../reducers/reducers';

export const UserContext = createContext();
export const MyUserContext = UserContext;

export const UserProvider = ({ children }) => {
  const [user, dispatch] = useReducer(MyUserReducer, null);

  const contextValue = [user, dispatch];
  contextValue.user = user;
  contextValue.dispatch = dispatch;

  return (
    <UserContext.Provider value={contextValue}>
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