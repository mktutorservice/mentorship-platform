import { NextResponse } from 'next/server';
import { AccessToken } from 'livekit-server-sdk';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const room = searchParams.get('room');
    const username = searchParams.get('username');

    if (!room || !username) {
      return NextResponse.json(
        { error: 'Missing "room" or "username" query parameters' },
        { status: 400 }
      );
    }

    // Clean env variables
    const apiKey = process.env.LIVEKIT_API_KEY?.trim();
    const apiSecret = process.env.LIVEKIT_API_SECRET?.trim();
    const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL?.trim();

    if (!apiKey || !apiSecret || !wsUrl) {
      console.error('LIVEKIT CONFIG ERROR:', { apiKey: !!apiKey, apiSecret: !!apiSecret, wsUrl: !!wsUrl });
      return NextResponse.json(
        { error: 'Server misconfigured: LiveKit credentials missing' },
        { status: 500 }
      );
    }

    const at = new AccessToken(apiKey, apiSecret, {
      identity: username,
      ttl: '10m',
    });

    at.addGrant({
      room,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
    });

    // Handle both sync and async return types for SDK compatibility
    const token = await at.toJwt();

    return NextResponse.json({ token });
  } catch (err: any) {
    console.error('CRITICAL TOKEN GENERATION ERROR:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to generate token' },
      { status: 500 }
    );
  }
}