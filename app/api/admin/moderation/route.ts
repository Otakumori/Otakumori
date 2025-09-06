// DEPRECATED: This component is a duplicate. Use app\api\webhooks\stripe\route.ts instead.
import { type NextRequest, NextResponse } from 'next/server';

// Mock data for moderation
const mockFlaggedContent = [
  {
    id: '1',
    type: 'echo',
    content: 'This is a flagged echo message...',
    authorId: 'user123',
    authorName: 'SakuraFan',
    reason: 'inappropriate_content',
    status: 'pending',
    reportedBy: ['user456', 'user789'],
    createdAt: '2024-01-21T14:30:00Z',
    severity: 'medium',
  },
  {
    id: '2',
    type: 'comment',
    content: 'Flagged comment in community...',
    authorId: 'user789',
    authorName: 'OtakuMaster',
    reason: 'spam',
    status: 'reviewed',
    reportedBy: ['user123'],
    createdAt: '2024-01-20T16:45:00Z',
    severity: 'low',
    moderatorAction: 'warned',
  },
  {
    id: '3',
    type: 'profile',
    content: 'Inappropriate profile content...',
    authorId: 'user456',
    authorName: 'AnimeLover',
    reason: 'nsfw_content',
    status: 'pending',
    reportedBy: ['user123', 'user789', 'user101'],
    createdAt: '2024-01-19T09:15:00Z',
    severity: 'high',
  },
];

const mockUserReports = [
  {
    id: '1',
    reporterId: 'user123',
    reporterName: 'SakuraFan',
    reportedUserId: 'user456',
    reportedUserName: 'AnimeLover',
    reason: 'harassment',
    description: 'User has been sending inappropriate messages',
    status: 'investigating',
    createdAt: '2024-01-21T10:00:00Z',
    evidence: ['message1', 'message2'],
  },
  {
    id: '2',
    reporterId: 'user789',
    reporterName: 'OtakuMaster',
    reportedUserId: 'user101',
    reportedUserName: 'WeebKing',
    reason: 'spam',
    description: 'User posting promotional content repeatedly',
    status: 'resolved',
    createdAt: '2024-01-20T15:30:00Z',
    moderatorAction: 'temporary_ban',
    evidence: ['post1', 'post2', 'post3'],
  },
];

const mockModerationActions = [
  {
    id: '1',
    moderatorId: 'admin1',
    moderatorName: 'AdminUser',
    targetType: 'user',
    targetId: 'user456',
    targetName: 'AnimeLover',
    action: 'warn',
    reason: 'Inappropriate content',
    createdAt: '2024-01-21T11:00:00Z',
    duration: null,
  },
  {
    id: '2',
    moderatorId: 'admin2',
    moderatorName: 'ModUser',
    targetType: 'content',
    targetId: 'echo1',
    targetName: 'Echo Message',
    action: 'delete',
    reason: 'Violates community guidelines',
    createdAt: '2024-01-20T14:00:00Z',
    duration: null,
  },
  {
    id: '3',
    moderatorId: 'admin1',
    moderatorName: 'AdminUser',
    targetType: 'user',
    targetId: 'user101',
    targetName: 'WeebKing',
    action: 'temporary_ban',
    reason: 'Repeated spam violations',
    createdAt: '2024-01-19T16:00:00Z',
    duration: '7 days',
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'flagged_content':
        return NextResponse.json({
          success: true,
          data: mockFlaggedContent,
          total: mockFlaggedContent.length,
        });

      case 'user_reports':
        return NextResponse.json({
          success: true,
          data: mockUserReports,
          total: mockUserReports.length,
        });

      case 'moderation_actions':
        return NextResponse.json({
          success: true,
          data: mockModerationActions,
          total: mockModerationActions.length,
        });

      case 'stats':
        const pendingContent = mockFlaggedContent.filter((c) => c.status === 'pending').length;
        const pendingReports = mockUserReports.filter((r) => r.status === 'investigating').length;
        const highSeverity = mockFlaggedContent.filter((c) => c.severity === 'high').length;

        return NextResponse.json({
          success: true,
          data: {
            pendingContent,
            pendingReports,
            highSeverity,
            totalActions: mockModerationActions.length,
          },
        });

      default:
        return NextResponse.json({
          success: true,
          data: {
            flaggedContent: mockFlaggedContent.length,
            userReports: mockUserReports.length,
            moderationActions: mockModerationActions.length,
          },
        });
    }
  } catch (error) {
    console.error('Moderation API Error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'review_content':
        // In real implementation, update content status in database
        return NextResponse.json({
          success: true,
          message: 'Content reviewed successfully',
        });

      case 'take_action':
        const newAction = {
          id: Date.now().toString(),
          ...data,
          createdAt: new Date().toISOString(),
        };
        // In real implementation, save action to database
        return NextResponse.json({
          success: true,
          data: newAction,
          message: 'Action taken successfully',
        });

      case 'resolve_report':
        // In real implementation, update report status in database
        return NextResponse.json({
          success: true,
          message: 'Report resolved successfully',
        });

      case 'bulk_action':
        // In real implementation, perform bulk moderation actions
        return NextResponse.json({
          success: true,
          message: `Bulk action completed for ${data.items.length} items`,
        });

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Moderation API Error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
