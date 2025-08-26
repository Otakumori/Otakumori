/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatar?: string;
  ageVerified: boolean;
  dateOfBirth?: string;
  role: 'user' | 'admin' | 'moderator';
  createdAt: string;
  updatedAt: string;
  preferences: {
    showNSFW: boolean;
    theme: 'light' | 'dark' | 'system';
    notifications: {
      email: boolean;
      push: boolean;
    };
  };
}

export interface AgeVerification {
  userId: string;
  verifiedAt: string;
  method: 'dob' | 'id' | 'credit_card';
  status: 'pending' | 'verified' | 'rejected';
}

export interface AuthResponse {
  user: User;
  token: string;
  expiresAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  username: string;
  displayName: string;
  dateOfBirth: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordReset {
  token: string;
  newPassword: string;
}
