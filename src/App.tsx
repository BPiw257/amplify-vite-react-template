import { useEffect, useState } from "react";

import { useAuthenticator } from '@aws-amplify/ui-react';
import { Routes, Route, useNavigate, useParams } from "react-router-dom";

type Todo = {
  id: string;
  content: string;
  createdAt?: string;
};

interface TodoDetailsProps {
  todos: Todo[];
  onUpdate: (id: string, content: string) => void;
}
function TodoDetails({ todos, onUpdate }: TodoDetailsProps) {
  const { id } = useParams();
  const todo = todos.find(t => t.id === id);
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [content, setContent] = useState(todo?.content ?? "");
  useEffect(() => {
    setContent(todo?.content ?? "");
  }, [todo, editMode]);
  if (!todo) return <div><h2>Todo not found</h2><button onClick={() => navigate(-1)}>Back</button></div>;
  return (
    <div style={{ border: "1px solid #ccc", padding: 16, marginTop: 16 }}>
      <h2>Todo Details</h2>
      <p><strong>ID:</strong> {todo.id}</p>
      <p><strong>Created:</strong> {todo.createdAt ? new Date(todo.createdAt).toLocaleString() : "Unknown"}</p>
      {editMode ? (
        <>
          <div>
            <label>
              Content:
              <input value={content} onChange={e => setContent(e.target.value)} style={{ width: '100%' }} />
            </label>
          </div>
          <button onClick={() => {
            onUpdate(todo.id, content);
            setEditMode(false);
          }}>Save</button>
          <button onClick={() => { setEditMode(false); setContent(todo.content ?? ''); }}>Cancel</button>
        </>
      ) : (
        <>
          <p><strong>Content:</strong> {todo.content}</p>
          <button onClick={() => setEditMode(true)}>Edit</button>
        </>
      )}
      <button onClick={() => navigate(-1)} style={{ marginLeft: 8 }}>Back</button>
    </div>
  );
}

function App() {
  // Local-only todos for demo
  const [todos, setTodos] = useState<Todo[]>([]);
  useEffect(() => {
    // Optionally, load from localStorage or start with demo data
    setTodos([]);
  }, []);

  const { user, signOut } = useAuthenticator();
  
  function deleteTodo(id: string) {
    setTodos(todos => todos.filter(t => t.id !== id));
  }

  function editTodo(todo: Todo) {
    const newContent = window.prompt("Edit todo content", todo.content ?? "");
    if (typeof newContent === "string" && newContent !== "" && newContent !== todo.content) {
      setTodos(todos => todos.map(t => t.id === todo.id ? { ...t, content: newContent } : t));
    }
  }

  const navigate = useNavigate();

  function createTodo() {
    const content = window.prompt("Todo content");
    if (!content) return;
    setTodos(todos => [
      ...todos,
      { id: Math.random().toString(36).slice(2), content, createdAt: new Date().toISOString() }
    ]);
  }

  const handleUpdateTodo = (id: string, content: string) => {
    setTodos(todos => todos.map(t => t.id === id ? { ...t, content } : t));
  };
  return (
    <main>
      <Routes>
        <Route path="/" element={
          <>
            <h1>My todos</h1>
            <h1>{user?.signInDetails?.loginId}'s todos</h1>
            <button onClick={createTodo}>+ new</button>
            <ul>
              {todos.map((todo => (
                <li key={todo.id} style={{ cursor: "pointer" }}>
                  {todo.content}
                  <button onClick={() => editTodo(todo)} style={{ marginLeft: 8 }}>Edit</button>
                  <button onClick={() => deleteTodo(todo.id)} style={{ marginLeft: 16 }}>Delete</button>
                  <button onClick={e => { e.stopPropagation(); navigate(`/todo/${todo.id}`); }} style={{ marginLeft: 16 }}>Details</button>
                  <br />
                  <small>
                    Created: {todo.createdAt ? new Date(todo.createdAt).toLocaleString() : "Unknown"}
                  </small>
                </li>
              )))}
            </ul>
            <div>
              🥳 App successfully hosted. Try creating a new todo.
              <br />
              <a href="https://docs.amplify.aws/react/start/quickstart/#make-frontend-updates">
                Review next step of this tutorial.
              </a>
            </div>
            <button onClick={signOut}>Sign out</button>
          </>
        } />
        <Route path="/todo/:id" element={<TodoDetails todos={todos} onUpdate={handleUpdateTodo} />} />
      </Routes>
    </main>
  );
}

export default App;
