'use client';

import { useEffect, useState } from 'react';
import { getTileImage } from '@/utils/mahjong';
import { useParams } from 'next/navigation';

type Problem = {
  ID: number;
  hand_tiles: string;
  dora_tiles: string;
  wind: string;
  round: string;
  score: number;
};

export default function ProblemDetail() {
  const [problem, setProblem] = useState<Problem | null>(null);
  const params = useParams(); // URLからパラメータを取得 (例: { id: "1" })
  
  const [handTiles, setHandTiles] = useState<number[]>([]);
  const [doraTiles, setDoraTiles] = useState<number[]>([]);
  const [rating, setRating] = useState<number>(50);

  useEffect(() => {
    // params.id が存在することを確認してから実行
    if (params.id) {
      // params.id は string | string[] なので string にキャスト
      fetchProblem(params.id as string);
    }
  }, [params.id]); // params.id が変わったら再実行

  // ★修正: id を引数として受け取るように変更
  const fetchProblem = async (id: string) => {
    try {
      // ★修正: 引数の id を使う
      const res = await fetch(`http://localhost:8080/problems/${id}`);
      if (!res.ok) throw new Error('Failed to fetch');

      const data: Problem = await res.json();
      setProblem(data);

      setHandTiles(JSON.parse(data.hand_tiles));
      setDoraTiles(JSON.parse(data.dora_tiles));

    } catch (err) {
      console.error(err);
    }
  };

  if (!problem) return <div className="text-white text-center mt-20">Loading problem...</div>;

  return (
    <div className="min-h-screen bg-green-800 flex flex-col items-center justify-center p-4 font-sans">
        {/* ... 中身はそのまま ... */}
        
        {/* 下の方にあるコンテナの閉じタグの後 */}
        
        {/* ゲームテーブル風のコンテナ */}
      <div className="bg-green-700 p-8 rounded-xl shadow-2xl border-4 border-green-900 w-full max-w-4xl">
        {/* ... 省略 ... */}
         {/* アクションエリア */}
        <div className="mt-10 text-center bg-black/20 p-6 rounded-xl w-full max-w-lg mx-auto backdrop-blur-sm">
             {/* ... 省略 ... */}
        </div>
      </div>

      {/* デバッグ用リロードボタンの修正 */}
      <button 
        // ★修正: ボタンを押した時も現在のIDを渡す
        onClick={() => fetchProblem(params.id as string)}
        className="mt-8 text-white/50 hover:text-white underline text-sm"
      >
        リロード
      </button>
    </div>
  );
}