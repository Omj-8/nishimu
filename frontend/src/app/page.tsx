'use client';

import { useEffect, useState } from 'react';

type Todo = {
  ID: number;
  CreatedAt: string;
  title: string;
  done: boolean;
};

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const res = await fetch('http://localhost:8080/todos');
      const data = await res.json();
      setTodos(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const addTodo = async () => {
    if (!newTitle) return;
    await fetch('http://localhost:8080/todos', {
      method: 'POST',
      body: JSON.stringify({ title: newTitle, done: false }),
    });
    setNewTitle('');
    fetchTodos();
  };

  // 更新機能 (完了状態の切り替え)
  const toggleTodo = async (todo: Todo) => {
    await fetch(`http://localhost:8080/todos/${todo.ID}`, {
      method: 'PUT',
      body: JSON.stringify({ ...todo, done: !todo.done }), // doneを反転させて送信
    });
    fetchTodos();
  };

  // 削除機能
  const deleteTodo = async (id: number) => {
    await fetch(`http://localhost:8080/todos/${id}`, {
      method: 'DELETE',
    });
    fetchTodos();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center py-10">
      <h1 className="text-4xl font-bold mb-8 text-blue-400">Todo App</h1>

      <div className="flex gap-2 mb-8">
        <input
          type="text"
          className="px-4 py-2 rounded text-black outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="New Task..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTodo()}
        />
        <button
          onClick={addTodo}
          className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded font-bold transition"
        >
          Add
        </button>
      </div>

      <div className="w-full max-w-md space-y-2">
        {todos.map((todo) => (
          <div
            key={todo.ID}
            className="bg-gray-800 p-4 rounded shadow flex justify-between items-center"
          >
            <div className="flex items-center gap-3">
              {/* チェックボックス (更新) */}
              <input
                type="checkbox"
                checked={todo.done}
                onChange={() => toggleTodo(todo)}
                className="w-5 h-5 cursor-pointer accent-blue-500"
              />
              <span className={todo.done ? 'line-through text-gray-500' : ''}>
                {todo.title}
              </span>
            </div>
            
            {/* 削除ボタン */}
            <button
              onClick={() => deleteTodo(todo.ID)}
              className="text-red-400 hover:text-red-300 text-sm border border-red-400 px-2 py-1 rounded"
            >
              Delete
            </button>
          </div>
        ))}
        {todos.length === 0 && <p className="text-gray-500 text-center">No tasks yet.</p>}
      </div>
    </div>
  );
}