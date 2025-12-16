'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

type Vote = {
  ID: number;
  problem_id: number;
  user_id: number;
  point: number;
};

type UserVoteStats = {
  user_id: number;
  total_votes: number;
  average_score: number;
  min_score: number;
  max_score: number;
  votes: Vote[];
};

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const [stats, setStats] = useState<UserVoteStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // 管理者認可チェック
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
      return;
    }
    const user = JSON.parse(storedUser);
    if (user.role !== 'admin') {
      alert('管理者のみアクセス可能です');
      router.push('/problems');
      return;
    }
    setIsAuthorized(true);
    fetchUserVotes();
  }, [userId, router]);

  const fetchUserVotes = async () => {
    try {
      const res = await fetch(`http://localhost:8080/users/${userId}/votes`);
      if (res.ok) {
        setStats(await res.json());
      }
    } catch (error) {
      console.error('Failed to fetch user votes:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8 flex items-center justify-center">
        <div className="text-gray-400">読み込み中...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8 flex items-center justify-center">
        <div className="text-gray-400">ユーザーが見つかりません</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">ユーザー詳細</h1>
          <Link
            href="/admin/users"
            className="bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded-full font-bold transition"
          >
            ← 戻る
          </Link>
        </div>

        {/* 投票統計情報 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="text-gray-400 text-sm mb-2">ユーザーID</div>
            <div className="text-3xl font-bold text-green-400">{stats.user_id}</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="text-gray-400 text-sm mb-2">投票数</div>
            <div className="text-3xl font-bold text-blue-400">{stats.total_votes}</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="text-gray-400 text-sm mb-2">平均点</div>
            <div className="text-3xl font-bold text-yellow-400">
              {stats.average_score.toFixed(1)}
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="text-gray-400 text-sm mb-2">最低 / 最高</div>
            <div className="text-lg font-bold text-purple-400">
              {stats.min_score} / {stats.max_score}
            </div>
          </div>
        </div>

        {/* 投票履歴テーブル */}
        {stats.total_votes === 0 ? (
          <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 text-center text-gray-400">
            このユーザーはまだ投票していません
          </div>
        ) : (
          <div className="bg-gray-800 rounded-xl overflow-hidden shadow-xl border border-gray-700">
            <div className="px-6 py-4 bg-gray-700 border-b border-gray-600">
              <h2 className="text-xl font-bold">投票履歴</h2>
            </div>
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-700 text-gray-300">
                <tr>
                  <th className="px-6 py-4 font-semibold">投票ID</th>
                  <th className="px-6 py-4 font-semibold">問題ID</th>
                  <th className="px-6 py-4 font-semibold">評価点</th>
                  <th className="px-6 py-4 font-semibold">評価</th>
                </tr>
              </thead>
              <tbody>
                {stats.votes.map((vote) => {
                  let scoreColor = 'text-yellow-400';
                  let scoreLabel = '中程度';

                  if (vote.point >= 80) {
                    scoreColor = 'text-green-400';
                    scoreLabel = '高く評価';
                  } else if (vote.point >= 50) {
                    scoreColor = 'text-yellow-400';
                    scoreLabel = '標準的';
                  } else {
                    scoreColor = 'text-red-400';
                    scoreLabel = '低く評価';
                  }

                  return (
                    <tr
                      key={vote.ID}
                      className="border-t border-gray-700 hover:bg-gray-750 transition"
                    >
                      <td className="px-6 py-4">{vote.ID}</td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/problems/${vote.problem_id}`}
                          className="text-blue-400 hover:text-blue-300 transition"
                        >
                          問題 #{vote.problem_id}
                        </Link>
                      </td>
                      <td className={`px-6 py-4 font-bold text-lg ${scoreColor}`}>
                        {vote.point} 点
                      </td>
                      <td className="px-6 py-4 text-gray-400">{scoreLabel}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 統計グラフ */}
        {stats.total_votes > 0 && (
          <div className="mt-8 bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-6">評価分布</h2>
            <div className="space-y-3">
              {[
                { label: '0-19点', min: 0, max: 19 },
                { label: '20-39点', min: 20, max: 39 },
                { label: '40-59点', min: 40, max: 59 },
                { label: '60-79点', min: 60, max: 79 },
                { label: '80-100点', min: 80, max: 100 },
              ].map((range) => {
                const count = stats.votes.filter(
                  (v) => v.point >= range.min && v.point <= range.max
                ).length;
                const percentage = (count / stats.total_votes) * 100;

                return (
                  <div key={range.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">{range.label}</span>
                      <span className="font-semibold">
                        {count} 件 ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-green-500 to-blue-500 h-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
