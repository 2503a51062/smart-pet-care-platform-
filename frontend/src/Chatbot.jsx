
import { useState } from 'react'
import './Chatbot.css'

function Chatbot({ onBack }) {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Hello! 🐾 Welcome to Smart Pet Care. Ask me about pet nutrition, grooming, exercise or vaccinations.'
    }
  ])
  const [loading, setLoading] = useState(false)

  const sendMessage = async (event) => {
    event.preventDefault()

    if (!message.trim() || loading) return

    const userMessage = message.trim()

    setMessages((previous) => [
      ...previous,
      { sender: 'user', text: userMessage }
    ])

    setMessage('')
    setLoading(true)

    try {
      const response = await fetch(
        'http://127.0.0.1:5000/api/chatbot',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: userMessage
          })
        }
      )

      const data = await response.json()

      if (response.ok) {
        setMessages((previous) => [
          ...previous,
          {
            sender: 'bot',
            text: data.bot_response
          }
        ])
      } else {
        setMessages((previous) => [
          ...previous,
          {
            sender: 'bot',
            text: data.error || 'Unable to get a response.'
          }
        ])
      }
    } catch {
      setMessages((previous) => [
        ...previous,
        {
          sender: 'bot',
          text: 'Cannot connect to the server. Please try again.'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="chatbot-page">
      <button className="chatbot-back" onClick={onBack}>
        ← Back to Dashboard
      </button>

      <div className="chatbot-container">
        <header className="chatbot-header">
          <h1>🤖 AI Pet Assistant</h1>
          <p>Your friendly general pet-care information assistant.</p>
        </header>

        <div className="chatbot-messages">
          {messages.map((item, index) => (
            <div
              key={index}
              className={`chat-message ${item.sender}`}
            >
              <strong>
                {item.sender === 'bot' ? '🐾 Assistant' : 'You'}
              </strong>
              <p>{item.text}</p>
            </div>
          ))}

          {loading && (
            <div className="chat-message bot">
              <p>Assistant is typing...</p>
            </div>
          )}
        </div>

        <form className="chatbot-input-form" onSubmit={sendMessage}>
          <input
            type="text"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Ask a pet-care question..."
            disabled={loading}
          />

          <button type="submit" disabled={loading || !message.trim()}>
            Send
          </button>
        </form>

        <p className="chatbot-disclaimer">
          This assistant provides general educational information only.
          It does not diagnose conditions or prescribe treatment.
          Contact a veterinarian for medical concerns or urgent symptoms.
        </p>
      </div>
    </div>
  )
}

export default Chatbot
