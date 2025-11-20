
import React from 'react';
import { AppView } from '../types';
import { Heart, MessageCircle, User, Globe, Trophy } from 'lucide-react';

interface NavigationProps {
    currentView: AppView;
    setView: (view: AppView) => void;
    unreadCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, setView, unreadCount }) => {
    const navItems = [
        { id: AppView.MATCHING, icon: Heart, label: 'Discover' },
        { id: AppView.FEED, icon: Globe, label: 'Community' },
        { id: AppView.CHALLENGES, icon: Trophy, label: 'Challenges' },
        { id: AppView.CHAT_LIST, icon: MessageCircle, label: 'Chat', badge: unreadCount },
        { id: AppView.PROFILE, icon: User, label: 'Profile' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 pb-safe pt-2 px-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50">
            <div className="flex justify-around items-center max-w-md mx-auto h-16">
                {navItems.map((item) => {
                    const isActive = currentView === item.id || 
                                     (item.id === AppView.CHAT_LIST && (currentView === AppView.CHAT_ROOM || currentView === AppView.VIDEO_CALL));
                    return (
                        <button
                            key={item.id}
                            onClick={() => setView(item.id)}
                            className={`relative flex flex-col items-center justify-center w-14 transition-colors duration-200 ${
                                isActive ? 'text-teal-600' : 'text-gray-400 hover:text-teal-400'
                            }`}
                        >
                            <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} fill={isActive && item.id === AppView.MATCHING ? "currentColor" : "none"} />
                            <span className="text-[9px] font-medium mt-1">{item.label}</span>
                            {item.badge ? (
                                <span className="absolute -top-1 right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                    {item.badge}
                                </span>
                            ) : null}
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};
