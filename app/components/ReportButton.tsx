'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Flag, AlertTriangle, Shield, UserX } from 'lucide-react';
import GlassButton from '@/app/components/ui/GlassButton';
import GlassCard from '@/app/components/ui/GlassCard';
import { type UserReportCreate } from '@/app/lib/contracts';

interface ReportButtonProps {
  contentType: 'user' | 'comment' | 'party' | 'party_message' | 'activity';
  contentId?: string;
  reportedUserId?: string;
  className?: string;
}

export default function ReportButton({
  contentType,
  contentId,
  reportedUserId,
  className = '',
}: ReportButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<Partial<UserReportCreate>>({
    contentType,
    contentId,
    reportedUserId,
    reason: 'spam',
    description: '',
  });

  const reasons = [
    { value: 'spam', label: 'Spam', icon: AlertTriangle, color: 'text-yellow-400' },
    { value: 'harassment', label: 'Harassment', icon: UserX, color: 'text-red-400' },
    {
      value: 'inappropriate',
      label: 'Inappropriate Content',
      icon: Shield,
      color: 'text-orange-400',
    },
    { value: 'fake', label: 'Fake Account', icon: UserX, color: 'text-purple-400' },
    { value: 'underage', label: 'Underage User', icon: AlertTriangle, color: 'text-pink-400' },
    { value: 'other', label: 'Other', icon: Flag, color: 'text-gray-400' },
  ];

  const submitReport = async () => {
    if (!reportData.reason) return;

    try {
      setLoading(true);
      const response = await fetch('/api/v1/moderation/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });

      const result = await response.json();

      if (result.ok) {
        setShowModal(false);
        setReportData({
          contentType,
          contentId,
          reportedUserId,
          reason: 'spam',
          description: '',
        });
        // You could show a success toast here
      } else {
        console.error('Failed to submit report:', result.error);
        // You could show an error toast here
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      // You could show an error toast here
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <GlassButton
        variant="secondary"
        size="sm"
        onClick={() => setShowModal(true)}
        className={`flex items-center gap-2 ${className}`}
      >
        <Flag className="w-4 h-4" />
        Report
      </GlassButton>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md"
          >
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Report Content</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Reason for reporting
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {reasons.map((reason) => {
                      const Icon = reason.icon;
                      return (
                        <button
                          key={reason.value}
                          onClick={() =>
                            setReportData((prev) => ({ ...prev, reason: reason.value as any }))
                          }
                          className={`p-3 rounded-lg border transition-colors ${
                            reportData.reason === reason.value
                              ? 'border-pink-500 bg-pink-500/10'
                              : 'border-white/20 bg-white/5 hover:bg-white/10'
                          }`}
                        >
                          <Icon className={`w-5 h-5 mx-auto mb-1 ${reason.color}`} />
                          <span className="text-xs text-white/80">{reason.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Additional details (optional)
                  </label>
                  <textarea
                    value={reportData.description}
                    onChange={(e) =>
                      setReportData((prev) => ({ ...prev, description: e.target.value }))
                    }
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="Provide additional context..."
                    rows={3}
                    maxLength={1000}
                  />
                  <div className="text-xs text-white/50 mt-1">
                    {reportData.description?.length || 0}/1000 characters
                  </div>
                </div>

                <div className="flex gap-3">
                  <GlassButton
                    onClick={submitReport}
                    disabled={!reportData.reason || loading}
                    className="flex-1"
                  >
                    {loading ? 'Submitting...' : 'Submit Report'}
                  </GlassButton>
                  <GlassButton
                    variant="secondary"
                    onClick={() => setShowModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </GlassButton>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      )}
    </>
  );
}
