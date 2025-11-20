
import React, { useState, useCallback, useEffect } from 'react';
import { AppView, User, Match } from './types';
import { Onboarding } from './components/Onboarding';
import { Navigation } from './components/Navigation';
import { Matching } from './components/Matching';
import { ChatList } from './components/ChatList';
import { ChatRoom } from './components/ChatRoom';
import { VideoCall } from './components/VideoCall';
import { Profile } from './components/Profile';
import { SocialFeed } from './components/SocialFeed';
import { Challenges } from './components/Challenges';
import { Auth } from './components/Auth';
import { generateIceBreaker } from './services/geminiService';
import { requestNotificationPermission, sendNotification } from './services/notificationService';
import { logout } from './services/authService';

function App() {
    const [view, setView] = useState<AppView>(AppView.AUTH);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [matches, setMatches] = useState<Match[]>([]);
    const [activeMatch, setActiveMatch] = useState<Match | null>(null);

    // Auth Handlers
    const handleLoginSuccess = async (user: User) => {
        setCurrentUser(user);
        await requestNotificationPermission();
        
        // If user data seems incomplete (e.g. new signup flow where user is placeholder), go to onboarding
        // For this demo, checking if name is "User" as a flag for new user
        if (user.name === 'User') {
            setView(AppView.ONBOARDING);
        } else {
            setView(AppView.MATCHING);
        }
    };

    const handleSignupSuccess = () => {
        // After successful signup (account created), move to onboarding
        setView(AppView.ONBOARDING);
    };

    const handleLogout = async () => {
        await logout();
        setCurrentUser(null);
        setView(AppView.AUTH);
        setMatches([]); // Clear session data
    };

    const handleOnboardingComplete = async (user: User) => {
        await requestNotificationPermission();
        setCurrentUser(user);
        setView(AppView.MATCHING);
    };

    const handleMatch = async (user: User) => {
        // Simulate a match happening instantly for demo purposes
        const iceBreaker = await generateIceBreaker(user.interests);
        const newMatch: Match = {
            id: Date.now().toString(),
            user: user,
            timestamp: Date.now(),
            lastMessage: iceBreaker,
            unreadCount: 1
        };
        
        setMatches(prev => [newMatch, ...prev]);
        
        sendNotification("It's a Match!", {
            body: `You matched with ${user.name}!`,
            icon: user.photos[0]
        });
    };

    const handleSelectMatch = (match: Match) => {
        setActiveMatch(match);
        // Reset unread count
        setMatches(prev => prev.map(m => m.id === match.id ? { ...m, unreadCount: 0 } : m));
        setView(AppView.CHAT_ROOM);
    };

    // Simulate background messages/notifications
    useEffect(() => {
        if (!currentUser || matches.length === 0) return;

        const interval = setInterval(() => {
            // 30% chance to get a message if we have matches
            if (Math.random() > 0.7) {
                const randomMatchIndex = Math.floor(Math.random() * matches.length);
                const matchToUpdate = matches[randomMatchIndex];
                
                // Don't spam if we are currently chatting with them (activeMatch)
                // unless app is hidden
                const isActiveChat = activeMatch?.id === matchToUpdate.id && view === AppView.CHAT_ROOM;
                
                if (!isActiveChat || document.visibilityState === 'hidden') {
                    const phrases = ["Thinking of you!", "How's your day going?", "Did you see that post?", "Happy Sabbath!"];
                    const newText = phrases[Math.floor(Math.random() * phrases.length)];
                    
                    setMatches(prev => prev.map(m => {
                        if (m.id === matchToUpdate.id) {
                            return {
                                ...m,
                                lastMessage: newText,
                                unreadCount: m.unreadCount + 1,
                                timestamp: Date.now()
                            };
                        }
                        return m;
                    }));

                    sendNotification(`Message from ${matchToUpdate.user.name}`, {
                        body: newText,
                        icon: matchToUpdate.user.photos[0]
                    });
                }
            }
        }, 15000); // Check every 15s

        return () => clearInterval(interval);
    }, [currentUser, matches, activeMatch, view]);

    const renderContent = useCallback(() => {
        switch (view) {
            case AppView.AUTH:
                return (
                    <Auth 
                        onLoginSuccess={handleLoginSuccess} 
                        onSignupSuccess={handleSignupSuccess} 
                    />
                );
            case AppView.ONBOARDING:
                return <Onboarding onComplete={handleOnboardingComplete} />;
            case AppView.MATCHING:
                return (
                    <div className="h-full pb-20 pt-4">
                        <Matching onMatch={handleMatch} />
                    </div>
                );
            case AppView.FEED:
                 if (!currentUser) return null;
                return (
                    <SocialFeed currentUser={currentUser} />
                );
            case AppView.CHALLENGES:
                if (!currentUser) return null;
                return (
                    <Challenges currentUser={currentUser} />
                );
            case AppView.CHAT_LIST:
                return (
                    <div className="h-full pb-20">
                        <ChatList matches={matches} onSelectMatch={handleSelectMatch} />
                    </div>
                );
            case AppView.CHAT_ROOM:
                if (!activeMatch) return null;
                return (
                    <ChatRoom 
                        match={activeMatch} 
                        onBack={() => setView(AppView.CHAT_LIST)}
                        onStartVideo={() => setView(AppView.VIDEO_CALL)}
                    />
                );
            case AppView.VIDEO_CALL:
                if (!activeMatch) return null;
                return (
                    <VideoCall 
                        match={activeMatch} 
                        onEndCall={() => setView(AppView.CHAT_ROOM)} 
                    />
                );
            case AppView.PROFILE:
                return <Profile user={currentUser} onLogout={handleLogout} />;
            default:
                return null;
        }
    }, [view, currentUser, matches, activeMatch]);

    // Don't show nav on Auth, Onboarding or Video Call
    const showNav = view !== AppView.AUTH && view !== AppView.ONBOARDING && view !== AppView.VIDEO_CALL && view !== AppView.CHAT_ROOM;

    return (
        <div className="bg-gray-50 min-h-screen flex justify-center overflow-hidden">
            <div className="w-full max-w-md bg-white shadow-2xl h-screen relative flex flex-col overflow-hidden">
                {renderContent()}
                
                {showNav && (
                    <Navigation 
                        currentView={view} 
                        setView={setView} 
                        unreadCount={matches.reduce((acc, m) => acc + m.unreadCount, 0)} 
                    />
                )}
            </div>
        </div>
    );
}

export default App;
