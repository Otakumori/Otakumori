'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Flag, Shield, UserX, X } from 'lucide-react';
import GlassButton from '@/app/components/ui/GlassButton';
import GlassCard from '@/app/components/ui/GlassCard';
import { type ApiEnvelope, type UserReport, type UserReportCreate } from '@/app/lib/contracts';
import { cn } from '@/lib/utils';

const REPORT_REASONS: Array<{
  value: UserReportCreate['reason'];
  label: string;
  icon: typeof AlertTriangle;
  color: string;
}> = [
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

async function getLogger() {
  const { logger } = await import('@/app/lib/logger');
  return logger;
}

interface ReportButtonProps {
  contentType: UserReportCreate['contentType'];
  contentId?: string;
  reportedUserId?: string;
  className?: string;
}

const createInitialReportData = (
  contentType: UserReportCreate['contentType'],
  contentId?: string,
  reportedUserId?: string,
): UserReportCreate => ({
  contentType,
  reason: 'spam',
  description: '',
  ...(contentId ? { contentId } : {}),
  ...(reportedUserId ? { reportedUserId } : {}),
});

export default function ReportButton({
  contentType,
  contentId,
  reportedUserId,
  className,
}: ReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportData, setReportData] = useState<UserReportCreate>(
    createInitialReportData(contentType, contentId, reportedUserId),
  );

  useEffect(() => {
    setReportData(createInitialReportData(contentType, contentId, reportedUserId));
  }, [contentId, contentType, reportedUserId]);

  const handleClose = () => {
    setIsOpen(false);
    setReportData(createInitialReportData(contentType, contentId, reportedUserId));
  };

  const submitReport = async () => {
    if (!reportData.reason) {
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch('/api/v1/moderation/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData),
      });

      if (!response.ok) {
        throw new Error(`Report submission failed (${response.status})`);
      }

      const payload: ApiEnvelope<UserReport> = await response.json();
      if (!payload.ok) {
        throw new Error(payload.error);
      }

      handleClose();
    } catch (error) {
      const logger = await getLogger();
      logger.error('Failed to submit report', {
        extra: { error: error instanceof Error ? error.message : String(error) },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <GlassButton
        variant="secondary"
        size="sm"
        onClick={() => setIsOpen(true)}
        className={className}
      >
        <Flag className="h-4 w-4" aria-hidden="true" />
        Report
      </GlassButton>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md"
            >
              <GlassCard className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Report Content</h3>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="rounded-full p-1 text-white/60 transition-colors hover:text-white"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="mb-2 block text-sm font-medium text-white/80">
                      Reason for reporting
                    </p>
                    <div
                      className="grid grid-cols-2 gap-2"
                      role="radiogroup"
                      aria-label="Report reason"
                    >
                      {REPORT_REASONS.map(({ value, label, icon: Icon, color }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() =>
                            setReportData((prev) => ({
                              ...prev,
                              reason: value,
                            }))
                          }
                          className={cn(
                            'rounded-lg border p-3 transition-colors',
                            reportData.reason === value
                              ? 'border-pink-500 bg-pink-500/10'
                              : 'border-white/20 bg-white/5 hover:bg-white/10',
                          )}
                          role="radio"
                          aria-checked={reportData.reason === value}
                        >
                          <Icon className={cn('mx-auto mb-1 h-5 w-5', color)} aria-hidden="true" />
                          <span className="text-xs text-white/80">{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label
                      className="mb-2 block text-sm font-medium text-white/80"
                      htmlFor="report-details"
                    >
                      Additional details (optional)
                    </label>
                    <textarea
                      id="report-details"
                      value={reportData.description ?? ''}
                      onChange={(event) =>
                        setReportData((prev) => ({
                          ...prev,
                          description: event.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="Provide additional context"
                      rows={3}
                      maxLength={1000}
                    />
                    <div className="mt-1 text-xs text-white/50">
                      {reportData.description?.length ?? 0}/1000 characters
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <GlassButton onClick={submitReport} disabled={isSubmitting} className="flex-1">
                      {isSubmitting ? 'Submitting...' : 'Submit Report'}
                    </GlassButton>
                    <GlassButton variant="secondary" onClick={handleClose} className="flex-1">
                      Cancel
                    </GlassButton>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
