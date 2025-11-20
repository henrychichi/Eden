
import { User, Post, Challenge } from '../types';

export const INTERESTS = [
    "Bible Study", "Hiking", "Music", "Volunteering", "Potlucks", 
    "Sabbath Walks", "Photography", "Cooking", "Travel", "Fitness", "Reading"
];

export const MOCK_USERS: User[] = [
    {
        id: '2',
        name: 'Sarah',
        age: 23,
        gender: 'Female',
        location: 'Loma Linda, CA',
        church: 'Loma Linda University Church',
        bio: 'Nursing student who loves nature walks and Sabbath potlucks. Looking for a hiking buddy!',
        interests: ['Hiking', 'Nursing', 'Sabbath Walks', 'Cooking'],
        photos: [
            'https://picsum.photos/400/600?random=1',
            'https://picsum.photos/400/600?random=2'
        ],
        verified: true
    },
    {
        id: '3',
        name: 'David',
        age: 25,
        gender: 'Male',
        location: 'Berrien Springs, MI',
        church: 'Pioneer Memorial Church',
        bio: 'Musician and youth leader. I play guitar and love volunteering at the local shelter.',
        interests: ['Music', 'Volunteering', 'Bible Study'],
        photos: [
            'https://picsum.photos/400/600?random=3',
            'https://picsum.photos/400/600?random=4'
        ],
        verified: true
    },
    {
        id: '4',
        name: 'Hannah',
        age: 22,
        gender: 'Female',
        location: 'Collegedale, TN',
        church: 'Collegedale Church',
        bio: 'Coffee lover and graphic designer. Let’s explore new cafes!',
        interests: ['Photography', 'Travel', 'Coffee'],
        photos: [
            'https://picsum.photos/400/600?random=5'
        ],
        verified: false
    },
    {
        id: '5',
        name: 'James',
        age: 26,
        gender: 'Male',
        location: 'Sydney, AU',
        church: 'Wahroonga SDA Church',
        bio: 'Adventurous spirit. Love surfing and reading theology.',
        interests: ['Fitness', 'Reading', 'Travel'],
        photos: [
            'https://picsum.photos/400/600?random=6'
        ],
        verified: true
    }
];

export const MOCK_CHALLENGES: Challenge[] = [
    {
        id: 'c1',
        title: 'Best Sabbath Sunset',
        description: 'Capture the beauty of the Sabbath closing in your area. Best photo wins!',
        type: 'Photo',
        endDate: Date.now() + 86400000 * 3, // 3 days left
        participants: 142,
        imageUrl: 'https://picsum.photos/800/400?grayscale'
    },
    {
        id: 'c2',
        title: 'Favorite Hymn Lip Sync',
        description: 'Pick your favorite hymn and give us your best joyful performance!',
        type: 'Video',
        endDate: Date.now() + 86400000 * 6,
        participants: 89,
        imageUrl: 'https://picsum.photos/800/400?blur=2'
    }
];

export const MOCK_POSTS: Post[] = [
    {
        id: '101',
        userId: '2',
        user: MOCK_USERS[0],
        imageUrl: 'https://picsum.photos/600/400?random=10',
        caption: 'Beautiful Sabbath hike at the trails today! 🌿 #Nature #Sabbath',
        likes: 14,
        isLiked: false,
        comments: [
            { id: 'c1', userId: '3', userName: 'David', text: 'Looks amazing!', timestamp: Date.now() - 10000 }
        ],
        timestamp: Date.now() - 3600000
    },
    {
        id: '102',
        userId: '3',
        user: MOCK_USERS[1],
        imageUrl: 'https://picsum.photos/600/400?random=11',
        caption: 'Leading praise and worship this morning. Blessed to serve. 🎸',
        likes: 28,
        isLiked: true,
        comments: [],
        timestamp: Date.now() - 7200000
    },
    {
        id: '103',
        userId: '4',
        user: MOCK_USERS[2],
        imageUrl: 'https://picsum.photos/600/400?random=12',
        caption: 'My sunset view for the challenge! 🌅',
        likes: 45,
        isLiked: false,
        comments: [],
        timestamp: Date.now() - 100000,
        challengeId: 'c1' // Linked to sunset challenge
    },
     {
        id: '104',
        userId: '5',
        user: MOCK_USERS[3],
        imageUrl: 'https://picsum.photos/600/400?random=13',
        caption: 'Golden hour bliss.',
        likes: 32,
        isLiked: true,
        comments: [],
        timestamp: Date.now() - 200000,
        challengeId: 'c1' // Linked to sunset challenge
    }
];
