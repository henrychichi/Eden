
import React, { useState, useRef, useEffect } from 'react';
import { Post, User } from '../types';
import { MOCK_POSTS } from '../services/mockData';
import { Heart, MessageCircle, Image as ImageIcon, MoreVertical, Loader, Sparkles, Video, X, Scissors, Play, Pause } from 'lucide-react';
import { moderateContent, moderateImage, generateImageCaption, moderateVideo, generateVideoCaption } from '../services/geminiService';

interface SocialFeedProps {
    currentUser: User;
}

export const SocialFeed: React.FC<SocialFeedProps> = ({ currentUser }) => {
    const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
    const [newCaption, setNewCaption] = useState('');
    const [newMedia, setNewMedia] = useState<string | null>(null);
    const [newMediaType, setNewMediaType] = useState<'image' | 'video'>('image');
    const [newMediaRange, setNewMediaRange] = useState<{ start: number, end: number } | undefined>(undefined);
    const [isUploading, setIsUploading] = useState(false);
    const [commentText, setCommentText] = useState<{[key: string]: string}>({});
    
    // Trimming State
    const [isTrimming, setIsTrimming] = useState(false);
    const [trimFile, setTrimFile] = useState<File | null>(null);
    const [trimVideoDuration, setTrimVideoDuration] = useState(0);
    const [trimStart, setTrimStart] = useState(0);
    const [trimEnd, setTrimEnd] = useState(0);
    const [trimPreviewUrl, setTrimPreviewUrl] = useState<string | null>(null);
    const trimVideoRef = useRef<HTMLVideoElement>(null);
    const [isPlayingPreview, setIsPlayingPreview] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const DRAFT_KEY = 'eden_social_feed_draft';

    // Load draft on mount
    useEffect(() => {
        const loadDraft = () => {
            try {
                const saved = localStorage.getItem(DRAFT_KEY);
                if (saved) {
                    const draft = JSON.parse(saved);
                    if (draft.caption) setNewCaption(draft.caption);
                    if (draft.media) setNewMedia(draft.media);
                    if (draft.mediaType) setNewMediaType(draft.mediaType);
                    if (draft.mediaRange) setNewMediaRange(draft.mediaRange);
                }
            } catch (e) {
                console.error("Failed to load draft", e);
            }
        };
        loadDraft();
    }, []);

    // Auto-save draft on change
    useEffect(() => {
        // If everything is empty, clear the draft
        if (!newCaption && !newMedia) {
            localStorage.removeItem(DRAFT_KEY);
            return;
        }
        
        // Debounce save to avoid freezing UI on large base64 strings
        const saveTimeout = setTimeout(() => {
            try {
                const draft = {
                    caption: newCaption,
                    media: newMedia,
                    mediaType: newMediaType,
                    mediaRange: newMediaRange
                };
                localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
            } catch (e) {
                // Storage quota exceeded is common with base64 videos
                console.warn("Draft storage failed (likely quota exceeded)", e);
            }
        }, 1000);

        return () => clearTimeout(saveTimeout);
    }, [newCaption, newMedia, newMediaType, newMediaRange]);

    const handleMediaSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Size check (20MB limit for video to keep base64 reasonable)
        if (file.size > 20 * 1024 * 1024) {
            alert("File size too large. Please upload files under 20MB.");
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        const isVideo = file.type.startsWith('video/');
        
        if (isVideo) {
            const video = document.createElement('video');
            video.preload = 'metadata';
            
            video.onloadedmetadata = () => {
                window.URL.revokeObjectURL(video.src);
                const duration = video.duration;
                
                // If video is longer than 120 seconds, force trim
                if (duration > 120) {
                    setTrimFile(file);
                    setTrimVideoDuration(duration);
                    setTrimStart(0);
                    setTrimEnd(120); // Default to first 2 mins
                    setTrimPreviewUrl(URL.createObjectURL(file));
                    setIsTrimming(true);
                } else {
                    // If shorter than 120s, we still allow the file, no trim needed by default
                    // We can set range to full duration
                    processFile(file, true, { start: 0, end: duration });
                }
            };

            video.onerror = () => {
                alert("Failed to load video metadata.");
                if (fileInputRef.current) fileInputRef.current.value = '';
            };

            video.src = URL.createObjectURL(file);
        } else {
            processFile(file, false);
        }
    };

    const processFile = (file: File, isVideo: boolean, range?: { start: number, end: number }) => {
        setNewMediaType(isVideo ? 'video' : 'image');
        if (range) setNewMediaRange(range);
        else setNewMediaRange(undefined);

        setIsUploading(true);

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64 = reader.result as string;
            
            try {
                // Safety Check
                let safety;
                if (isVideo) {
                    safety = await moderateVideo(base64);
                } else {
                    safety = await moderateImage(base64);
                }

                if (safety.safe) {
                    setNewMedia(base64);
                    
                    // Only generate caption if the field is empty
                    if (!newCaption.trim()) {
                        const suggestedCaption = isVideo 
                            ? await generateVideoCaption(base64) 
                            : await generateImageCaption(base64);
                            
                        if (suggestedCaption) {
                            setNewCaption(suggestedCaption);
                        }
                    }
                } else {
                    alert(`${isVideo ? 'Video' : 'Image'} removed: ${safety.reason}`);
                    setNewMedia(null);
                    setNewMediaRange(undefined);
                }
            } catch (error) {
                console.error("Error processing media:", error);
                alert("An error occurred while processing your media.");
                setNewMedia(null);
            } finally {
                setIsUploading(false);
                // Clear input to allow re-uploading same file if needed
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        };
        reader.readAsDataURL(file);
    };

    const handleTrimConfirm = () => {
        if (trimFile) {
            setIsTrimming(false);
            if (trimPreviewUrl) URL.revokeObjectURL(trimPreviewUrl);
            setTrimPreviewUrl(null);
            // Process the file with the selected range
            processFile(trimFile, true, { start: trimStart, end: trimEnd });
        }
    };

    const handleTrimCancel = () => {
        setIsTrimming(false);
        setTrimFile(null);
        if (trimPreviewUrl) URL.revokeObjectURL(trimPreviewUrl);
        setTrimPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Trim Modal Effect to manage preview playback
    useEffect(() => {
        if (isTrimming && trimVideoRef.current) {
            const vid = trimVideoRef.current;
            
            const handleTimeUpdate = () => {
                if (vid.currentTime >= trimEnd) {
                    vid.pause();
                    setIsPlayingPreview(false);
                    vid.currentTime = trimStart;
                }
            };

            vid.addEventListener('timeupdate', handleTimeUpdate);
            // Ensure we start at trimStart when range changes
            if (vid.currentTime < trimStart || vid.currentTime > trimEnd) {
                vid.currentTime = trimStart;
            }

            return () => {
                vid.removeEventListener('timeupdate', handleTimeUpdate);
            };
        }
    }, [isTrimming, trimStart, trimEnd]);

    const togglePreviewPlay = () => {
        if (trimVideoRef.current) {
            if (isPlayingPreview) {
                trimVideoRef.current.pause();
            } else {
                // Reset to start if at end
                if (trimVideoRef.current.currentTime >= trimEnd) {
                    trimVideoRef.current.currentTime = trimStart;
                }
                trimVideoRef.current.play();
            }
            setIsPlayingPreview(!isPlayingPreview);
        }
    };

    const handleCreatePost = async () => {
        if (!newMedia) return;

        // Moderate Caption
        const safety = await moderateContent(newCaption || "Check this out");
        if (!safety.safe) {
            alert("Please keep captions respectful.");
            return;
        }

        const newPost: Post = {
            id: Date.now().toString(),
            userId: currentUser.id,
            user: currentUser,
            imageUrl: newMedia, 
            mediaType: newMediaType,
            mediaRange: newMediaRange,
            caption: newCaption,
            likes: 0,
            isLiked: false,
            comments: [],
            timestamp: Date.now()
        };

        setPosts([newPost, ...posts]);
        
        // Clear state
        setNewCaption('');
        setNewMedia(null);
        setNewMediaRange(undefined);
        setNewMediaType('image');
        
        // Clear stored draft
        localStorage.removeItem(DRAFT_KEY);
    };

    const handleLike = (postId: string) => {
        setPosts(posts.map(post => {
            if (post.id === postId) {
                return {
                    ...post,
                    likes: post.isLiked ? post.likes - 1 : post.likes + 1,
                    isLiked: !post.isLiked
                };
            }
            return post;
        }));
    };

    const handleComment = (postId: string) => {
        const text = commentText[postId];
        if (!text?.trim()) return;

        setPosts(posts.map(post => {
            if (post.id === postId) {
                return {
                    ...post,
                    comments: [...post.comments, {
                        id: Date.now().toString(),
                        userId: currentUser.id,
                        userName: currentUser.name,
                        text: text,
                        timestamp: Date.now()
                    }]
                };
            }
            return post;
        }));

        setCommentText({ ...commentText, [postId]: '' });
    };

    return (
        <div className="h-full flex flex-col bg-gray-50 relative">
            <div className="px-6 pt-6 pb-4 bg-white shadow-sm z-10">
                <h1 className="text-2xl font-bold text-gray-800">Community</h1>
                <p className="text-xs text-gray-400">Share your moments</p>
            </div>

            {/* Trimming Modal */}
            {isTrimming && (
                <div className="absolute inset-0 z-50 bg-white flex flex-col">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="font-bold text-lg">Trim Video</h2>
                        <button onClick={handleTrimCancel} className="p-2 hover:bg-gray-100 rounded-full">
                            <X size={24} className="text-gray-500" />
                        </button>
                    </div>
                    
                    <div className="flex-1 bg-black relative flex items-center justify-center">
                         {trimPreviewUrl && (
                            <video 
                                ref={trimVideoRef}
                                src={trimPreviewUrl} 
                                className="max-w-full max-h-full"
                                onPlay={() => setIsPlayingPreview(true)}
                                onPause={() => setIsPlayingPreview(false)}
                            />
                        )}
                        <button 
                            onClick={togglePreviewPlay}
                            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-4 text-white transition-all"
                        >
                            {isPlayingPreview ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" />}
                        </button>
                    </div>

                    <div className="p-6 bg-white space-y-6">
                        <div>
                            <div className="flex justify-between text-sm text-gray-600 mb-2">
                                <span>Start: {Math.floor(trimStart)}s</span>
                                <span>End: {Math.floor(trimEnd)}s</span>
                            </div>
                            <div className="relative h-12 bg-gray-100 rounded-lg overflow-hidden">
                                {/* Simple Visual Representation of timeline */}
                                <div 
                                    className="absolute top-0 bottom-0 bg-teal-500 opacity-20"
                                    style={{ 
                                        left: `${(trimStart / trimVideoDuration) * 100}%`, 
                                        width: `${((trimEnd - trimStart) / trimVideoDuration) * 100}%` 
                                    }}
                                ></div>
                            </div>
                            
                            <div className="mt-4 space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase">Start Time</label>
                                    <input 
                                        type="range" 
                                        min="0" 
                                        max={trimVideoDuration - 5} // Ensure min 5s duration
                                        step="1"
                                        value={trimStart}
                                        onChange={(e) => {
                                            const val = Number(e.target.value);
                                            setTrimStart(val);
                                            // Adjust end if needed to maintain max 120s and min 1s
                                            if (trimEnd <= val) setTrimEnd(Math.min(val + 120, trimVideoDuration));
                                            else if (trimEnd - val > 120) setTrimEnd(val + 120);
                                            // Update video head
                                            if (trimVideoRef.current) trimVideoRef.current.currentTime = val;
                                        }}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase">End Time</label>
                                    <input 
                                        type="range" 
                                        min="0" 
                                        max={trimVideoDuration}
                                        step="1"
                                        value={trimEnd}
                                        onChange={(e) => {
                                            const val = Number(e.target.value);
                                            // Ensure end is after start
                                            if (val > trimStart) {
                                                // Enforce 120s limit
                                                if (val - trimStart <= 120) {
                                                    setTrimEnd(val);
                                                }
                                            }
                                        }}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                                    />
                                </div>
                                <p className="text-center text-xs text-gray-500">
                                    Duration: {Math.floor(trimEnd - trimStart)}s (Max 120s)
                                </p>
                            </div>
                        </div>

                        <button 
                            onClick={handleTrimConfirm}
                            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-teal-200 transition-all"
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}

            <div className="flex-1 overflow-y-auto pb-20">
                {/* Create Post Section */}
                <div className="bg-white p-4 mb-4 shadow-sm">
                    <div className="flex gap-3">
                        <img src={currentUser.photos[0] || "https://via.placeholder.com/40"} className="w-10 h-10 rounded-full object-cover" alt="You" />
                        <div className="flex-1">
                            <textarea 
                                placeholder="How was your day spent?" 
                                className="w-full text-sm resize-none outline-none text-gray-700 mb-2"
                                rows={2}
                                value={newCaption}
                                onChange={(e) => setNewCaption(e.target.value)}
                                disabled={isUploading}
                            />
                            
                            {newMedia && (
                                <div className="relative mb-3 rounded-lg overflow-hidden w-full h-48 bg-black">
                                    {newMediaType === 'video' ? (
                                        <video 
                                            src={newMedia} 
                                            className="w-full h-full object-contain" 
                                            controls
                                            ref={(el) => {
                                                if (el && newMediaRange) {
                                                    // Initial seek
                                                    if (el.currentTime < newMediaRange.start) {
                                                        el.currentTime = newMediaRange.start;
                                                    }
                                                }
                                            }}
                                            onTimeUpdate={(e) => {
                                                if (newMediaRange) {
                                                    const vid = e.currentTarget;
                                                    if (vid.currentTime >= newMediaRange.end) {
                                                        vid.pause();
                                                        vid.currentTime = newMediaRange.start;
                                                    }
                                                }
                                            }} 
                                        />
                                    ) : (
                                        <img src={newMedia} className="w-full h-full object-cover" alt="Preview" />
                                    )}
                                    <button 
                                        onClick={() => {
                                            setNewMedia(null);
                                            setNewMediaRange(undefined);
                                            // Reset file input so user can select same file again if they want
                                            if (fileInputRef.current) fileInputRef.current.value = '';
                                        }}
                                        className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 hover:bg-black/70 z-10 transition-colors"
                                        title="Remove media"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            )}

                            <div className="flex justify-between items-center border-t border-gray-100 pt-2">
                                <input type="file" ref={fileInputRef} hidden accept="image/*,video/mp4,video/webm" onChange={handleMediaSelect} />
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex items-center gap-1 text-teal-600 text-xs font-medium hover:bg-teal-50 px-2 py-1 rounded-md transition-colors"
                                        disabled={isUploading}
                                    >
                                        {isUploading ? <Loader size={16} className="animate-spin" /> : <ImageIcon size={16} />}
                                        Add Media
                                    </button>
                                    {isUploading && (
                                        <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                            <Sparkles size={10} /> Analyzing...
                                        </span>
                                    )}
                                </div>
                                <button 
                                    onClick={handleCreatePost}
                                    disabled={!newMedia || isUploading}
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold text-white transition-colors ${
                                        !newMedia || isUploading ? 'bg-gray-300 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700'
                                    }`}
                                >
                                    Post
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feed */}
                <div className="space-y-4 px-2">
                    {posts.map(post => (
                        <div key={post.id} className="bg-white rounded-2xl p-4 shadow-sm">
                            {/* Post Header */}
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <img src={post.user.photos[0]} className="w-9 h-9 rounded-full object-cover" alt={post.user.name} />
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-800">{post.user.name}</h3>
                                        <p className="text-[10px] text-gray-400">{new Date(post.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                    </div>
                                </div>
                                <button className="text-gray-300 hover:text-gray-500">
                                    <MoreVertical size={18} />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="rounded-xl overflow-hidden mb-3 aspect-[4/3] bg-black flex items-center justify-center relative">
                                {post.mediaType === 'video' ? (
                                    <>
                                        <video 
                                            src={post.imageUrl} 
                                            className="w-full h-full object-contain" 
                                            controls 
                                            onLoadedMetadata={(e) => {
                                                 if (post.mediaRange) {
                                                    e.currentTarget.currentTime = post.mediaRange.start;
                                                 }
                                            }}
                                            onTimeUpdate={(e) => {
                                                if (post.mediaRange) {
                                                    const vid = e.currentTarget;
                                                    if (vid.currentTime >= post.mediaRange.end) {
                                                        vid.pause();
                                                        vid.currentTime = post.mediaRange.start;
                                                    }
                                                }
                                            }}
                                        />
                                        <div className="absolute top-2 right-2 bg-black/40 p-1 rounded-full pointer-events-none">
                                             <Video size={14} className="text-white" />
                                        </div>
                                    </>
                                ) : (
                                    <img src={post.imageUrl} className="w-full h-full object-cover" alt="Post" />
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-4 mb-2">
                                <button 
                                    onClick={() => handleLike(post.id)}
                                    className="flex items-center gap-1 text-sm group"
                                >
                                    <Heart 
                                        size={22} 
                                        className={`transition-colors ${post.isLiked ? 'fill-red-500 text-red-500' : 'text-gray-500 group-hover:text-red-400'}`} 
                                    />
                                    <span className={post.isLiked ? 'text-red-500' : 'text-gray-500'}>{post.likes}</span>
                                </button>
                                <button className="flex items-center gap-1 text-sm text-gray-500">
                                    <MessageCircle size={22} />
                                    <span>{post.comments.length}</span>
                                </button>
                            </div>

                            {/* Caption */}
                            <div className="mb-3">
                                <p className="text-sm text-gray-800">
                                    <span className="font-bold mr-2">{post.user.name}</span>
                                    {post.caption}
                                </p>
                            </div>

                            {/* Comments */}
                            <div className="bg-gray-50 rounded-xl p-3">
                                {post.comments.length > 0 && (
                                    <div className="space-y-2 mb-3">
                                        {post.comments.map(comment => (
                                            <div key={comment.id} className="flex gap-2 text-xs">
                                                <span className="font-bold text-gray-700">{comment.userName}</span>
                                                <span className="text-gray-600">{comment.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="text" 
                                        placeholder="Add a comment..."
                                        className="flex-1 bg-white border border-gray-200 rounded-full px-3 py-1.5 text-xs outline-none focus:border-teal-400"
                                        value={commentText[post.id] || ''}
                                        onChange={(e) => setCommentText({...commentText, [post.id]: e.target.value})}
                                        onKeyDown={(e) => e.key === 'Enter' && handleComment(post.id)}
                                    />
                                    <button 
                                        onClick={() => handleComment(post.id)}
                                        className="text-teal-600 font-medium text-xs"
                                    >
                                        Post
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
