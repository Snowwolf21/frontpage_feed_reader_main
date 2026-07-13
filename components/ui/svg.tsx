
 "use no memo"; // 🚀 Opts this entire file out of the React Compiler auto-optimization

import React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  width?: string | number;
  className?: string;
}
export function InfiniteFeedIcon({width, className, ...props}: IconProps) {
    return (
        <svg
      width={width}
      height={width}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M16 4L20.2631 11.8543L28 14.1421L22 19.8826L23.4393 27.8564L16 23.9277L8.56066 27.8564L10 19.8826L4 14.1421L11.7369 11.8543L16 4Z"
        fill="currentColor"
      />
    </svg>
    );
}


export function StarIcon({ width = 24, className, ...props }: IconProps) {
    return (
          <svg
                xmlns="http://www.w3.org/2000/svg"
                width={width}
                height={width}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className={className}
                {...props}
              >
                <path d="M12 2L15.09 8.26H22L17.55 12.5L19.64 18.74L12 14.5L4.36 18.74L6.45 12.5L2 8.26H8.91L12 2" />
              </svg>
    );
}
export function PlusIcon({width, className, ...props}: IconProps) {
  return (
        <svg
                xmlns="http://www.w3.org/2000/svg"
                width={width}
                height={width}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className={className}
                {...props}
              >
                <line x1="12" x2="12" y1="5" y2="19" />
                <line x1="5" x2="19" y1="12" y2="12" />
              </svg>
  );
}
export function SettingsIcon({width, className, ...props}: IconProps) {
  return (
        <svg
                xmlns="http://www.w3.org/2000/svg"
                width={width}
                height={width}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className={className}
                {...props}
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
  );
}
export function CloseIcon({width, className, ...props}: IconProps) {
  return (
        <svg
                xmlns="http://www.w3.org/2000/svg"
                width={width}
                height={width}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className={className}
                {...props}
              >
                <line x1="18" x2="6" y1="6" y2="18" />
                <line x1="6" x2="18" y1="6" y2="18" />
              </svg>
  );
}
export function LoginIcon({width, className, ...props}: IconProps) {
  return (
        <svg
                xmlns="http://www.w3.org/2000/svg"
                width={width}
                height={width}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className={className}
                {...props}
              >
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" x2="3" y1="12" y2="12" />
              </svg>
  );
}
export function SignupIcon({width, className, ...props}: IconProps) {
  return (
        <svg
                xmlns="http://www.w3.org/2000/svg"
                width={width}
                height={width}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className={className}
                {...props}
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
  );
}
export function HomeIcon({width, className, ...props}: IconProps) {
  return (
        <svg
                xmlns="http://www.w3.org/2000/svg"
                width={width}
                height={width}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className={className}
                {...props}
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
  );
}
export function SavedIcon({width, className, ...props}: IconProps) {
  return (
        <svg
                xmlns="http://www.w3.org/2000/svg"
                width={width}
                height={width}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className={className}
                {...props}
              >
                <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16" />
                <polyline points="11 11 12 12 13 11" />
                <polyline points="11 7 12 8 13 7" />
              </svg>
  );
}
export function ProfileIcon({width, className, ...props}: IconProps) {
  return (
        <svg
                xmlns="http://www.w3.org/2000/svg"
                width={width}
                height={width}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className={className}
                {...props}
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
  );
}
export function Logo({width, className, ...props}: IconProps) {
  return (
        <svg
                xmlns="http://www.w3.org/2000/svg"
                width={width}
                height={width}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className={className}
                {...props}
              >
                <path d="M12 2L15.09 8.26H22L17.55 12.5L19.64 18.74L12 14.5L4.36 18.74L6.45 12.5L2 8.26H8.91L12 2" />
              </svg>
  );
}
export function LogoWithText({width, className, ...props}: IconProps) {
  return (
    <svg
            width={width}
            height={width}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
                className={className}
                {...props}  
          >
            <path
              d="M12 2L15.09 8.26H22L17.55 12.5L19.64 18.74L12 14.5L4.36 18.74L6.45 12.5L2 8.26H8.91L12 2"
              fill="currentColor"
            />
          </svg>
  );
}
export function ShareIcon({width, className, ...props}: IconProps) {
  return (
        <svg
                xmlns="http://www.w3.org/2000/svg"
                width={width}
                height={width}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className={className}
                {...props}
              >
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" x2="12" y1="2" y2="15" />
              </svg>
  );
}

export function DownloadIcon({width, className, ...props}: IconProps) {
  return (
        <svg
                xmlns="http://www.w3.org/2000/svg"
                width={width}
                height={width}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className={className}
                {...props}
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" x2="12" y1="15" y2="3" />
              </svg>
  );
}

  
