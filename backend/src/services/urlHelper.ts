import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../frontend/.env') });

export function getAppUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  if (process.env.NEXT_PUBLIC_NGROK_PUBLIC_URL) {
    return process.env.NEXT_PUBLIC_NGROK_PUBLIC_URL;
  }
  if (process.env.NGROK_PUBLIC_URL) {
    return process.env.NGROK_PUBLIC_URL;
  }
  return 'http://localhost:3000';
}

export function generateTrackingToken(): string {
  return Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
}

export function getBackendUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  return `http://localhost:${process.env.PORT || '5002'}`;
}

export function getBackendAppUrl(): string {
  return getAppUrl();
}
