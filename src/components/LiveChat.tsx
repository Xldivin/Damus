import React, { useState, useRef, useEffect } from 'react'
import { MessageSquare, X, Send, Minimize2 } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { toast } from 'sonner'
import { apiService } from '../services/api'
import { useLiveChat } from '../context/LiveChatContext'

interface Message {
  id: string
  text: string
  sender: 'user' | 'support'
  timestamp: Date
}

export function LiveChat() {
  const { isOpen, setIsOpen } = useLiveChat()
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! How can we help you today?',
      sender: 'support',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus()
    }
  }, [isOpen, isMinimized])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim() || isSending) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsSending(true)

    try {
      // Send message to backend/API
      // For now, simulate a response
      setTimeout(() => {
        const supportMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: 'Thank you for your message. Our support team will get back to you shortly. In the meantime, feel free to browse our FAQ section or contact us via email at mukunzidamus@gmail.com',
          sender: 'support',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, supportMessage])
        setIsSending(false)
      }, 1500)

      // TODO: Replace with actual API call
      // await apiService.chat.send({ message: inputMessage })
    } catch (error) {
      console.error('Failed to send message:', error)
      toast.error('Failed to send message. Please try again.')
      setIsSending(false)
    }
  }

  // Always render the chat button when closed
  if (!isOpen) {
    return (
      <div 
        className="fixed bottom-6 right-6 z-[9999] pointer-events-auto"
        style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999 }}
      >
        <Button
          data-live-chat-trigger
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setIsOpen(true)
          }}
          className="bg-black text-white hover:bg-gray-800 rounded-full w-14 h-14 shadow-2xl flex items-center justify-center p-0 border-0"
          size="lg"
          type="button"
          style={{ 
            width: '56px', 
            height: '56px', 
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <MessageSquare className="h-6 w-6" style={{ width: '24px', height: '24px' }} />
        </Button>
      </div>
    )
  }

  return (
    <div className={`fixed bottom-6 right-6 z-[9999] transition-all duration-300 ${
      isMinimized ? 'w-80 h-16' : 'w-96 h-[500px]'
    }`}>
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col h-full">
        {/* Header */}
        <div className="bg-black text-white p-4 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            <h3 className="font-semibold">Live Chat</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-white hover:bg-gray-800 h-8 w-8 p-0"
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-gray-800 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.sender === 'user'
                        ? 'bg-black text-white'
                        : 'bg-white text-gray-800 border border-gray-200'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender === 'user' ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              {isSending && (
                <div className="flex justify-start">
                  <div className="bg-white text-gray-800 border border-gray-200 rounded-lg px-4 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1"
                  disabled={isSending}
                />
                <Button
                  type="submit"
                  disabled={!inputMessage.trim() || isSending}
                  className="bg-black text-white hover:bg-gray-800"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

