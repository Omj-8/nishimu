'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Problem = {
  ID: number;
  round: string;
  wind: string;
  score: number;
};

export default function AdminDashboard() {
  const [problems, setProblems] = useState<Problem[]>([]);

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    const res = await fetch('http://localhost:8080/problems');
    if (res.ok) setProblems(await res.json());
  };

  const handleDelete = async (id: number) => {
    if (!confirm('本当に削除しますか？')) return;
    
    await fetch(`http://localhost:8080/problems/${id}`, {
      method: 'DELETE',
    });
    // 画面から消す
    setProblems(problems.filter(p => p.ID !== id));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 font-sans">
      <div className="flex justify-between items-center mb-8 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold">管理者ダッシュボード</h1>
        <Link 
          href="/admin/create" 
          className="bg-green-600 hover:bg-green-500 px-6 py-2 rounded-full font-bold transition"
        >
          ＋ 新規問題作成
        </Link>
      </div>

      {/* ナビゲーションタブ */}
      <div className="flex gap-4 mb-8 max-w-6xl mx-auto">
        <button className="bg-green-600 hover:bg-green-500 px-6 py-2 rounded-full font-bold transition">
          問題管理
        </button>
        <Link 
          href="/admin/users"
          className="bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded-full font-bold transition"
        >
          ユーザー管理
        </Link>
      </div>

      <div className="max-w-6xl mx-auto bg-gray-800 rounded-xl overflow-hidden shadow-xl border border-gray-700">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-700 text-gray-300">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">場面</th>
              <th className="p-4">点数</th>
              <th className="p-4 text-center">操作</th>
            </tr>
          </thead>
          <tbody>
            {problems.map((p) => (
              <tr key={p.ID} className="border-t border-gray-700 hover:bg-gray-700/50">
                <td className="p-4">{p.ID}</td>
                <td className="p-4">{p.round} {p.wind}家</td>
                <td className="p-4">{p.score.toLocaleString()}</td>
                <td className="p-4 text-center">
                  <button 
                    onClick={() => handleDelete(p.ID)}
                    className="text-red-400 hover:text-red-300 hover:underline"
                  >
                    削除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}