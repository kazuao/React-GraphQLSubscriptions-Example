# GraphQL over WebSocket + Subscriptions サンプル

React + TypeScript + Vite（フロント）で、
GraphQL over WebSocket + Subscriptions を試す最小構成のコード一式です。
パッケージ管理は pnpm を使用します。

ここではフロントエンドのセットアップと全体の流れをまとめています。

---

## 2. フロントエンド（React + TS + Vite）

### 2-1. プロジェクト作成

```bash
pnpm create vite@latest graphql-subscription-example --template react-ts
cd graphql-subscription-example
pnpm install
pnpm add @apollo/client graphql graphql-ws
```

### 2-2. ディレクトリ構成（主要ファイル）

```text
React-GraphQLSubscriptions-Example/
  ├─ index.html
  ├─ vite.config.ts
  ├─ tsconfig.json
  └─ src/
      ├─ main.tsx
      ├─ App.tsx
      ├─ apolloClient.ts
      ├─ index.css
      ├─ graphql/
      │   └─ operations.ts
      └─ components/
          └─ MessageList.tsx
```

> Vite が生成するそのほかのファイル（`tsconfig.json` や `vite.config.ts` など）は  
> デフォルトのままで OK です。

---

### 2-3. `graphql-subscription-example/src/apolloClient.ts`

```ts
import { ApolloClient, InMemoryCache } from "@apollo/client";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";

// すべての GraphQL 操作（Query/Mutation/Subscription）を WebSocket 経由で送る
const wsLink = new GraphQLWsLink(
  createClient({
    url: "ws://localhost:4000/graphql",
  })
);

export const client = new ApolloClient({
  link: wsLink,
  cache: new InMemoryCache(),
});
```

---

### 2-4. `graphql-subscription-example/src/graphql/operations.ts`

> バックエンドで公開しているフィールドは `docs/graphql-ws-stub.md` のスキーマ定義を参照してください。

```ts
import { gql } from "@apollo/client";

export const MESSAGE_ADDED_SUBSCRIPTION = gql`
  subscription OnMessageAdded {
    messageAdded {
      id
      text
      createdAt
      author
      channel
      important
      tags
    }
  }
`;

export const SYSTEM_STATUS_SUBSCRIPTION = gql`
  subscription OnSystemStatusChanged {
    systemStatusChanged {
      online
      load
      updatedAt
    }
  }
`;

export const SETTINGS_UPDATED_SUBSCRIPTION = gql`
  subscription OnSettingsUpdated {
    settingsUpdated {
      theme
      lang
      updatedAt
    }
  }
`;

export const SEND_MESSAGE_MUTATION = gql`
  mutation SendMessage($text: String!) {
    sendMessage(text: $text) {
      id
      text
      createdAt
      author
      channel
      important
      tags
    }
  }
`;
```

---

### 2-5. `graphql-subscription-example/src/components/MessageList.tsx`

