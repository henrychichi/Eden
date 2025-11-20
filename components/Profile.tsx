
import React from 'react';
import { User } from '../types';
import { Settings, Edit2, MapPin, Shield, Church, LogOut } from 'lucide-react';

interface ProfileProps {
    user: User | null;
    onLogout: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, onLogout }) => {
    if (!user) return null;

    return (
        <div className="h-full bg-white overflow-y-auto pb-20">
            <div className="relative">
                <div className="h-32 bg-teal-600"></div>
                <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
                    <div className="relative">
                        <img 
                            src={user.photos[0] || "https://picsum.photos/150"} 
                            alt={user.name} 
                            className="w-32 h-32 rounded-full border-4 border-white shadow-md object-cover"
                        />
                        <button className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-sm border border-gray-100 text-gray-600 hover:text-teal-600">
                            <Edit2 size={16} />
                        </button>
                    </div>
                </div>
                <button className="absolute top-4 right-4 text-white/80 hover:text-white">
                    <Settings size={24} />
                </button>
            </div>

            <div className="mt-20 text-center px-6">
                <h1 className="text-2xl font-bold text-gray-900">{user.name}, {user.age}</h1>
                <div className="flex items-center justify-center gap-1 text-gray-500 mt-1 text-sm">
                    <MapPin size={14} /> {user.location || 'Unknown Location'}
                </div>
                 <div className="flex items-center justify-center gap-1 text-gray-500 mt-1 text-sm">
                    <Church size={14} /> {user.church || 'No Church Listed'}
                </div>
            </div>

            <div className="px-6 mt-8 space-y-6">
                <div className="bg-teal-50 p-4 rounded-2xl border border-teal-100 flex items-center gap-3">
                    <Shield className="text-teal-600" />
                    <div>
                        <h3 className="font-bold text-teal-900 text-sm">Verified Member</h3>
                        <p className="text-xs text-teal-700">Your identity is verified.</p>
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">About Me</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                        {user.bio || "No bio yet."}
                    </p>
                </div>

                <div>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Interests</h3>
                    <div className="flex flex-wrap gap-2">
                        {user.interests.map(int => (
                            <span key={int} className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">
                                {int}
                            </span>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Photos</h3>
                    <div className="grid grid-cols-3 gap-2">
                        {user.photos.map((photo, i) => (
                            <div key={i} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                                <img src={photo} className="w-full h-full object-cover" alt="Gallery" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            <div className="mt-8 text-center px-6 pb-8">
                 <button 
                    onClick={onLogout}
                    className="w-full py-4 bg-gray-50 hover:bg-red-50 text-red-500 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                    <LogOut size={18} />
                    Log Out
                </button>
            </div>
        </div>
    );
};
