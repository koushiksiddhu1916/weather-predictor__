import { db } from '@/db';
import { user } from '@/db/schema';

async function main() {
    const sampleUsers = [
        {
            id: 'user_1',
            name: 'John Doe',
            email: 'john.doe@example.com',
            emailVerified: true,
            image: null,
            createdAt: new Date('2024-01-15T10:00:00Z'),
            updatedAt: new Date('2024-01-15T10:00:00Z'),
        },
        {
            id: 'user_2',
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
            emailVerified: true,
            image: null,
            createdAt: new Date('2024-01-20T14:30:00Z'),
            updatedAt: new Date('2024-01-20T14:30:00Z'),
        },
        {
            id: 'user_3',
            name: 'Mike Johnson',
            email: 'mike.johnson@example.com',
            emailVerified: true,
            image: null,
            createdAt: new Date('2024-02-01T09:15:00Z'),
            updatedAt: new Date('2024-02-01T09:15:00Z'),
        }
    ];

    await db.insert(user).values(sampleUsers);
    
    console.log('✅ User seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});