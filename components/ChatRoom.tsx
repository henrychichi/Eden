
import React, { useState, useEffect, useRef } from 'react';
import { Message, Match } from '../types';
import { ArrowLeft, Send, Image as ImageIcon, Video, MoreVertical, ShieldAlert, Loader } from 'lucide-react';
import { moderateContent, moderateImage } from '../services/geminiService';
import { sendNotification } from '../services/notificationService';

interface ChatRoomProps {
    match: Match;
    onBack: () => void;
    onStartVideo: () => void;
}

export const ChatRoom: React.FC<ChatRoomProps> = ({ match, onBack, onStartVideo }) => {
    const [messages, setMessages] = useState<Message[]>([
        { id: '0', senderId: match.id, text: "Hi! I saw you like hiking too.", timestamp: Date.now() - 100000, type: 'text' }
    ]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isPartnerTyping, setIsPartnerTyping] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages, isPartnerTyping]);

    const handleSend = async () => {
        if (!inputText.trim()) return;

        const textToSend = inputText;
        setInputText(''); // Optimistic clear
        setIsTyping(true);

        // Safety Check
        const safetyResult = await moderateContent(textToSend);

        if (!safetyResult.safe) {
            setError(`Message blocked: ${safetyResult.reason || "Inappropriate content."}`);
            setIsTyping(false);
            return;
        }
        
        setError(null);

        const newMessage: Message = {
            id: Date.now().toString(),
            senderId: '1', // Current User
            text: textToSend,
            timestamp: Date.now(),
            type: 'text'
        };

        setMessages(prev => [...prev, newMessage]);
        setIsTyping(false);

        simulatePartnerResponse();
    };

    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setError(null);

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64String = reader.result as string;
            
            // Safety Check
            const safetyResult = await moderateImage(base64String);

            if (!safetyResult.safe) {
                 setError(`Image blocked: ${safetyResult.reason || "Inappropriate content."}`);
                 setIsUploading(false);
                 // Clear input so same file can be selected again if needed (though usually blocked)
                 if (fileInputRef.current) fileInputRef.current.value = '';
                 return;
            }

            const newMessage: Message = {
                id: Date.now().toString(),
                senderId: '1',
                text: 'Sent a photo', 
                image: base64String,
                timestamp: Date.now(),
                type: 'image'
            };

            setMessages(prev => [...prev, newMessage]);
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
            
            simulatePartnerResponse();
        };
        reader.readAsDataURL(file);
    };

    const simulatePartnerResponse = () => {
        // Simulate Partner Reply
        setIsPartnerTyping(true);
        setTimeout(() => {
            setIsPartnerTyping(false);
            const replyText = "That sounds really interesting! Tell me more!";
            const replyMessage: Message = {
                id: (Date.now() + 1).toString(),
                senderId: match.id,
                text: replyText,
                timestamp: Date.now(),
                type: 'text'
            };
            setMessages(prev => [...prev, replyMessage]);
            
            // Trigger Notification only if app is in background
            if (document.visibilityState === 'hidden') {
                sendNotification(`New message from ${match.user.name}`, {
                    body: replyText,
                    icon: match.user.photos[0]
                });
            }

        }, 3000);
    };

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-white z-10">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-2 hover:bg-gray-50 rounded-full">
                        <ArrowLeft size={20} className="text-gray-600" />
                    </button>
                    <div className="relative">
                        <img src={match.user.photos[0]} alt={match.user.name} className="w-10 h-10 rounded-full object-cover" />
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-800 text-sm">{match.user.name}</h3>
                        <span className="text-xs text-gray-400">Online</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={onStartVideo}
                        className="p-2 hover:bg-teal-50 rounded-full text-teal-600 transition-colors"
                    >
                        <Video size={22} />
                    </button>
                    <button className="p-2 hover:bg-gray-50 rounded-full text-gray-400">
                        <MoreVertical size={20} />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
                <div className="flex justify-center my-4">
                    <span className="bg-teal-100 text-teal-800 text-xs px-3 py-1 rounded-full">
                        Matches since today
                    </span>
                </div>

                {messages.map((msg) => {
                    const isMe = msg.senderId === '1';
                    return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div 
                                className={`max-w-[75%] px-4 py-2.5 rounded-2xl shadow-sm text-sm ${
                                    isMe 
                                    ? 'bg-teal-600 text-white rounded-br-none' 
                                    : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
                                }`}
                            >
                                {msg.type === 'image' && msg.image ? (
                                    <div className="mb-1">
                                        <img src={msg.image} alt="Shared" className="rounded-lg max-w-full h-auto object-cover" />
                                    </div>
                                ) : (
                                    msg.text
                                )}
                            </div>
                        </div>
                    );
                })}
                
                {isPartnerTyping && (
                    <div className="flex justify-start">
                        <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-none border border-gray-100 flex items-center gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="flex justify-center">
                        <div className="flex items-center gap-2 bg-red-50 text-red-600 text-xs px-4 py-2 rounded-lg border border-red-100">
                            <ShieldAlert size={14} />
                            {error}
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleImageSelect} 
                />
                <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full border border-gray-200 focus-within:border-teal-400 focus-within:ring-1 focus-within:ring-teal-400 transition-all">
                    <button 
                        onClick={() => !isUploading && fileInputRef.current?.click()}
                        className={`text-gray-400 hover:text-teal-500 transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={isUploading}
                    >
                        {isUploading ? <Loader size={20} className="animate-spin" /> : <ImageIcon size={20} />}
                    </button>
                    <input 
                        type="text" 
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Type a message..."
                        className="flex-1 bg-transparent outline-none text-sm text-gray-800 py-2"
                        disabled={isUploading}
                    />
                    <button 
                        onClick={handleSend}
                        disabled={!inputText.trim() || isTyping || isUploading}
                        className={`p-2 rounded-full transition-all ${
                            inputText.trim() ? 'bg-teal-500 text-white shadow-md' : 'bg-gray-200 text-gray-400'
                        }`}
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};
