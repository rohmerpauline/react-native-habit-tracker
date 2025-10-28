import { account } from '@/lib/appwrite';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react';
import { ID, Models } from 'react-native-appwrite';

type AuthContextType = {
  user: Models.User<Models.Preferences> | null;
  isLoadingUser: boolean;
  signUp: (email: string, password: string) => Promise<string | null>;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(
    null,
  );
  const [isLoadingUser, setIsLoadingUser] = useState<boolean>(true);

  useEffect(() => {
    getUser();
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      await account.create(ID.unique(), email, password);
      await signIn(email, password);
      await getUser();
      return null;
    } catch (error) {
      if (error instanceof Error) {
        return error.message;
      }

      return 'An error occured during sign in.';
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await account.createEmailPasswordSession(email, password);
      await getUser();
      return null;
    } catch (error) {
      if (error instanceof Error) {
        return error.message;
      }

      return 'An error occured during signup.';
    }
  };

  const signOut = async () => {
    try {
      await account.deleteSession('current');
      setUser(null);
    } catch (error) {
      console.log(error);
    }
  };

  const getUser = async () => {
    try {
      const session = await account.get();
      setUser(session);
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoadingUser(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoadingUser, signUp, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Use this hook to access the user info.
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be wrapped in a <AuthProvider />');
  }

  return value;
}
