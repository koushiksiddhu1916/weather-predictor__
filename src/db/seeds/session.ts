import { db } from '@/db';
import { session } from '@/db/schema';

async function main() {
    const now = new Date();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const sampleSessions = [
        {
            id: 'session_1',
            expiresAt: expiresAt,
            token: 'test-token-123',
            createdAt: now,
            updatedAt: now,
            ipAddress: '192.168.1.1',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            userId: 'user_1',
        },
        {
            id: 'session_2',
            expiresAt: expiresAt,
            token: 'test-token-456',
            createdAt: now,
            updatedAt: now,
            ipAddress: '10.0.0.1',
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            userId: 'user_2',
        },
        {
            id: 'session_3',
            expiresAt: expiresAt,
            token: 'test-token-789',
            createdAt: now,
            updatedAt: now,
            ipAddress: '172.16.0.1',
            userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            userId: 'user_3',
        },
    ];

    await db.insert(session).values(sampleSessions);
    
    console.log('✅ Session seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});