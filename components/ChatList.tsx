import React from 'react';
import { Match } from '../types';
import { ChevronRight } from 'lucide-react';

interface ChatListProps {
    matches: Match[];
    onSelectMatch: (match: Match) => void;
}

export const ChatList: React.FC<ChatListProps> = ({ matches, onSelectMatch }) => {
    return (
        <div className="h-full flex flex-col bg-white">
            <div className="px-6 pt-6 pb-4">
                <h1 className="text-2xl font-bold text-gray-800">Messages</h1>
            </div>

            {/* Recent Matches Scroll */}
            <div className="px-6 mb-6">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">New Matches</h2>
                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                    {matches.map(match => (
                        <div key={match.id} onClick={() => onSelectMatch(match)} className="flex flex-col items-center cursor-pointer min-w-[70px]">
                            <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-teal-400 to-blue-500 mb-2">
                                <img src={match.user.photos[0]} alt={match.user.name} className="w-full h-full rounded-full object-cover border-2 border-white" />
                            </div>
                            <span className="text-xs font-medium text-gray-700 truncate w-full text-center">{match.user.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat List */}
            <div className="flex-1 bg-white rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.03)] overflow-y-auto">
                <div className="p-2">
                    {matches.length === 0 ? (
                        <div className="text-center text-gray-400 mt-10">
                            <p>No conversations yet.</p>
                            <p className="text-sm mt-2">Start matching to find friends!</p>
                        </div>
                    ) : (
                        matches.map(match => (
                            <div 
                                key={match.id} 
                                onClick={() => onSelectMatch(match)}
                                className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-2xl cursor-pointer transition-colors"
                            >
                                <img src={match.user.photos[0]} alt={match.user.name} className="w-14 h-14 rounded-full object-cover" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="font-bold text-gray-800">{match.user.name}</h3>
                                        <span className="text-xs text-gray-400">2m ago</span>
                                    </div>
                                    <p className="text-sm text-gray-500 truncate pr-4">{match.lastMessage || "Start a conversation..."}</p>
                                </div>
                                {match.unreadCount > 0 && (
                                    <div className="w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                                        {match.unreadCount}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};