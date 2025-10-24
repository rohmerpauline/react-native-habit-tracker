import { createContext, use, useState, type PropsWithChildren } from 'react';

const AuthContext = createContext<{
  session: boolean;
  isLoading: boolean;
}>({
  session: false,
  isLoading: false,
});

export function SessionProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <AuthContext
      value={{
        session,
        isLoading,
      }}
    >
      {children}
    </AuthContext>
  );
}

// Use this hook to access the user info.
export function useSession() {
  const value = use(AuthContext);
  if (!value) {
    throw new Error('useSession must be wrapped in a <SessionProvider />');
  }

  return value;
}
