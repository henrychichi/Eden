import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, SwitchCamera, AlertCircle } from 'lucide-react';
import { Match } from '../types';

interface VideoCallProps {
    match: Match;
    onEndCall: () => void;
}

export const VideoCall: React.FC<VideoCallProps> = ({ match, onEndCall }) => {
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [showSafetyWarning, setShowSafetyWarning] = useState(true);
    const localVideoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        // Safety timeout
        const timer = setTimeout(() => setShowSafetyWarning(false), 4000);

        // Initialize Local Stream (Mock for demo, but uses real API)
        const startVideo = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Camera access denied", err);
            }
        };

        startVideo();

        return () => {
            clearTimeout(timer);
            // Cleanup tracks
            if (localVideoRef.current && localVideoRef.current.srcObject) {
                const tracks = (localVideoRef.current.srcObject as MediaStream).getTracks();
                tracks.forEach(track => track.stop());
            }
        };
    }, []);

    return (
        <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
            {/* Remote Video (Mocked with Profile Pic for demo) */}
            <div className="flex-1 relative w-full flex items-center justify-center bg-gray-800">
                <img 
                    src={match.user.photos[0]} 
                    alt="Remote" 
                    className="absolute inset-0 w-full h-full object-cover opacity-60" 
                />
                <div className="relative z-10 text-center animate-pulse">
                    <img 
                        src={match.user.photos[0]} 
                        alt="Connecting" 
                        className="w-24 h-24 rounded-full border-4 border-white mx-auto mb-4 object-cover shadow-2xl" 
                    />
                    <h2 className="text-white text-xl font-semibold tracking-wide">Connecting to {match.user.name}...</h2>
                </div>

                {/* Safety Warning Overlay */}
                {showSafetyWarning && (
                    <div className="absolute top-8 inset-x-4 bg-white/90 backdrop-blur-md rounded-xl p-4 flex gap-3 items-start shadow-xl animate-in slide-in-from-top-5 fade-in duration-700 z-50">
                        <AlertCircle className="text-teal-600 flex-shrink-0" />
                        <div>
                            <h3 className="font-bold text-gray-800 text-sm">Keep it clean and respectful.</h3>
                            <p className="text-xs text-gray-600 mt-1">Our community values safety. Nudity or harassment will result in an immediate ban.</p>
                        </div>
                    </div>
                )}

                {/* Local Video (Self View) */}
                <div className="absolute top-4 right-4 w-28 h-36 bg-black rounded-xl overflow-hidden shadow-lg border-2 border-white/20">
                    <video 
                        ref={localVideoRef} 
                        autoPlay 
                        muted 
                        playsInline 
                        className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : 'block'}`} 
                    />
                    {isVideoOff && (
                        <div className="w-full h-full flex items-center justify-center bg-gray-800">
                            <VideoOff className="text-gray-500" size={20} />
                        </div>
                    )}
                </div>
            </div>

            {/* Controls */}
            <div className="h-28 bg-gradient-to-t from-black/80 to-transparent absolute bottom-0 inset-x-0 flex items-center justify-center gap-6 pb-6">
                <button 
                    onClick={() => setIsVideoOff(!isVideoOff)}
                    className={`p-4 rounded-full backdrop-blur-sm transition-all ${isVideoOff ? 'bg-white text-gray-900' : 'bg-white/20 text-white hover:bg-white/30'}`}
                >
                    {isVideoOff ? <VideoOff size={24} /> : <VideoIcon size={24} />}
                </button>
                
                <button 
                    onClick={onEndCall}
                    className="p-5 rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600 transform hover:scale-105 transition-all"
                >
                    <PhoneOff size={32} />
                </button>
                
                <button 
                    onClick={() => setIsMuted(!isMuted)}
                    className={`p-4 rounded-full backdrop-blur-sm transition-all ${isMuted ? 'bg-white text-gray-900' : 'bg-white/20 text-white hover:bg-white/30'}`}
                >
                    {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                </button>
            </div>
            
            <button className="absolute top-6 left-6 text-white/70 hover:text-white">
                <SwitchCamera size={24} />
            </button>
        </div>
    );
};