'use client';

import { useEffect, useState } from 'react';
import { getTileImage } from '@/utils/mahjong';
import { useParams } from 'next/navigation';

// データの型定義
type Problem = {
  ID: number;
  hand_tiles: string;
  dora_tiles: string;
  wind: string;
  round: string;
  score: number;
};

export default function ProblemDetail() {
  const params = useParams(); // URLからIDを取得
  const [problem, setProblem] = useState<Problem | null>(null);
  
  // JSONをパースした後のデータを入れるstate
  const [handTiles, setHandTiles] = useState<number[]>([]);
  const [doraTiles, setDoraTiles] = useState<number[]>([]);
  
  // 評価点のstate
  const [rating, setRating] = useState<number>(50);

  useEffect(() => {
    if (params.id) {
      // params.id は string | string[] なのでキャストして使う
      fetchProblem(params.id as string);
    }
  }, [params.id]);

  const fetchProblem = async (id: string) => {
    try {
      // URLのIDを使ってデータを取得
      const res = await fetch(`http://localhost:8080/problems/${id}`);
      if (!res.ok) throw new Error('Failed to fetch');

      const data: Problem = await res.json();
      setProblem(data);

      // 文字列 "[0,1...]" を配列に変換してセット
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
                className="w-12 h-16 sm:w-16 sm:h-24 shadow-xl hover:-translate-y-2 transition-transform cursor-pointer"
              />
            ))}
          </div>
        </div>

        {/* アクションエリア */}
        <div className="mt-10 text-center bg-black/20 p-6 rounded-xl w-full max-w-lg mx-auto backdrop-blur-sm">
          <p className="text-green-100 mb-2 text-lg font-semibold">この配牌の価値は？</p>

          {/* 点数表示 */}
          <div className="text-5xl font-bold text-white mb-4 drop-shadow-md">
            {rating} <span className="text-2xl font-normal">点</span>
          </div>

          {/* スライダー本体 */}
          <input
            type="range"
            min="0"
            max="100"
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-400"
          />

          <div className="flex justify-between text-xs text-gray-300 mt-2 px-1">
            <span>0 (不要)</span>
            <span>50 (普通)</span>
            <span>100 (神配牌)</span>
          </div>

          {/* 投票ボタン */}
          <button
            className="mt-6 bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 px-8 rounded-full shadow-lg transform transition hover:scale-105"
            onClick={() => alert(`${rating}点で投票します（未実装）`)}
          >
            投票する
          </button>
        </div>

      </div>

      {/* デバッグ用リロードボタン */}
      <button
        onClick={() => {
          if (params.id) fetchProblem(params.id as string);
        }}
        className="mt-8 text-white/50 hover:text-white underline text-sm"
      >
        リロード
      </button>
    </div>
  );
}