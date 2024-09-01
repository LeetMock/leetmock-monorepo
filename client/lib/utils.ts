import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { AccessTokenOptions, VideoGrant } from "livekit-server-sdk";
import { AccessToken } from "livekit-server-sdk";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateRandomAlphanumeric(length: number): string {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

export function encode(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}

export function getCurrentUnixTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}

export const createToken = (
  apiKey: string,
  apiSecret: string,
  userInfo: AccessTokenOptions,
  grant: VideoGrant
) => {
  const at = new AccessToken(apiKey, apiSecret, userInfo);
  at.addGrant(grant);
  return at.toJwt();
};

export const isDefined = <T>(value: T): value is Exclude<T, undefined | null> => {
  return value !== undefined && value !== null;
};
