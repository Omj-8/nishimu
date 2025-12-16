'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type User = {
  name: string;
  role: string;
};

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  // 画面が表示されたら、localStorageを見てログイン中かチェック
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // ログアウト処理
  const handleLogout = () => {
    localStorage.removeItem('user'); // 名札を捨てる
    setUser(null);
    alert('ログアウトしました');
    // ページをリロードして状態をリセット
    window.location.href = '/login';
  };

  return (
    <header className="bg-gray-900 border-b border-gray-800 text-white py-4 px-6 flex justify-between items-center z-50 relative">
      {/* ロゴはトップページ (/) へ */}
      <Link href="/" className="text-xl font-bold flex items-center gap-2 hover:opacity-80 transition">
        <span className="text-2xl">🀄</span>
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-500">
          Mahjong Eval
        </span>
      </Link>

      {/* 右側: ナビゲーション */}
      <nav className="flex items-center gap-6">
        <Link href="/problems" className="text-sm text-gray-300 hover:text-white transition">
          問題一覧
        </Link>
        {user ? (
          // ログインしている場合
          <>
            {user.role === 'admin' && (
              <Link href="/admin" className="text-sm text-blue-400 hover:text-blue-300 transition font-bold">
                🔧 管理画面
              </Link>
            )}
            <span className="text-gray-300 text-sm">
              User: <span className="text-white font-semibold">{user.name}</span>
            </span>
            <button
              onClick={handleLogout}
              className="text-sm bg-red-600 hover:bg-red-500 px-3 py-1 rounded transition"
            >
              Log out
            </button>
          </>
        ) : (
          // ログインしていない場合
          <>
            <Link href="/login" className="text-sm hover:text-green-400 transition">
              Log in
            </Link>
            <Link
              href="/signup"
              className="text-sm bg-green-600 hover:bg-green-500 px-4 py-2 rounded transition font-bold"
            >
              Sign up
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}