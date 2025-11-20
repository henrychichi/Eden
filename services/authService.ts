
import { User } from '../types';
import { MOCK_USERS } from './mockData';

// Mock Auth Service

// Simulate a delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const login = async (email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> => {
    await delay(800); // Fake network latency

    if (!email || !password) {
        return { success: false, error: "Please fill in all fields." };
    }

    // Demo backdoor: login with "test@test.com" / "password" gets a default user
    if (email === "test@test.com" && password === "password") {
        return { 
            success: true, 
            user: {
                id: '1',
                name: 'Alex',
                age: 22,
                gender: 'Male',
                location: 'Berrien Springs, MI',
                church: 'Pioneer Memorial',
                bio: 'Loves coding and hiking.',
                interests: ['Coding', 'Hiking', 'Music'],
                photos: ['https://picsum.photos/400/400'],
                verified: true
            }
        };
    }
    
    // Allow any other login to simulate "user not found" or success based on simple logic
    // For this demo, we'll say any email containing "fail" fails.
    if (email.includes('fail')) {
        return { success: false, error: "Invalid credentials." };
    }

    // If we "login" as one of the mock users (just for demo fun)
    const mockMatch = MOCK_USERS.find(u => u.name.toLowerCase() === email.split('@')[0].toLowerCase());
    if (mockMatch) {
        return { success: true, user: mockMatch };
    }

    // Default success for demo (new session)
    return { 
        success: true, 
        user: {
            id: '1', // In a real app, this would come from DB
            name: 'User',
            age: 20,
            gender: 'Male',
            location: 'Unknown',
            church: '',
            bio: '',
            interests: [],
            photos: [],
            verified: false
        }
    };
};

export const signup = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    await delay(800);
    
    if (!email || !password) {
        return { success: false, error: "Please fill in all fields." };
    }

    if (password.length < 6) {
        return { success: false, error: "Password must be at least 6 characters." };
    }

    return { success: true };
};

export const logout = async (): Promise<void> => {
    await delay(500);
    // Clear local tokens here if implemented
};
