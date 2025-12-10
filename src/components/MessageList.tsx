import { useState } from 'react'
import { useMessages, useSettings, useSystemStatus } from '../hooks/useSubscriptions'

export const MessageList: React.FC = () => {
  const { messages, sendMessage, sending } = useMessages()
  const status = useSystemStatus()
  const settings = useSettings()
  const [input, setInput] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    try {
      await sendMessage(input)
      setInput('')
    } catch (error) {
      console.error(error)
      alert('送信に失敗しました')
    }
  }

  return (
    <div
      style={{
        maxWidth: 720,
        margin: '0 auto',
        padding: '1.5rem 1rem 2rem',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      <h1>GraphQL over WebSocket Demo</h1>
      <p style={{ color: '#555', fontSize: 14 }}>
        Subscription でメッセージをリアルタイム受信します。サーバーから5秒ごとにダミーメッセージ、7秒ごとにステータス、9秒ごとに設定更新が流れます。
      </p>

      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          gap: '0.5rem',
          margin: '1rem 0',
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="メッセージを入力..."
          style={{
            flex: 1,
            padding: '0.5rem 0.75rem',
            borderRadius: 6,
            border: '1px solid #ccc',
          }}
        />
        <button
          type="submit"
          disabled={sending}
          style={{
            padding: '0.55rem 1rem',
            borderRadius: 6,
            border: 'none',
            background: '#2563eb',
            color: '#fff',
            cursor: 'pointer',
            opacity: sending ? 0.7 : 1,
          }}
        >
          送信
        </button>
      </form>

      <div
        style={{
          border: '1px solid #ddd',
          borderRadius: 6,
          padding: '0.75rem',
          minHeight: 220,
          background: '#fafafa',
        }}
      >
        <h2 style={{ margin: '0 0 0.5rem' }}>Messages (Subscription)</h2>
        {messages.length === 0 && <div style={{ color: '#777' }}>まだメッセージはありません。</div>}
        {messages.map((m) => (
          <div
            key={m.id}
            style={{
              marginBottom: '0.75rem',
              paddingBottom: '0.5rem',
              borderBottom: '1px dashed #e0e0e0',
            }}
          >
            <div>{m.text}</div>
            <div style={{ fontSize: 12, color: '#444', marginTop: 4 }}>
              {m.author} / #{m.channel}
              {m.important ? ' [important]' : ''}
              {m.tags.length > 0 ? ` [${m.tags.join(', ')}]` : ''}
            </div>
            <div style={{ fontSize: 12, color: '#777', marginTop: 2 }}>
              {new Date(m.createdAt).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: '1.5rem',
          border: '1px solid #ddd',
          borderRadius: 6,
          padding: '0.75rem',
          background: '#fdfdfd',
        }}
      >
        <h2 style={{ margin: '0 0 0.5rem' }}>System Status (Subscription)</h2>
        {status ? (
          <div style={{ fontSize: 14, color: '#333' }}>
            <div>online: {status.online ? 'true' : 'false'}</div>
            <div>load: {status.load}</div>
            <div>updatedAt: {new Date(status.updatedAt).toLocaleTimeString()}</div>
          </div>
        ) : (
          <div style={{ color: '#777' }}>まだステータスはありません。</div>
        )}
      </div>

      <div
        style={{
          marginTop: '1rem',
          border: '1px solid #ddd',
          borderRadius: 6,
          padding: '0.75rem',
          background: '#fdfdfd',
        }}
      >
        <h2 style={{ margin: '0 0 0.5rem' }}>Settings (Subscription)</h2>
        {settings ? (
          <div style={{ fontSize: 14, color: '#333' }}>
            <div>theme: {settings.theme}</div>
            <div>lang: {settings.lang}</div>
            <div>updatedAt: {new Date(settings.updatedAt).toLocaleTimeString()}</div>
          </div>
        ) : (
          <div style={{ color: '#777' }}>まだ設定はありません。</div>
        )}
      </div>
    </div>
  )
}
