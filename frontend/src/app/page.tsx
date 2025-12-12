'use client';

import { useEffect, useState } from 'react';
import { getTileImage } from '@/utils/mahjong';

// データの型定義 (BackendのProblem構造体に対応)
type Problem = {
  ID: number;
  hand_tiles: string; // JSON文字列として来る ("[0,1,2...]")
  dora_tiles: string; // JSON文字列 ("[27]")
  wind: string;
  round: string;
  score: number;
};

export default function Home() {
  const [problem, setProblem] = useState<Problem | null>(null);
  // 文字列JSONをパースして配列にしたものを入れるstate
  const [handTiles, setHandTiles] = useState<number[]>([]);
  const [doraTiles, setDoraTiles] = useState<number[]>([]);

  useEffect(() => {
    fetchProblem();
  }, []);

  const fetchProblem = async () => {
    try {
      // APIからランダムな問題を取得
      const res = await fetch('http://localhost:8080/problems/random');
      if (!res.ok) throw new Error('Failed to fetch');
      
      const data: Problem = await res.json();
      setProblem(data);

      // 重要: バックエンドから来た文字列 "[0,1...]" を 配列 [0,1...] に変換
      setHandTiles(JSON.parse(data.hand_tiles));
      setDoraTiles(JSON.parse(data.dora_tiles));

    } catch (err) {
      console.error(err);
    }
  };

  if (!problem) return <div className="text-white text-center mt-20">Loading problem...</div>;

  return (
    <div className="min-h-screen bg-green-800 flex flex-col items-center justify-center p-4 font-sans">
      
      {/* ゲームテーブル風のコンテナ */}
      <div className="bg-green-700 p-8 rounded-xl shadow-2xl border-4 border-green-900 w-full max-w-4xl">
        
        {/* 情報パネル */}
        <div className="flex justify-between items-center text-white mb-8 bg-black/30 p-4 rounded-lg">
          <div className="text-xl font-bold">
            {problem.round}局 / {problem.wind}家
          </div>
          <div className="text-2xl font-mono bg-black/50 px-4 py-1 rounded">
            {problem.score.toLocaleString()} 点
          </div>
        </div>

        {/* ドラ表示 */}
        <div className="mb-6 flex items-center gap-4">
          <span className="text-yellow-400 font-bold bg-black/40 px-3 py-1 rounded">DORA</span>
          <div className="flex gap-1">
             {/* ドラ表示牌 */}
             {doraTiles.map((tileId, idx) => (
              <img 
                key={`dora-${idx}`} 
                src={getTileImage(tileId)} 
                alt="dora" 
                className="w-10 h-14 shadow-md rounded-sm"
              />
            ))}
            {/* 裏返しの牌（演出用） */}
            {[...Array(4)].map((_, i) => (
               <img key={i} src="/tiles/Back.svg" alt="ura" className="w-10 h-14 opacity-70" />
            ))}
          </div>
        </div>

        {/* 手牌 (メインコンテンツ) */}
        <div className="bg-green-600/50 p-6 rounded-lg border-b-8 border-black/20">
          <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
            {handTiles.map((tileId, idx) => (
              <img
                key={`hand-${idx}`}
                src={getTileImage(tileId)}
                alt={`tile-${tileId}`}
                // 理牌されている前提で、最後の1枚（ツモ牌）だけ少し離す演出を入れるならここで調整
                // 今回は単純に並べる
                className="w-12 h-16 sm:w-16 sm:h-24 shadow-xl hover:-translate-y-2 transition-transform cursor-pointer"
              />
            ))}
          </div>
        </div>

        {/* アクションボタン (仮) */}
        <div className="mt-10 text-center">
            <p className="text-green-200 mb-4 text-sm">この配牌の価値を評価してください</p>
            <input type="range" className="w-64 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
        </div>

      </div>
      
      {/* デバッグ用リロードボタン */}
      <button 
        onClick={fetchProblem}
        className="mt-8 text-white/50 hover:text-white underline text-sm"
      >
        別の問題をロード (今は1問しかありません)
      </button>
    </div>
  );
}