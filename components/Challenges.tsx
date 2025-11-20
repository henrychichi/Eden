
import React, { useState, useRef } from 'react';
import { Challenge, Post, User } from '../types';
import { MOCK_CHALLENGES, MOCK_POSTS, MOCK_USERS } from '../services/mockData';
import { Trophy, Clock, Users, Camera, Heart, Crown, Loader, Sparkles, Video, Play } from 'lucide-react';
import { moderateImage, moderateVideo, moderateContent } from '../services/geminiService';

interface ChallengesProps {
    currentUser: User;
}

export const Challenges: React.FC<ChallengesProps> = ({ currentUser }) => {
    const [activeTab, setActiveTab] = useState<'active' | 'leaderboard'>('active');
    const [challenges, setChallenges] = useState<Challenge[]>(MOCK_CHALLENGES);
    const [posts, setPosts] = useState<Post[]>(MOCK_POSTS.filter(p => p.challengeId));
    const [selectedChallenge, setSelectedChallenge] = useState<Challenge>(MOCK_CHALLENGES[0]);

    // Upload State (Simplified logic from SocialFeed for demo consistency)
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Helper to get leaderboard data (Mock calculation)
    const getLeaderboard = () => {
        // Simulate scores based on mock data + randomness
        return MOCK_USERS.map((user, index) => ({
            ...user,
            score: Math.floor(Math.random() * 500) + 100 + (user.verified ? 200 : 0),
            rank: index + 1
        })).sort((a, b) => b.score - a.score);
    };

    const leaderboardData = getLeaderboard();

    const handleJoinChallenge = () => {
        fileInputRef.current?.click();
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        
        const isVideo = file.type.startsWith('video/');
        const reader = new FileReader();
        
        reader.onloadend = async () => {
            const base64 = reader.result as string;
            
            // Safety Check
            let safety;
            if (isVideo) safety = await moderateVideo(base64);
            else safety = await moderateImage(base64);

            if (safety.safe) {
                // Create Entry
                const newPost: Post = {
                    id: Date.now().toString(),
                    userId: currentUser.id,
                    user: currentUser,
                    imageUrl: base64,
                    mediaType: isVideo ? 'video' : 'image',
                    caption: `Joining the ${selectedChallenge.title} challenge!`,
                    likes: 0,
                    isLiked: false,
                    comments: [],
                    timestamp: Date.now(),
                    challengeId: selectedChallenge.id
                };
                
                setPosts([newPost, ...posts]);
                
                // Update participant count visually
                setChallenges(prev => prev.map(c => 
                    c.id === selectedChallenge.id ? { ...c, participants: c.participants + 1 } : c
                ));

                alert("Challenge entry submitted successfully!");
            } else {
                alert(`Submission blocked: ${safety.reason}`);
            }
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="h-full flex flex-col bg-gray-50">
            {/* Header */}
            <div className="px-6 pt-6 pb-2 bg-white shadow-sm z-10">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Challenges</h1>
                        <p className="text-xs text-gray-400">Compete, Share, Inspire</p>
                    </div>
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        <button 
                            onClick={() => setActiveTab('active')}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                                activeTab === 'active' ? 'bg-white text-teal-600 shadow-sm' : 'text-gray-400'
                            }`}
                        >
                            Active
                        </button>
                        <button 
                            onClick={() => setActiveTab('leaderboard')}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                                activeTab === 'leaderboard' ? 'bg-white text-teal-600 shadow-sm' : 'text-gray-400'
                            }`}
                        >
                            Leaderboard
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pb-24">
                {activeTab === 'active' ? (
                    <div className="space-y-6 p-4">
                        {/* Challenge Hero Card */}
                        <div className="relative rounded-2xl overflow-hidden aspect-[16/9] shadow-lg group">
                            <img src={selectedChallenge.imageUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="Challenge" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="bg-teal-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">
                                        Weekly Challenge
                                    </span>
                                    <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                        <Clock size={10} /> {Math.ceil((selectedChallenge.endDate - Date.now()) / 86400000)} days left
                                    </span>
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-1">{selectedChallenge.title}</h2>
                                <p className="text-white/80 text-sm line-clamp-2">{selectedChallenge.description}</p>
                                
                                <div className="mt-4 flex items-center justify-between">
                                    <div className="flex items-center gap-1 text-white/70 text-xs">
                                        <Users size={14} />
                                        <span>{selectedChallenge.participants} joined</span>
                                    </div>
                                    <input type="file" ref={fileInputRef} hidden accept="image/*,video/mp4" onChange={handleFileSelect} />
                                    <button 
                                        onClick={handleJoinChallenge}
                                        disabled={isUploading}
                                        className="bg-white text-teal-600 hover:bg-teal-50 font-bold text-xs px-4 py-2 rounded-full flex items-center gap-2 transition-colors"
                                    >
                                        {isUploading ? <Loader size={14} className="animate-spin" /> : <Camera size={14} />}
                                        Join Now
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Other Challenges List */}
                        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                            {challenges.filter(c => c.id !== selectedChallenge.id).map(c => (
                                <button 
                                    key={c.id}
                                    onClick={() => setSelectedChallenge(c)}
                                    className="min-w-[140px] h-24 rounded-xl relative overflow-hidden flex-shrink-0 border-2 border-transparent hover:border-teal-400 transition-all"
                                >
                                    <img src={c.imageUrl} className="w-full h-full object-cover" alt={c.title} />
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-center p-2">
                                        <span className="text-white text-xs font-bold">{c.title}</span>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Challenge Feed */}
                        <div>
                            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                <Sparkles size={16} className="text-yellow-500" /> 
                                Recent Entries
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                {posts.filter(p => p.challengeId === selectedChallenge.id).map(post => (
                                    <div key={post.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
                                        <div className="aspect-[4/5] relative bg-black">
                                            {post.mediaType === 'video' ? (
                                                <>
                                                    <video src={post.imageUrl} className="w-full h-full object-cover" />
                                                    <div className="absolute top-2 right-2 bg-black/40 p-1 rounded-full">
                                                        <Video size={12} className="text-white" />
                                                    </div>
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-50">
                                                        <Play size={24} className="text-white" fill="currentColor" />
                                                    </div>
                                                </>
                                            ) : (
                                                <img src={post.imageUrl} className="w-full h-full object-cover" alt="Entry" />
                                            )}
                                            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                                                <div className="flex items-center justify-between text-white">
                                                    <span className="text-xs font-medium truncate">{post.user.name}</span>
                                                    <div className="flex items-center gap-1 text-[10px]">
                                                        <Heart size={10} fill="currentColor" /> {post.likes}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {posts.filter(p => p.challengeId === selectedChallenge.id).length === 0 && (
                                    <div className="col-span-2 text-center py-8 text-gray-400 text-sm">
                                        No entries yet. Be the first!
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-4 space-y-4">
                        {/* Leaderboard Header */}
                        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-6 text-white shadow-lg mb-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold">Top Creators</h2>
                                    <p className="text-white/80 text-sm">Based on participation & likes</p>
                                </div>
                                <Trophy size={48} className="text-white/30 rotate-12" />
                            </div>
                        </div>

                        {/* List */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            {leaderboardData.map((user, idx) => (
                                <div key={user.id} className="flex items-center p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                                    <div className="w-8 font-bold text-gray-400 text-sm text-center mr-2">
                                        {idx === 0 ? <Crown size={20} className="text-yellow-500 mx-auto fill-yellow-500" /> : 
                                         idx === 1 ? <Crown size={20} className="text-gray-400 mx-auto" /> :
                                         idx === 2 ? <Crown size={20} className="text-amber-700 mx-auto" /> :
                                         `#${idx + 1}`}
                                    </div>
                                    <img src={user.photos[0]} className="w-10 h-10 rounded-full object-cover border-2 border-gray-100" alt={user.name} />
                                    <div className="flex-1 ml-3">
                                        <h3 className="font-bold text-gray-800 text-sm">{user.name}</h3>
                                        <p className="text-xs text-gray-400">{user.church}</p>
                                    </div>
                                    <div className="text-teal-600 font-bold text-sm bg-teal-50 px-2 py-1 rounded-md">
                                        {user.score} pts
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
