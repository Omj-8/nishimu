'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type User = {
  ID: number;
  email: string;
  name: string;
  role: string;
  CreatedAt: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:8080/users');
      if (res.ok) {
        setUsers(await res.json());
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: number, name: string) => {
    if (!confirm(`${name} さんを本当に削除しますか？`)) return;

    try {
      await fetch(`http://localhost:8080/users/${id}`, {
        method: 'DELETE',
      });
      setUsers(users.filter(u => u.ID !== id));
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">ユーザー管理</h1>
          <Link
            href="/admin"
            className="bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded-full font-bold transition"
          >
            ← 戻る
          </Link>
        </div>

        {loading ? (
          <div className="text-center text-gray-400">読み込み中...</div>
        ) : users.length === 0 ? (
          <div className="text-center text-gray-400">ユーザーはまだいません</div>
        ) : (
          <div className="bg-gray-800 rounded-xl overflow-hidden shadow-xl border border-gray-700">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-700 text-gray-300">
                <tr>
                  <th className="px-6 py-4 font-semibold">ID</th>
                  <th className="px-6 py-4 font-semibold">ユーザー名</th>
                  <th className="px-6 py-4 font-semibold">メールアドレス</th>
                  <th className="px-6 py-4 font-semibold">権限</th>
                  <th className="px-6 py-4 font-semibold">登録日</th>
                  <th className="px-6 py-4 font-semibold text-center">操作</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.ID}
                    className="border-t border-gray-700 hover:bg-gray-750 transition"
                  >
                    <td className="px-6 py-4">{user.ID}</td>
                    <td className="px-6 py-4 font-semibold">{user.name}</td>
                    <td className="px-6 py-4 text-gray-400">{user.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          user.role === 'admin'
                            ? 'bg-red-900 text-red-200'
                            : 'bg-blue-900 text-blue-200'
                        }`}
                      >
                        {user.role === 'admin' ? '管理者' : 'ユーザー'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {new Date(user.CreatedAt).toLocaleDateString('ja-JP')}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex gap-3 justify-center">
                        <Link
                          href={`/admin/users/${user.ID}`}
                          className="text-green-400 hover:text-green-300 font-semibold transition"
                        >
                          詳細
                        </Link>
                        <button
                          onClick={() => handleDeleteUser(user.ID, user.name)}
                          className="text-red-400 hover:text-red-300 font-semibold transition"
                        >
                          削除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-8 bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-bold mb-4">統計情報</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-700 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-green-400">{users.length}</div>
              <div className="text-sm text-gray-400">登録ユーザー数</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-blue-400">
                {users.filter(u => u.role === 'admin').length}
              </div>
              <div className="text-sm text-gray-400">管理者数</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-purple-400">
                {users.filter(u => u.role === 'user').length}
              </div>
              <div className="text-sm text-gray-400">一般ユーザー数</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
