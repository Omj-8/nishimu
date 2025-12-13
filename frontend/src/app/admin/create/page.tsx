'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getTileImage } from '@/utils/mahjong';

export default function CreateProblem() {
  const router = useRouter();
  
  // フォームの状態
  const [formData, setFormData] = useState({
    round: '東1',
    wind: '東',
    score: 25000,
  });

  // 選択された手牌 (IDの配列)
  const [selectedHand, setSelectedHand] = useState<number[]>([]);
  // 選択されたドラ (IDの配列)
  const [selectedDora, setSelectedDora] = useState<number[]>([]);

  // 牌の定義 (0-33: マンズ, ピンズ, ソーズ, 字牌)
  // 0-8: m1-m9, 9-17: p1-p9, 18-26: s1-s9, 27-33: z1-z7
  const allTiles = Array.from({ length: 34 }, (_, i) => i);

  // 牌をクリックした時の処理
  const handleTileClick = (tileId: number, type: 'hand' | 'dora') => {
    if (type === 'hand') {
      if (selectedHand.length >= 14) return; // 14枚制限
      setSelectedHand([...selectedHand, tileId]);
    } else {
      if (selectedDora.length >= 1) return; // ドラはとりあえず1枚
      setSelectedDora([...selectedDora, tileId]);
    }
  };

  // 選んだ牌を削除する処理
  const removeTile = (index: number, type: 'hand' | 'dora') => {
    if (type === 'hand') {
      const newHand = [...selectedHand];
      newHand.splice(index, 1);
      setSelectedHand(newHand);
    } else {
      setSelectedDora([]);
    }
  };

  const handleSubmit = async () => {
    if (selectedHand.length < 13) {
        alert('手牌が少なすぎます');
        return;
    }

    // 手牌をソートする（理牌）
    const sortedHand = [...selectedHand].sort((a, b) => a - b);

    const payload = {
      ...formData,
      score: Number(formData.score),
      // Backendは文字列JSONを期待しているのでstringifyする
      hand_tiles: JSON.stringify(sortedHand),
      dora_tiles: JSON.stringify(selectedDora),
    };

    try {
      const res = await fetch('http://localhost:8080/problems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed');
      alert('作成しました！');
      router.push('/admin');
    } catch (err) {
      alert('エラーが発生しました');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 pb-20 font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">新規問題作成</h1>

        {/* 基本情報入力 */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div>
            <label className="block text-gray-400 text-sm mb-1">場面 (例: 東1)</label>
            <input 
              className="w-full bg-gray-800 border border-gray-600 rounded p-2"
              value={formData.round}
              onChange={e => setFormData({...formData, round: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">自風 (例: 南)</label>
            <select 
              className="w-full bg-gray-800 border border-gray-600 rounded p-2"
              value={formData.wind}
              onChange={e => setFormData({...formData, wind: e.target.value})}
            >
              {['東','南','西','北'].map(w => <option key={w} value={w}>{w}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">持ち点</label>
            <input 
              type="number"
              className="w-full bg-gray-800 border border-gray-600 rounded p-2"
              value={formData.score}
              onChange={e => setFormData({...formData, score: Number(e.target.value)})}
            />
          </div>
        </div>

        {/* --- エディタエリア --- */}
        <div className="bg-green-800 p-6 rounded-xl border-4 border-green-900 mb-8 sticky top-4 shadow-2xl z-10">
            <p className="text-center text-green-200 mb-2 font-bold">作成中の手牌 ({selectedHand.length}/14)</p>
            
            {/* ドラ */}
            <div className="flex justify-center items-center gap-2 mb-4 bg-black/20 p-2 rounded-lg w-fit mx-auto">
                <span className="text-yellow-400 font-bold text-sm">ドラ:</span>
                {selectedDora.length > 0 ? (
                    <img 
                        src={getTileImage(selectedDora[0])} 
                        className="w-10 h-14 cursor-pointer hover:opacity-70"
                        onClick={() => removeTile(0, 'dora')}
                    />
                ) : (
                    <div className="w-10 h-14 border-2 border-dashed border-gray-400 rounded flex items-center justify-center text-xs text-gray-400">
                        未選択
                    </div>
                )}
            </div>

            {/* 手牌表示エリア (クリックで削除) */}
            <div className="flex flex-wrap justify-center gap-1 min-h-[4rem]">
                {selectedHand.map((tileId, idx) => (
                    <img 
                        key={idx}
                        src={getTileImage(tileId)}
                        alt="tile"
                        className="w-10 h-14 shadow-md cursor-pointer hover:-translate-y-2 hover:brightness-75 transition-transform"
                        onClick={() => removeTile(idx, 'hand')}
                    />
                ))}
                {/* プレースホルダー */}
                {[...Array(Math.max(0, 14 - selectedHand.length))].map((_, i) => (
                    <div key={`ph-${i}`} className="w-10 h-14 border border-green-600/50 rounded bg-black/10"></div>
                ))}
            </div>
        </div>

        {/* --- 牌パレット (ここから選ぶ) --- */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <h3 className="text-gray-400 mb-4 text-sm">パレット (タップして追加)</h3>
            
            <div className="flex flex-wrap gap-2 justify-center">
                {allTiles.map((tileId) => (
                    <button
                        key={tileId}
                        onClick={() => handleTileClick(tileId, 'hand')}
                        // ドラ選択モードとかつけるならここを分岐
                        onContextMenu={(e) => {
                            e.preventDefault();
                            handleTileClick(tileId, 'dora');
                        }}
                        className="hover:bg-gray-700 p-1 rounded transition"
                        title="左クリック: 手牌 / 右クリック: ドラ"
                    >
                        <img src={getTileImage(tileId)} className="w-8 h-12" />
                    </button>
                ))}
            </div>
            <p className="text-center text-xs text-gray-500 mt-4">
                ※ 左クリックまたはタップで「手牌」に追加<br/>
                ※ 右クリック(PC)で「ドラ」に追加（スマホ用にトグルボタンを作ると親切です）
            </p>
        </div>

        <button 
            onClick={handleSubmit}
            className="w-full mt-8 bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg transition"
        >
            この内容で問題を作成する
        </button>

      </div>
    </div>
  );
}