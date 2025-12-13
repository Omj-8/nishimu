'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8080/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Login failed');

      const user = await res.json();
      
      // ★重要: ログイン情報をブラウザに保存 (簡易的な方法)
      localStorage.setItem('user', JSON.stringify(user));
      
      alert(`ようこそ、${user.name}さん！`);
      router.push('/'); // 問題一覧ページへ移動

    } catch (err) {
      alert('メールアドレスまたはパスワードが間違っています。');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 text-white font-sans">
      <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-700">
        <h1 className="text-2xl font-bold mb-6 text-center text-yellow-400">ログイン</h1>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm mb-1 text-gray-400">メールアドレス</label>
            <input
              type="email"
              className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:border-yellow-500 focus:outline-none"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-gray-400">パスワード</label>
            <input
              type="password"
              className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:border-yellow-500 focus:outline-none"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          <button
            type="submit"
            className="mt-4 bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 rounded transition"
          >
            ログイン
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          アカウントをお持ちでないですか？{' '}
          <Link href="/signup" className="text-yellow-400 hover:underline">
            新規登録はこちら
          </Link>
        </div>
      </div>
    </div>
  );
}