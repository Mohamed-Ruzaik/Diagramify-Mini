import type { CognitoUser, CognitoUserPool, CognitoUserSession } from 'amazon-cognito-identity-js';

export type AuthUser = {
  id: string;
  email: string;
};

type CognitoConfig = {
  userPoolId: string;
  clientId: string;
  region: string;
};

const env = import.meta.env;

const cognitoConfig: CognitoConfig = {
  userPoolId: env.VITE_COGNITO_USER_POOL_ID ?? '',
  clientId: env.VITE_COGNITO_CLIENT_ID ?? '',
  region: env.VITE_COGNITO_REGION ?? ''
};

const assertCognitoConfig = (): void => {
  const missing = Object.entries(cognitoConfig)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(`Missing Cognito environment variables: ${missing.join(', ')}.`);
  }
};

const ensureCognitoBrowserGlobals = (): void => {
  const browserGlobal = globalThis as typeof globalThis & { global?: typeof globalThis };
  browserGlobal.global ??= globalThis;
};

const loadCognitoSdk = async () => {
  ensureCognitoBrowserGlobals();
  return import('amazon-cognito-identity-js');
};

const getUserPool = async (): Promise<CognitoUserPool> => {
  assertCognitoConfig();
  const { CognitoUserPool } = await loadCognitoSdk();
  return new CognitoUserPool({
    UserPoolId: cognitoConfig.userPoolId,
    ClientId: cognitoConfig.clientId
  });
};

const createCognitoUser = async (email: string): Promise<CognitoUser> => {
  const userPool = await getUserPool();
  const { CognitoUser } = await loadCognitoSdk();
  return new CognitoUser({
    Username: email.trim().toLowerCase(),
    Pool: userPool
  });
};

const getSession = (cognitoUser: CognitoUser): Promise<CognitoUserSession> =>
  new Promise((resolve, reject) => {
    cognitoUser.getSession((error: Error | null, session: CognitoUserSession | null) => {
      if (error) {
        reject(error);
        return;
      }

      if (!session?.isValid()) {
        reject(new Error('Cognito session is not valid.'));
        return;
      }

      resolve(session);
    });
  });

const toAuthUser = (session: CognitoUserSession): AuthUser => {
  const idTokenPayload = session.getIdToken().payload as Record<string, unknown>;
  const sub = typeof idTokenPayload.sub === 'string' ? idTokenPayload.sub : '';
  const email = typeof idTokenPayload.email === 'string' ? idTokenPayload.email : '';

  return {
    id: sub || email,
    email
  };
};

export const getCurrentCognitoUser = async (): Promise<AuthUser | null> => {
  const currentUser = (await getUserPool()).getCurrentUser();
  if (!currentUser) {
    return null;
  }

  try {
    const session = await getSession(currentUser);
    return toAuthUser(session);
  } catch {
    currentUser.signOut();
    return null;
  }
};

export const signInWithCognito = (email: string, password: string): Promise<AuthUser> =>
  new Promise((resolve, reject) => {
    const normalizedEmail = email.trim().toLowerCase();
    getUserPool()
      .then(async (userPool) => {
        const { AuthenticationDetails, CognitoUser } = await loadCognitoSdk();
        const cognitoUser = new CognitoUser({
          Username: normalizedEmail,
          Pool: userPool
        });
        const authDetails = new AuthenticationDetails({
          Username: normalizedEmail,
          Password: password
        });

        cognitoUser.authenticateUser(authDetails, {
          onSuccess: (session) => resolve(toAuthUser(session)),
          onFailure: (error) => reject(error),
          newPasswordRequired: () => reject(new Error('A new password is required for this account.'))
        });
      })
      .catch(reject);
  });

export const signUpWithCognito = (email: string, password: string): Promise<void> =>
  new Promise((resolve, reject) => {
    const normalizedEmail = email.trim().toLowerCase();
    getUserPool()
      .then(async (userPool) => {
        const { CognitoUserAttribute } = await loadCognitoSdk();
        const attributes = [
          new CognitoUserAttribute({
            Name: 'email',
            Value: normalizedEmail
          })
        ];

        userPool.signUp(normalizedEmail, password, attributes, [], (error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      })
      .catch(reject);
  });

export const confirmSignUpWithCognito = (email: string, code: string): Promise<void> =>
  new Promise((resolve, reject) => {
    createCognitoUser(email)
      .then((cognitoUser) => {
        cognitoUser.confirmRegistration(code.trim(), true, (error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      })
      .catch(reject);
  });

export const signOutFromCognito = async (): Promise<void> => {
  const currentUser = (await getUserPool()).getCurrentUser();
  currentUser?.signOut();
};