```tsx
import { useState } from "react";
import { useSubscription, useMutation } from "@apollo/client";
import {
  MESSAGE_ADDED_SUBSCRIPTION,
  SYSTEM_STATUS_SUBSCRIPTION,
  SETTINGS_UPDATED_SUBSCRIPTION,
  SEND_MESSAGE_MUTATION,
} from "../graphql/operations";

type Message = {
  id: string;
  text: string;
  createdAt: string;
  author: string;
  channel: string;
  important: boolean;
  tags: string[];
};

type SystemStatus = {
  online: boolean;
  load: number;
  updatedAt: string;
};

type Settings = {
  theme: string;
  lang: string;
  updatedAt: string;
};

export const MessageList: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);

  // メッセージ追加イベントを購読
  useSubscription(MESSAGE_ADDED_SUBSCRIPTION, {
    onData: ({ data }) => {
      const newMessage = data.data?.messageAdded as Message | undefined;
      if (!newMessage) return;

      setMessages((prev) => {
        const exists = prev.some((m) => m.id === newMessage.id);
        if (exists) return prev;
        return [...prev, newMessage];
      });
    },
  });

  // システムステータスの購読
  useSubscription(SYSTEM_STATUS_SUBSCRIPTION, {
    onData: ({ data }) => {
      const newStatus = data.data?.systemStatusChanged as SystemStatus | undefined;
      if (!newStatus) return;
      setStatus(newStatus);
    },
  });

  // 設定値の購読
  useSubscription(SETTINGS_UPDATED_SUBSCRIPTION, {
    onData: ({ data }) => {
      const newSettings = data.data?.settingsUpdated as Settings | undefined;
      if (!newSettings) return;
      setSettings(newSettings);
    },
  });

  const [sendMessage, { loading }] = useMutation(SEND_MESSAGE_MUTATION);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    try {
      await sendMessage({ variables: { text: input.trim() } });
      setInput("");
    } catch (error) {
      console.error(error);
      alert("送信に失敗しました");
    }
  };

  return (
    <div
      style={{
        maxWidth: 600,
        margin: "0 auto",
        padding: "1rem",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <h1>GraphQL over WebSocket Demo</h1>
      <p style={{ color: "#555", fontSize: 14 }}>
        Subscription でメッセージをリアルタイム受信します。
        サーバーから5秒ごとにダミーメッセージ、7秒ごとにステータス更新、9秒ごとに設定更新が流れます。
      </p>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          gap: "0.5rem",
          margin: "1rem 0",
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="メッセージを入力..."
          style={{
            flex: 1,
            padding: "0.5rem 0.75rem",
            borderRadius: 4,
            border: "1px solid #ccc",
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: 4,
            border: "none",
            cursor: "pointer",
          }}
        >
          送信
        </button>
      </form>

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: 4,
          padding: "0.5rem",
          minHeight: 200,
          background: "#fafafa",
        }}
      >
        {messages.length === 0 && <div style={{ color: "#777" }}>まだメッセージはありません。</div>}
        {messages.map((m) => (
          <div
            key={m.id}
            style={{
              marginBottom: "0.75rem",
              paddingBottom: "0.5rem",
              borderBottom: "1px dashed #e0e0e0",
            }}
          >
            <div>{m.text}</div>
            <div style={{ fontSize: 12, color: "#444", marginTop: 4 }}>
              {m.author} / #{m.channel}
              {m.important ? " [important]" : ""}
              {m.tags.length > 0 ? ` [${m.tags.join(", ")}]` : ""}
            </div>
            <div style={{ fontSize: 12, color: "#777", marginTop: 2 }}>
              {new Date(m.createdAt).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: "1.5rem",
          border: "1px solid #ddd",
          borderRadius: 4,
          padding: "0.75rem",
          background: "#fdfdfd",
        }}
      >
        <h2 style={{ margin: "0 0 0.5rem" }}>System Status (Subscription)</h2>
        {status ? (
          <div style={{ fontSize: 14, color: "#333" }}>
            <div>online: {status.online ? "true" : "false"}</div>
            <div>load: {status.load}</div>
            <div>updatedAt: {new Date(status.updatedAt).toLocaleTimeString()}</div>
          </div>
        ) : (
          <div style={{ color: "#777" }}>まだステータスはありません。</div>
        )}
      </div>

      <div
        style={{
          marginTop: "1rem",
          border: "1px solid #ddd",
          borderRadius: 4,
          padding: "0.75rem",
          background: "#fdfdfd",
        }}
      >
        <h2 style={{ margin: "0 0 0.5rem" }}>Settings (Subscription)</h2>
        {settings ? (
          <div style={{ fontSize: 14, color: "#333" }}>
            <div>theme: {settings.theme}</div>
            <div>lang: {settings.lang}</div>
            <div>updatedAt: {new Date(settings.updatedAt).toLocaleTimeString()}</div>
          </div>
        ) : (
          <div style={{ color: "#777" }}>まだ設定はありません。</div>
        )}
      </div>
    </div>
  );
};
```

---

### 2-6. `graphql-subscription-example/src/App.tsx`

```tsx
import { MessageList } from "./components/MessageList";

function App() {
  return <MessageList />;
}

export default App;
```

---

### 2-7. `graphql-subscription-example/src/main.tsx`

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ApolloProvider } from "@apollo/client";
import { client } from "./apolloClient";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </React.StrictMode>
);
```

---

### 2-8. `graphql-subscription-example/src/index.css`（お好みで）

```css
:root {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  line-height: 1.5;
  color-scheme: light;
}

body {
  margin: 0;
  background: #f5f5f5;
}
```

---

## 3. 動かし方

### 3-1. バックエンド

`docs/graphql-ws-stub.md` の手順で起動します（`ws://localhost:4000/graphql` が開く）。

### 3-2. フロントエンド

```bash
cd graphql-subscription-example
pnpm install
pnpm dev
# ブラウザで表示された URL (通常は http://localhost:5173) を開く
```

画面を開くと

- 5 秒ごとに `messageAdded`（ダミーメッセージ）
- 7 秒ごとに `systemStatusChanged`（システムステータス）
- 9 秒ごとに `settingsUpdated`（設定値）
- テキスト入力して「送信」すると `sendMessage` 経由で `messageAdded` に即反映

という動作で、**GraphQL over WebSocket + Subscriptions の流れ**を確認できます。
