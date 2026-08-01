import React from 'react';

// Common Filter for 3D Glossy Bevel
const GlossyFilter = ({ id }) => (
    <filter id={id} x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#000000" floodOpacity="0.25" result="dropShadow" />

        {/* Inner Highlight for Glass effect */}
        <feOffset dx="0" dy="2" in="SourceAlpha" result="offsetAlpha" />
        <feGaussianBlur stdDeviation="1.5" in="offsetAlpha" result="blurAlpha" />
        <feComposite operator="out" in2="blurAlpha" in="SourceAlpha" result="inverseHighlight" />
        <feFlood floodColor="#ffffff" floodOpacity="0.6" result="highlightColor" />
        <feComposite operator="in" in="highlightColor" in2="inverseHighlight" result="highlight" />

        {/* Inner Shadow for bottom edge */}
        <feOffset dx="0" dy="-3" in="SourceAlpha" result="offsetAlphaBottom" />
        <feGaussianBlur stdDeviation="2" in="offsetAlphaBottom" result="blurAlphaBottom" />
        <feComposite operator="out" in2="blurAlphaBottom" in="SourceAlpha" result="inverseShadow" />
        <feFlood floodColor="#000000" floodOpacity="0.3" result="shadowColor" />
        <feComposite operator="in" in="shadowColor" in2="inverseShadow" result="innerShadow" />

        <feMerge>
            <feMergeNode in="dropShadow" />
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="highlight" />
            <feMergeNode in="innerShadow" />
        </feMerge>
    </filter>
);

export const Calendar3D = ({ className = "w-12 h-12" }) => (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <GlossyFilter id="cal-gloss" />
            <linearGradient id="cal-base" x1="0" y1="0" x2="100" y2="100">
                <stop offset="0%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#4f46e5" />
            </linearGradient>
            <linearGradient id="cal-top" x1="0" y1="0" x2="0" y2="40">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#f1f5f9" />
            </linearGradient>
            <linearGradient id="ring-grad" x1="0" y1="0" x2="0" y2="20">
                <stop offset="0%" stopColor="#e2e8f0" />
                <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>
        </defs>
        <g filter="url(#cal-gloss)">
            {/* Main body */}
            <rect x="15" y="25" width="70" height="65" rx="16" fill="url(#cal-base)" />
            {/* Top flap */}
            <path d="M15 41C15 32.1634 22.1634 25 31 25H69C77.8366 25 85 32.1634 85 41V45H15V41Z" fill="url(#cal-top)" />

            {/* Binders */}
            <rect x="25" y="15" width="8" height="20" rx="4" fill="url(#ring-grad)" stroke="#cbd5e1" strokeWidth="1" />
            <rect x="67" y="15" width="8" height="20" rx="4" fill="url(#ring-grad)" stroke="#cbd5e1" strokeWidth="1" />

            {/* Date highlight */}
            <rect x="35" y="55" width="30" height="15" rx="6" fill="#ffffff" opacity="0.9" />
            <circle cx="42" cy="62.5" r="3" fill="#4f46e5" />
            <rect x="49" y="60.5" width="10" height="4" rx="2" fill="#818cf8" />
        </g>
    </svg>
);

export const Activity3D = ({ className = "w-12 h-12" }) => (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <GlossyFilter id="act-gloss" />
            <linearGradient id="act-base" x1="0" y1="0" x2="100" y2="100">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="act-line" x1="0" y1="0" x2="100" y2="0">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#ecfdf5" />
            </linearGradient>
        </defs>
        <g filter="url(#act-gloss)">
            {/* Base platform */}
            <circle cx="50" cy="50" r="40" fill="url(#act-base)" />

            {/* Activity Line with drop shadow for floating effect */}
            <path d="M25 55 L40 55 L48 35 L58 75 L68 45 L78 45"
                stroke="url(#act-line)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="drop-shadow(0px 4px 3px rgba(0,0,0,0.3))" />
        </g>
    </svg>
);

export const MapPin3D = ({ className = "w-12 h-12" }) => (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <GlossyFilter id="pin-gloss" />
            <linearGradient id="pin-base" x1="20" y1="10" x2="80" y2="90">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <linearGradient id="pin-inner" x1="40" y1="30" x2="60" y2="50">
                <stop offset="0%" stopColor="#fef3c7" />
                <stop offset="100%" stopColor="#fcd34d" />
            </linearGradient>
        </defs>

        {/* Base shadow separated for realism */}
        <ellipse cx="50" cy="88" rx="15" ry="4" fill="#000000" opacity="0.3" filter="blur(3px)" />

        <g filter="url(#pin-gloss)">
            {/* The main teardrop pin shape */}
            <path d="M50 15C33.4315 15 20 28.4315 20 45C20 65.5 50 85 50 85C50 85 80 65.5 80 45C80 28.4315 66.5685 15 50 15Z" fill="url(#pin-base)" />
            {/* Inner hole */}
            <circle cx="50" cy="45" r="12" fill="#ffffff" />
            <circle cx="50" cy="45" r="10" fill="url(#pin-inner)" />
        </g>
    </svg>
);

export const Users3D = ({ className = "w-12 h-12" }) => (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <GlossyFilter id="users-gloss" />
            <linearGradient id="u-base-1" x1="0" y1="0" x2="80" y2="100">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
            <linearGradient id="u-base-2" x1="30" y1="10" x2="100" y2="100">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
        </defs>

        {/* Back User */}
        <g filter="url(#users-gloss)" opacity="0.85">
            <circle cx="65" cy="35" r="14" fill="url(#u-base-2)" />
            <path d="M65 52C80 52 90 62 90 75V80H40V75C40 62 50 52 65 52Z" fill="url(#u-base-2)" />
        </g>

        {/* Front User */}
        <g filter="url(#users-gloss)">
            <circle cx="38" cy="45" r="18" fill="url(#u-base-1)" />
            <path d="M38 68C53 68 68 80 68 95V100H8V95C8 80 23 68 38 68Z" fill="url(#u-base-1)" />
        </g>
    </svg>
);
