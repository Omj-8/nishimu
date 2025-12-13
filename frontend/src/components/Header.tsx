'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string } | null>(null);

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
    router.push('/login'); // ログイン画面へ飛ばす
  };

  return (
    <header className="bg-gray-800 border-b border-gray-700 text-white py-4 px-6 flex justify-between items-center shadow-md">
      {/* 左側: ロゴ（クリックでトップへ） */}
      <Link href="/" className="text-xl font-bold text-green-400 hover:text-green-300 transition">
        🀄 Mahjong Eval
      </Link>

      {/* 右側: ナビゲーション */}
      <nav className="flex items-center gap-6">
        {user ? (
          // ログインしている場合
          <>
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