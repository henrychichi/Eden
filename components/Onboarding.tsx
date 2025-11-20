import React, { useState } from 'react';
import { User } from '../types';
import { INTERESTS } from '../services/mockData';
import { Camera, Check, ChevronRight } from 'lucide-react';

interface OnboardingProps {
    onComplete: (user: User) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<Partial<User>>({
        id: '1', // Current user ID
        name: '',
        age: 18,
        gender: 'Male',
        location: '',
        church: '',
        bio: '',
        interests: [],
        photos: [],
        verified: true // Auto verify for demo
    });

    const handleNext = () => {
        if (step < 3) setStep(step + 1);
        else {
            if (formData.name && formData.age && formData.church) {
                onComplete(formData as User);
            }
        }
    };

    const toggleInterest = (interest: string) => {
        const current = formData.interests || [];
        if (current.includes(interest)) {
            setFormData({ ...formData, interests: current.filter(i => i !== interest) });
        } else {
            if (current.length < 5) {
                setFormData({ ...formData, interests: [...current, interest] });
            }
        }
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ 
                    ...formData, 
                    photos: [...(formData.photos || []), reader.result as string] 
                });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="min-h-screen bg-teal-50 flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden">
                {/* Progress Bar */}
                <div className="h-2 bg-gray-100 w-full">
                    <div className="h-full bg-teal-500 transition-all duration-500" style={{ width: `${(step / 3) * 100}%` }}></div>
                </div>

                <div className="p-8">
                    {step === 1 && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-gray-800">Welcome to Eden</h2>
                                <p className="text-gray-500 text-sm mt-2">Let's create your profile.</p>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input 
                                        type="text" 
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-teal-500 focus:ring-0 outline-none transition-colors"
                                        placeholder="Your name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    />
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-1/3">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                                        <input 
                                            type="number" 
                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-teal-500 outline-none"
                                            value={formData.age}
                                            onChange={(e) => setFormData({...formData, age: parseInt(e.target.value)})}
                                        />
                                    </div>
                                    <div className="w-2/3">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                        <input 
                                            type="text" 
                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-teal-500 outline-none"
                                            placeholder="City"
                                            value={formData.location}
                                            onChange={(e) => setFormData({...formData, location: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">SDA Church</label>
                                    <input 
                                        type="text" 
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-teal-500 focus:ring-0 outline-none transition-colors"
                                        placeholder="e.g. Pioneer Memorial Church"
                                        value={formData.church}
                                        onChange={(e) => setFormData({...formData, church: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                                    <select 
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-teal-500 outline-none"
                                        value={formData.gender}
                                        onChange={(e) => setFormData({...formData, gender: e.target.value as any})}
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-gray-800">Your Photos</h2>
                                <p className="text-gray-500 text-sm mt-2">Upload up to 6 photos. Keep it clean!</p>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                {(formData.photos || []).map((photo, idx) => (
                                    <div key={idx} className="aspect-[3/4] rounded-xl overflow-hidden relative shadow-sm">
                                        <img src={photo} alt="Profile" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                                {(formData.photos?.length || 0) < 6 && (
                                    <label className="aspect-[3/4] rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-teal-400 transition-colors bg-gray-50">
                                        <Camera className="text-gray-400 mb-1" />
                                        <span className="text-xs text-gray-400 font-medium">Add</span>
                                        <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                                    </label>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Short Bio</label>
                                <textarea 
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-teal-500 outline-none resize-none"
                                    rows={3}
                                    placeholder="Tell us about yourself..."
                                    maxLength={200}
                                    value={formData.bio}
                                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                />
                                <div className="text-right text-xs text-gray-400 mt-1">
                                    {(formData.bio?.length || 0)}/200
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-gray-800">Interests</h2>
                                <p className="text-gray-500 text-sm mt-2">Pick up to 5 tags.</p>
                            </div>

                            <div className="flex flex-wrap gap-2 justify-center">
                                {INTERESTS.map(interest => {
                                    const isSelected = formData.interests?.includes(interest);
                                    return (
                                        <button
                                            key={interest}
                                            onClick={() => toggleInterest(interest)}
                                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                                isSelected 
                                                ? 'bg-teal-500 text-white shadow-md transform scale-105' 
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                        >
                                            {interest}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                    
                    <button 
                        onClick={handleNext}
                        className="w-full mt-8 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-teal-200 transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                        {step === 3 ? (
                            <>Complete Profile <Check size={20} /></>
                        ) : (
                            <>Continue <ChevronRight size={20} /></>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};