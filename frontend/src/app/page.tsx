'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Problem = {
  ID: number;
  round: string;
  wind: string;
  score: number;
  // 一覧では牌データまでは表示しなくていいので省略
};

export default function ProblemList() {
  const [problems, setProblems] = useState<Problem[]>([]);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const res = await fetch('http://localhost:8080/problems');
        if (!res.ok) throw new Error('Failed to fetch list');
        const data = await res.json();
        setProblems(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProblems();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 font-sans">
      <h1 className="text-4xl font-bold mb-8 text-center border-b border-gray-700 pb-4">
        🀄 麻雀配牌評価 - 問題一覧
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {problems.map((problem) => (
          <Link 
            href={`/problems/${problem.ID}`} 
            key={problem.ID}
            className="block group"
          >
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:bg-gray-700 transition shadow-lg hover:shadow-green-900/20 hover:border-green-500/50">
              <div className="flex justify-between items-center mb-4">
                <span className="bg-green-700 text-xs px-2 py-1 rounded font-bold">
                  Problem #{problem.ID}
                </span>
                <span className="text-gray-400 text-sm">
                  {new Date().toLocaleDateString()} {/* 本来は作成日を入れる */}
                </span>
              </div>
              
              <div className="text-2xl font-bold mb-2 text-green-100">
                {problem.round}局 {problem.wind}家
              </div>
              
              <div className="text-xl font-mono text-yellow-400">
                {problem.score.toLocaleString()} 点
              </div>

              <div className="mt-4 text-right text-sm text-green-400 opacity-0 group-hover:opacity-100 transition-opacity">
                挑戦する →
              </div>
            </div>
          </Link>
        ))}
      </div>

      {problems.length === 0 && (
        <p className="text-center text-gray-500 mt-20">問題が見つかりません...</p>
      )}
    </div>
  );
}