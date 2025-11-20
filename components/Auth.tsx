
import React, { useState } from 'react';
import { login, signup } from '../services/authService';
import { User } from '../types';
import { ArrowRight, Loader, Mail, Lock } from 'lucide-react';

interface AuthProps {
    onLoginSuccess: (user: User) => void;
    onSignupSuccess: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onLoginSuccess, onSignupSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (isLogin) {
                const result = await login(email, password);
                if (result.success && result.user) {
                    onLoginSuccess(result.user);
                } else {
                    setError(result.error || "Login failed");
                }
            } else {
                const result = await signup(email, password);
                if (result.success) {
                    onSignupSuccess();
                } else {
                    setError(result.error || "Signup failed");
                }
            }
        } catch (err) {
            setError("An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-teal-50 flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden p-8">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-teal-100 rounded-2xl mx-auto flex items-center justify-center mb-4">
                        <span className="text-3xl">🌿</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Eden</h1>
                    <p className="text-gray-500 text-sm">Connect with SDA youth nearby.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-500 text-xs p-3 rounded-lg text-center border border-red-100">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition-all text-sm"
                                placeholder="hello@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition-all text-sm"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-4 rounded-xl shadow-lg shadow-teal-200 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <Loader size={20} className="animate-spin" />
                        ) : (
                            <>
                                {isLogin ? "Sign In" : "Create Account"}
                                <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-500">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button 
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError(null);
                            }}
                            className="text-teal-600 font-bold hover:underline"
                        >
                            {isLogin ? "Sign Up" : "Sign In"}
                        </button>
                    </p>
                </div>
            </div>
            
            <div className="mt-8 text-center text-xs text-gray-400">
                <p>By continuing, you agree to our Terms & Privacy Policy.</p>
            </div>
        </div>
    );
};
