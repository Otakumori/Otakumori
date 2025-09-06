import GlassPanel from '../GlassPanel';
import { t } from '../../lib/microcopy';

type PetalTransaction = {
  id: string;
  source: string;
  amount: number;
  timestamp: string;
  description?: string;
};

type DailyData = {
  remaining: number;
  total: number;
};

type PetalsData = {
  history: PetalTransaction[];
  daily: DailyData;
};

type PetalsDashboardProps = {
  petalsData: PetalsData;
};

export default function PetalsDashboard({ petalsData }: PetalsDashboardProps) {
  const totalPetals = petalsData.history.reduce((sum, transaction) => sum + transaction.amount, 0);
  const dailyProgress = ((petalsData.daily.total - petalsData.daily.remaining) / petalsData.daily.total) * 100;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Total Petals */}
      <GlassPanel className="p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Total Petals</h2>
        <div className="text-3xl font-bold text-fuchsia-300 mb-2">
          {totalPetals.toLocaleString()}
        </div>
        <p className="text-sm text-zinc-400">
          Collected from various sources
        </p>
      </GlassPanel>

      {/* Daily Progress */}
      <GlassPanel className="p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Daily Collection</h2>
        <div className="mb-2">
          <div className="flex justify-between text-sm text-zinc-300 mb-1">
            <span>Progress</span>
            <span>{petalsData.daily.total - petalsData.daily.remaining} / {petalsData.daily.total}</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div 
              className="bg-fuchsia-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${dailyProgress}%` }}
            />
          </div>
        </div>
        <p className="text-sm text-zinc-400">
          {petalsData.daily.remaining > 0 
            ? `${petalsData.daily.remaining} more petals available today`
            : 'Daily limit reached'
          }
        </p>
      </GlassPanel>

      {/* Recent Activity */}
      <GlassPanel className="p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
        <div className="space-y-2">
          {petalsData.history.slice(0, 3).map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between text-sm">
              <div>
                <span className="text-zinc-300">{transaction.description || transaction.source}</span>
                <div className="text-xs text-zinc-500">
                  {new Date(transaction.timestamp).toLocaleDateString()}
                </div>
              </div>
              <span className={`font-semibold ${transaction.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {transaction.amount > 0 ? '+' : ''}{transaction.amount}
              </span>
            </div>
          ))}
        </div>
      </GlassPanel>

      {/* Transaction History */}
      <div className="lg:col-span-3">
        <GlassPanel className="p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Transaction History</h2>
          {petalsData.history.length > 0 ? (
            <div className="space-y-3">
              {petalsData.history.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-white/10 last:border-b-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${transaction.amount > 0 ? 'bg-green-400' : 'bg-red-400'}`} />
                    <div>
                      <div className="text-white">{transaction.description || transaction.source}</div>
                      <div className="text-sm text-zinc-400">
                        {new Date(transaction.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className={`font-semibold ${transaction.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-zinc-400">No petal transactions yet</p>
              <p className="text-sm text-zinc-500 mt-1">
                Start collecting petals from the cherry tree on the homepage!
              </p>
            </div>
          )}
        </GlassPanel>
      </div>
    </div>
  );
}
