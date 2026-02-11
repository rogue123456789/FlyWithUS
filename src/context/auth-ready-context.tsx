'use client';
import { createContext, useContext, ReactNode } from 'react';

const AuthReadyContext = createContext<boolean>(false);

export function AuthReadyProvider({
  children,
  isReady,
}: {
  children: ReactNode;
  isReady: boolean;
}) {
  return (
    <AuthReadyContext.Provider value={isReady}>
      {children}
    </AuthReadyContext.Provider>
  );
}

export function useAuthReady() {
  return useContext(AuthReadyContext);
}
