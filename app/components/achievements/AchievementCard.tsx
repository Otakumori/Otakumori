import { Achievement } from './AchievementProvider';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface AchievementCardProps {
  achievement: Achievement;
}

export default function AchievementCard({ achievement }: AchievementCardProps) {
  const progress = (achievement.progress / achievement.total) * 100;

  return (
    <Card className={`relative overflow-hidden ${
      achievement.unlocked 
        ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 border-pink-500/50' 
        : 'bg-white/10 border-pink-500/30'
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="text-3xl">{achievement.icon}</div>
          <div className="flex-1">
            <h3 className="font-semibold text-white mb-1">{achievement.title}</h3>
            <p className="text-sm text-pink-200 mb-2">{achievement.description}</p>
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between text-xs text-pink-200">
                <span>Progress: {achievement.progress}/{achievement.total}</span>
                {achievement.reward && (
                  <span className="font-medium">
                    Reward: {achievement.reward.type === 'points' && '+'}
                    {achievement.reward.value}
                    {achievement.reward.type === 'discount' && '%'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      {achievement.unlocked && (
        <div className="absolute top-0 right-0 w-16 h-16 bg-pink-500/20 transform rotate-45 translate-x-8 -translate-y-8">
          <div className="absolute top-2 right-2 text-pink-500">✨</div>
        </div>
      )}
    </Card>
  );
} 