import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";

import { useAuthenticator } from '@aws-amplify/ui-react';
import { generateClient } from "aws-amplify/data";

const client = generateClient<Schema>();

function App() {
  

  const { user, signOut } = useAuthenticator();
  
  function deleteTodo(id: string) {
    client.models.Todo.delete({ id });
  }

  function editTodo(todo: Schema["Todo"]["type"]) {
    const newContent = window.prompt("Edit todo content", todo.content ?? "");
    if (typeof newContent === "string" && newContent !== "" && newContent !== todo.content) {
      client.models.Todo.update({ id: todo.id, content: newContent });
    }
  }

  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);

  useEffect(() => {
    client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
  }, []);

  function createTodo() {
    client.models.Todo.create({ content: window.prompt("Todo content") });
  }

  return (
<main>
  <h1>My todos</h1>
  <h1>{user?.signInDetails?.loginId}'s todos</h1>
  <button onClick={createTodo}>+ new</button>
  <ul>
    {todos.map((todo => (
      <li key={todo.id} style={{ cursor: "pointer" }}>
        {todo.content}
        <button onClick={() => editTodo(todo)} style={{ marginLeft: 8 }}>Edit</button>
        <button onClick={() => deleteTodo(todo.id)} style={{ marginLeft: 16 }}>Delete</button>
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
</main>
  );
}

export default App;
