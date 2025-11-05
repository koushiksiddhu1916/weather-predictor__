import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { searchHistory } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session || !session.user) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();

    // Security check: reject if userId provided in body
    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    const { location, days } = body;

    // Validate required fields
    if (!location || typeof location !== 'string' || location.trim() === '') {
      return NextResponse.json({ 
        error: 'Location is required and must be a non-empty string',
        code: 'INVALID_LOCATION' 
      }, { status: 400 });
    }

    if (!days || typeof days !== 'number' || !Number.isInteger(days) || days <= 0) {
      return NextResponse.json({ 
        error: 'Days is required and must be a positive integer',
        code: 'INVALID_DAYS' 
      }, { status: 400 });
    }

    // Insert search history record
    const newSearchHistory = await db.insert(searchHistory)
      .values({
        userId,
        location: location.trim(),
        days,
        searchedAt: new Date()
      })
      .returning();

    return NextResponse.json(newSearchHistory[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session || !session.user) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    const userId = session.user.id;

    // Query search history for authenticated user, ordered by most recent first
    const results = await db.select()
      .from(searchHistory)
      .where(eq(searchHistory.userId, userId))
      .orderBy(desc(searchHistory.searchedAt));

    return NextResponse.json(results, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}