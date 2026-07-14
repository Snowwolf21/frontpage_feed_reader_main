/**
 * OAuth provider configurations.
 * Each entry contains the endpoints needed for the Authorization Code Flow.
 * All secrets are server-side only — never exposed to the client.
 */

export type OAuthProvider = 'google' | 'github' | 'linkedin';

interface OAuthProviderConfig {
  authUrl: string;
  tokenUrl: string;
  profileUrl: string;
  scope: string;
  clientId: () => string;
  clientSecret: () => string;
}

const APP_URL = () => process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
const callbackUrl = (provider: OAuthProvider) => `${APP_URL()}/api/auth/oauth/callback?provider=${provider}`;

export const OAUTH_PROVIDERS: Record<OAuthProvider, OAuthProviderConfig> = {
  google: {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    profileUrl: 'https://www.googleapis.com/oauth2/v3/userinfo',
    scope: 'openid email profile',
    clientId: () => process.env.GOOGLE_CLIENT_ID!,
    clientSecret: () => process.env.GOOGLE_CLIENT_SECRET!,
  },
  github: {
    authUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
    profileUrl: 'https://api.github.com/user',
    scope: 'read:user user:email',
    clientId: () => process.env.GITHUB_CLIENT_ID!,
    clientSecret: () => process.env.GITHUB_CLIENT_SECRET!,
  },
  linkedin: {
    // LinkedIn now uses OpenID Connect (Sign In with LinkedIn using OpenID Connect)
    authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
    profileUrl: 'https://api.linkedin.com/v2/userinfo',
    scope: 'openid profile email',
    clientId: () => process.env.LINKEDIN_CLIENT_ID!,
    clientSecret: () => process.env.LINKEDIN_CLIENT_SECRET!,
  },
};

export function isValidProvider(provider: unknown): provider is OAuthProvider {
  return provider === 'google' || provider === 'github' || provider === 'linkedin';
}

/**
 * Builds the authorization URL with PKCE state.
 * The state nonce is also stored in a cookie by the caller for CSRF validation.
 */
export function buildAuthUrl(provider: OAuthProvider, state: string): string {
  const config = OAUTH_PROVIDERS[provider];
  const params = new URLSearchParams({
    client_id: config.clientId(),
    redirect_uri: callbackUrl(provider),
    response_type: 'code',
    scope: config.scope,
    state,
    // Google-specific: force account selection so users aren't silently signed in
    ...(provider === 'google' ? { prompt: 'select_account', access_type: 'online' } : {}),
  });
  return `${config.authUrl}?${params.toString()}`;
}

interface OAuthTokenResponse {
  access_token: string;
  token_type: string;
  id_token?: string;
  scope?: string;
}

/** Exchanges the authorization code for an access token at the provider's token endpoint. */
export async function exchangeCodeForToken(
  provider: OAuthProvider,
  code: string
): Promise<OAuthTokenResponse> {
  const config = OAUTH_PROVIDERS[provider];
  const appUrl = APP_URL();

  const body = new URLSearchParams({
    client_id: config.clientId(),
    client_secret: config.clientSecret(),
    code,
    grant_type: 'authorization_code',
    redirect_uri: `${appUrl}/api/auth/oauth/callback?provider=${provider}`,
  });

  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body: body.toString(),
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Token exchange failed (${response.status}): ${text}`);
  }

  return response.json() as Promise<OAuthTokenResponse>;
}

export interface OAuthProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

/** Fetches the user's profile from the provider using their access token. */
export async function fetchOAuthProfile(
  provider: OAuthProvider,
  accessToken: string
): Promise<OAuthProfile> {
  const config = OAUTH_PROVIDERS[provider];

  const response = await fetch(config.profileUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
      // GitHub requires this User-Agent
      'User-Agent': 'frontpage-reader/1.0',
    },
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(`Profile fetch failed from ${provider} (${response.status})`);
  }

  const raw = await response.json() as Record<string, unknown>;

  switch (provider) {
    case 'google':
      return {
        id: String(raw.sub),
        email: String(raw.email),
        name: String(raw.name || ''),
        avatarUrl: raw.picture ? String(raw.picture) : undefined,
      };

    case 'github': {
      // GitHub may not expose email in the profile — fetch from /user/emails
      let email = raw.email as string | null;
      if (!email) {
        const emailRes = await fetch('https://api.github.com/user/emails', {
          headers: { Authorization: `Bearer ${accessToken}`, 'User-Agent': 'frontpage-reader/1.0' },
        });
        if (emailRes.ok) {
          const emails = await emailRes.json() as { email: string; primary: boolean; verified: boolean }[];
          const primary = emails.find((e) => e.primary && e.verified);
          email = primary?.email || null;
        }
      }
      if (!email) throw new Error('GitHub account has no verified email address');
      return {
        id: String(raw.id),
        email,
        name: String(raw.name || raw.login || ''),
        avatarUrl: raw.avatar_url ? String(raw.avatar_url) : undefined,
      };
    }

    case 'linkedin':
      // LinkedIn OpenID Connect: profile endpoint returns OIDC-style fields
      return {
        id: String(raw.sub),
        email: String(raw.email),
        name: [raw.given_name, raw.family_name].filter(Boolean).join(' ') || String(raw.name || ''),
        avatarUrl: raw.picture ? String(raw.picture) : undefined,
      };
  }
}
