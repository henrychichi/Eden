
export interface User {
    id: string;
    name: string;
    age: number;
    gender: 'Male' | 'Female';
    location: string;
    church: string;
    bio: string;
    interests: string[];
    photos: string[];
    verified: boolean;
}

export interface Match {
    id: string;
    user: User;
    timestamp: number;
    lastMessage?: string;
    unreadCount: number;
}

export interface Message {
    id: string;
    senderId: string;
    text: string;
    image?: string;
    timestamp: number;
    type: 'text' | 'image';
}

export interface Comment {
    id: string;
    userId: string;
    userName: string;
    text: string;
    timestamp: number;
}

export interface Post {
    id: string;
    userId: string;
    user: User; // Denormalized for simplicity in demo
    imageUrl: string; // Using this as the generic media URL carrier
    mediaType?: 'image' | 'video'; // Defaults to image if undefined
    mediaRange?: { start: number; end: number }; // For trimmed videos
    caption: string;
    likes: number;
    isLiked: boolean;
    comments: Comment[];
    timestamp: number;
    challengeId?: string; // Optional link to a challenge
}

export interface Challenge {
    id: string;
    title: string;
    description: string;
    type: 'Video' | 'Photo' | 'Mixed';
    endDate: number;
    participants: number;
    imageUrl: string; // Banner image for the challenge
}

export enum AppView {
    AUTH = 'AUTH',
    ONBOARDING = 'ONBOARDING',
    MATCHING = 'MATCHING',
    FEED = 'FEED',
    CHALLENGES = 'CHALLENGES',
    CHAT_LIST = 'CHAT_LIST',
    CHAT_ROOM = 'CHAT_ROOM',
    VIDEO_CALL = 'VIDEO_CALL',
    PROFILE = 'PROFILE'
}

export interface SafetyCheckResult {
    safe: boolean;
    reason?: string;
}
