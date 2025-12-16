import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white relative overflow-hidden font-sans">
      
      {/* 背景の装飾 (ぼんやり光る緑のエフェクト) */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-600/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-600/10 rounded-full blur-3xl"></div>

      <div className="z-10 text-center max-w-2xl px-6">
        {/* タイトルエリア */}
        <h1 className="text-6xl md:text-7xl font-extrabold mb-6 tracking-tight">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
            麻雀
          </span>
          <br />
          Evaluator
        </h1>

        <p className="text-gray-400 text-lg md:text-xl mb-10 leading-relaxed">
          あなたの配牌価値観は、多数派か？それとも異端か？<br />
          集合知で麻雀の「感覚」を可視化するプラットフォーム。
        </p>

        {/* スタートボタン */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link 
            href="/login" 
            className="group relative px-8 py-4 bg-green-600 hover:bg-green-500 rounded-full font-bold text-lg transition-all shadow-[0_0_20px_rgba(34,197,94,0.5)] hover:shadow-[0_0_40px_rgba(34,197,94,0.7)]"
          >
            <span className="relative z-10 flex items-center gap-2">
              ログイン
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 group-hover:translate-x-1 transition-transform">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </span>
          </Link>

          <Link 
            href="/signup"
            className="px-8 py-4 bg-gray-800 hover:bg-gray-700 rounded-full font-bold text-lg transition border border-gray-700 text-gray-300 hover:text-white"
          >
            新規登録
          </Link>
        </div>

        {/* キャッチコピー的なもの */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm text-gray-500">
          <div className="flex flex-col items-center">
            <span className="text-2xl mb-2">🀄</span>
            <p>リアルな配牌データ</p>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl mb-2">📊</span>
            <p>みんなの評価と比較</p>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl mb-2">🏆</span>
            <p>自分の雀風を分析</p>
          </div>
        </div>
      </div>
    </div>
  );
}