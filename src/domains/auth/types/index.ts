export interface LoginRequest {
  code: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    profileImage?: string;
  };
}

export interface GoogleAuthUrlResponse {
  authUrl: string;
}

export interface SessionResponse {
  user: {
    id: string;
    email: string;
    name: string;
    profileImage?: string;
  };
  isAuthenticated: boolean;
}
