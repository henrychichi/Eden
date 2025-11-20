import React, { useState } from 'react';
import { User } from '../types';
import { MOCK_USERS } from '../services/mockData';
import { MapPin, Church, Heart, Check, Search, Filter } from 'lucide-react';

interface MatchingProps {
    onMatch: (user: User) => void;
}

export const Matching: React.FC<MatchingProps> = ({ onMatch }) => {
    const [users, setUsers] = useState<User[]>(MOCK_USERS);
    const [likedUsers, setLikedUsers] = useState<Set<string>>(new Set());

    const handleLike = (user: User) => {
        if (likedUsers.has(user.id)) return;
        
        // Trigger the match callback
        onMatch(user);
        
        // Update local state to show "Liked" status
        setLikedUsers(prev => new Set(prev).add(user.id));
    };

    return (
        <div className="h-full flex flex-col bg-gray-50">
            {/* Header */}
            <div className="px-6 pt-6 pb-4 bg-white shadow-sm z-10">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Discover</h1>
                        <p className="text-xs text-gray-400">Find SDA youth nearby</p>
                    </div>
                    <button className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-teal-50 hover:text-teal-600 transition-colors">
                        <Filter size={20} />
                    </button>
                </div>
                
                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                        type="text" 
                        placeholder="Search interests, church, location..." 
                        className="w-full bg-gray-100 rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-teal-100 transition-all border-transparent focus:border-teal-100"
                    />
                </div>
            </div>

            {/* Grid Content */}
            <div className="flex-1 overflow-y-auto p-4 pb-24">
                <div className="grid grid-cols-2 gap-4">
                    {users.map(user => {
                        const isLiked = likedUsers.has(user.id);
                        
                        return (
                            <div key={user.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow relative group">
                                {/* Image */}
                                <div className="aspect-[4/5] relative">
                                    <img 
                                        src={user.photos[0]} 
                                        alt={user.name} 
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-80" />
                                    
                                    {/* Like Button on Card */}
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleLike(user);
                                        }}
                                        disabled={isLiked}
                                        className={`absolute bottom-2 right-2 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-all transform active:scale-90 shadow-lg ${
                                            isLiked 
                                            ? 'bg-teal-500 text-white' 
                                            : 'bg-white/20 text-white hover:bg-white hover:text-teal-500 border border-white/30'
                                        }`}
                                    >
                                        <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="p-3">
                                    <div className="flex items-center gap-1 mb-1">
                                        <h3 className="font-bold text-gray-800 truncate text-sm">{user.name}, {user.age}</h3>
                                        {user.verified && <Check size={12} className="text-white bg-blue-500 rounded-full p-[1px] flex-shrink-0" />}
                                    </div>
                                    
                                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                                        <Church size={12} className="flex-shrink-0 text-teal-600" />
                                        <span className="truncate">{user.church}</span>
                                    </div>
                                    
                                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                        <MapPin size={12} className="flex-shrink-0" />
                                        <span className="truncate">{user.location}</span>
                                    </div>

                                    {/* Interests Tags (Mini) */}
                                    <div className="flex gap-1 mt-2 overflow-hidden mask-linear-fade">
                                        {user.interests.slice(0, 2).map(int => (
                                            <span key={int} className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md truncate border border-gray-200">
                                                {int}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                
                {/* Empty State/Bottom */}
                <div className="text-center mt-8 mb-4 space-y-2">
                    <p className="text-xs text-gray-400">That's everyone for now!</p>
                    <button className="text-teal-600 text-xs font-medium">Invite Friends</button>
                </div>
            </div>
        </div>
    );
};