import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { AuthContext } from './auth-context';
import type { AuthContextValue } from './auth-context';
import {
  confirmSignUpWithCognito,
  getCurrentCognitoUser,
  signInWithCognito,
  signOutFromCognito,
  signUpWithCognito
} from './cognito';
import type { AuthUser } from './cognito';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    getCurrentCognitoUser()
      .then((currentUser) => {
        if (active) {
          setUser(currentUser);
        }
      })
      .catch(() => {
        if (active) {
          setUser(null);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      signIn: async (email: string, password: string) => {
        if (!email.trim() || !password.trim()) {
          throw new Error('Email and password are required.');
        }
        setUser(await signInWithCognito(email, password));
      },
      signUp: async (email: string, password: string) => {
        if (!email.trim() || !password.trim()) {
          throw new Error('Email and password are required.');
        }
        await signUpWithCognito(email, password);
      },
      confirmSignUp: async (email: string, code: string) => {
        if (!email.trim() || !code.trim()) {
          throw new Error('Email and confirmation code are required.');
        }
        await confirmSignUpWithCognito(email, code);
      },
      signOut: async () => {
        await signOutFromCognito();
        setUser(null);
      }
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
