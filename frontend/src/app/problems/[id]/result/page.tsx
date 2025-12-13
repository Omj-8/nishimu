'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
// グラフ描画用コンポーネント
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';

type ResultData = {
  average: number;
  std_dev: number;
  user_score: number;
  user_dev: number;
  vote_count: number;
  histogram: { range: string; count: number }[];
};

export default function ResultPage() {
  const params = useParams(); // URLのID (problems/1/result の "1")
  const searchParams = useSearchParams(); // クエリ (?score=80)
  const myScore = searchParams.get('score');

  const [data, setData] = useState<ResultData | null>(null);

  useEffect(() => {
    if (params.id && myScore) {
      fetchResult();
    }
  }, [params.id, myScore]);

  const fetchResult = async () => {
    try {
      // BackendのAPIを叩く
      const res = await fetch(`http://localhost:8080/results?problem_id=${params.id}&my_score=${myScore}`);
      if (!res.ok) throw new Error('Failed to fetch results');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    }
  };

  if (!data) return <div className="text-white text-center mt-20">Calculating statistics...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 font-sans flex flex-col items-center">
      
      <h1 className="text-3xl font-bold mb-2 text-green-400">判定結果</h1>
      <p className="text-gray-400 mb-8">集計数: {data.vote_count} 票</p>

      {/* スコアカード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mb-12">
        
        {/* 自分の点数 */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 text-center">
          <div className="text-gray-400 text-sm mb-2">あなたの評価</div>
          <div className="text-5xl font-bold text-yellow-400">{data.user_score}<span className="text-xl">点</span></div>
        </div>

        {/* 平均点 */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 text-center">
          <div className="text-gray-400 text-sm mb-2">みんなの平均</div>
          <div className="text-5xl font-bold text-white">{data.average}<span className="text-xl">点</span></div>
          <div className="text-xs text-gray-500 mt-2">標準偏差: {data.std_dev}</div>
        </div>

        {/* 偏差値 */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 text-center relative overflow-hidden">
          <div className="text-gray-400 text-sm mb-2">あなたの偏差値</div>
          <div className={`text-5xl font-bold ${data.user_dev >= 60 ? 'text-red-400' : data.user_dev <= 40 ? 'text-blue-400' : 'text-green-400'}`}>
            {data.user_dev}
          </div>
          <div className="text-xs text-gray-500 mt-2">
            {data.user_dev >= 60 ? '感覚が鋭い...あるいは異端？' : 
             data.user_dev <= 40 ? 'かなり辛口な評価です' : '一般的で正常な感覚です'}
          </div>
        </div>
      </div>

      {/* グラフエリア */}
      <div className="w-full max-w-4xl h-80 bg-gray-800 p-4 rounded-xl border border-gray-700 mb-8">
        <h3 className="text-center text-gray-400 mb-4 text-sm">評価分布グラフ</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.histogram}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="range" stroke="#888" tick={{fontSize: 12}} />
            <YAxis stroke="#888" />
            <Tooltip 
              contentStyle={{backgroundColor: '#1f2937', border: 'none', borderRadius: '8px'}}
              itemStyle={{color: '#fff'}}
            />
            <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} />
            
            {/* 平均ライン */}
            <ReferenceLine x={Math.floor(data.average / 10)} stroke="white" strokeDasharray="3 3" label={{ position: 'top', value: 'AVG', fill: 'white', fontSize: 10 }} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <Link href="/problems" className="text-gray-400 hover:text-white underline">
        問題一覧に戻る
      </Link>
    </div>
  );
}