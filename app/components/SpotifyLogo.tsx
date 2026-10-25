"use client";

import React from "react";

interface SpotifyLogoProps {
  className?: string;
  size?: number;
}

/**
 * Ícone vetorial na cor oficial #1DB954.
 * Caso deseje usar o arquivo oficial da marca em disco, basta colocá-lo em public/logos/spotify.svg.
 */
export default function SpotifyLogo({ className = "", size = 20 }: SpotifyLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Spotify"
    >
      <circle cx="12" cy="12" r="11" fill="#1DB954" />
      <path
        d="M17.2 10.1C14.1 8.4 9.1 8.2 6.2 9.1C5.7 9.25 5.2 8.95 5.05 8.5C4.9 8.05 5.2 7.55 5.65 7.4C9.05 6.35 14.6 6.55 18.15 8.55C18.6 8.8 18.75 9.35 18.5 9.8C18.25 10.2 17.65 10.35 17.2 10.1Z"
        fill="#090D16"
      />
      <path
        d="M16.1 13.15C13.55 11.7 9.65 11.25 6.65 12.15C6.25 12.25 5.85 12.05 5.75 11.65C5.65 11.25 5.85 10.85 6.25 10.75C9.7 9.7 14.0 10.2 16.9 11.85C17.25 12.05 17.35 12.55 17.15 12.9C16.9 13.25 16.45 13.35 16.1 13.15Z"
        fill="#090D16"
      />
      <path
        d="M15.05 16.0C12.95 14.8 10.3 14.5 7.2 15.2C6.85 15.3 6.55 15.05 6.45 14.7C6.35 14.35 6.6 14.05 6.95 13.95C10.35 13.15 13.3 13.5 15.7 14.9C16.0 15.1 16.1 15.45 15.9 15.8C15.7 16.1 15.35 16.2 15.05 16.0Z"
        fill="#090D16"
      />
    </svg>
  );
}