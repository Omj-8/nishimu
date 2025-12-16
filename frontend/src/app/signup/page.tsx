'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Signup() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user', // 追加: デフォルトは一般ユーザー
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8080/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Signup failed');

      // 成功したらログイン画面へ
      alert('登録しました！ログインしてください。');
      router.push('/login');
    } catch (err) {
      alert('登録に失敗しました。メールアドレスが重複している可能性があります。');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 text-white font-sans">
      <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-700">
        <h1 className="text-2xl font-bold mb-6 text-center text-green-400">新規登録</h1>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm mb-1 text-gray-400">ユーザー名</label>
            <input
              type="text"
              className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:border-green-500 focus:outline-none"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm mb-1 text-gray-400">メールアドレス</label>
            <input
              type="email"
              className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:border-green-500 focus:outline-none"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-gray-400">パスワード</label>
            <input
              type="password"
              className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:border-green-500 focus:outline-none"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          {/* 開発用: 管理者として登録 */}
          <div className="flex items-center gap-2 bg-yellow-900/20 p-3 rounded border border-yellow-700/50">
            <input
              type="checkbox"
              id="isAdmin"
              checked={formData.role === 'admin'}
              onChange={(e) => setFormData({ ...formData, role: e.target.checked ? 'admin' : 'user' })}
              className="w-4 h-4"
            />
            <label htmlFor="isAdmin" className="text-sm text-yellow-400 cursor-pointer">
              🔧 管理者として登録（開発用）
            </label>
          </div>

          <button
            type="submit"
            className="mt-4 bg-green-600 hover:bg-green-500 text-white font-bold py-2 rounded transition"
          >
            登録する
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          すでにアカウントをお持ちですか？{' '}
          <Link href="/login" className="text-green-400 hover:underline">
            ログインはこちら
          </Link>
        </div>
      </div>
    </div>
  );
}