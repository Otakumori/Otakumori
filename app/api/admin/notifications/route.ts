/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
import { NextRequest, NextResponse } from 'next/server';
// import { redis } from '../../../lib/redis';
// TODO: Replace with HTTP-based Redis client if needed

export async function POST(request: NextRequest) {
  try {
    // Verify API key
    const apiKey = request.headers.get('x-api-key');
    if (apiKey !== process.env.API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, type = 'info', duration = 5000 } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Invalid message' }, { status: 400 });
    }

    // Create notification object
    const notification = {
      id: `notification-${Date.now()}`,
      message,
      type, // 'info', 'success', 'warning', 'error'
      duration,
      timestamp: new Date().toISOString(),
      expiresAt: new Date(Date.now() + duration).toISOString(),
    };

    // Store notification in Redis
    // TODO: Integrate HTTP-based Redis client to store notification

    // Set expiration
    // TODO: Integrate HTTP-based Redis client to set expiration on notifications

    // Store in notification history
    // TODO: Integrate HTTP-based Redis client to store notification history

    // Log notification
    console.log(`Site notification sent: ${message}`);

    return NextResponse.json({
      success: true,
      notificationId: notification.id,
      message: 'Notification sent successfully',
      timestamp: notification.timestamp,
    });
  } catch (error) {
    console.error('Notification error:', error);
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify API key
    const apiKey = request.headers.get('x-api-key');
    if (apiKey !== process.env.API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get notification history
    // TODO: Integrate HTTP-based Redis client to get notification history
    const notifications: any[] = [];

    return NextResponse.json({
      notifications,
      total: notifications.length,
    });
  } catch (error) {
    console.error('Notification history error:', error);
    return NextResponse.json({ error: 'Failed to retrieve notifications' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify API key
    const apiKey = request.headers.get('x-api-key');
    if (apiKey !== process.env.API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('id');

    if (notificationId) {
      // TODO: Integrate HTTP-based Redis client to delete specific notification
    } else {
      // TODO: Integrate HTTP-based Redis client to clear all active notifications
    }

    return NextResponse.json({
      success: true,
      message: notificationId ? 'Notification deleted' : 'All notifications cleared',
    });
  } catch (error) {
    console.error('Notification delete error:', error);
    return NextResponse.json({ error: 'Failed to delete notification' }, { status: 500 });
  }
}
