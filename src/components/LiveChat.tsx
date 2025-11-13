import React, { useState, useRef, useEffect } from 'react'
import { MessageSquare, X, Send, Minimize2 } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { toast } from 'sonner'
import { apiService } from '../services/api'
import { useLiveChat } from '../context/LiveChatContext'
import { getGuestSessionId } from '../services/apiConfig'
import { useAppContext } from '../context/AppContext'

interface Message {
  id: string
  text: string
  sender: 'user' | 'support'
  timestamp: Date
}

export function LiveChat() {
  const { isOpen, setIsOpen } = useLiveChat()
  const { user, isAdmin } = useAppContext()
  const [isMinimized, setIsMinimized] = useState(false)
  const [showOptions, setShowOptions] = useState(true)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [agentAvailable, setAgentAvailable] = useState(false) // Set to false to show unavailable message
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputId = 'live-chat-input'
  const [sessionId, setSessionId] = useState<string>('')
  
  // Check if user is super admin or admin
  const isSuperAdmin = (() => {
    try {
      const roles = (user as any)?.roles || []
      return !!roles.some((r: any) => String((r?.slug || r?.name || '')).toLowerCase() === 'super-admin')
    } catch {
      return false
    }
  })()
  
  // Hide chat button for super admin and admin users
  if (isSuperAdmin || isAdmin) {
    return null
  }

  // Initialize messages when chat opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: '1',
          text: 'Hello! How are you today?',
          sender: 'support',
          timestamp: new Date()
        },
        {
          id: '2',
          text: 'Please select one of the following options:',
          sender: 'support',
          timestamp: new Date()
        }
      ])
      setShowOptions(true)
    }
  }, [isOpen, messages.length])

  // Reset chat when closed
  useEffect(() => {
    if (!isOpen) {
      setMessages([])
      setShowOptions(true)
      setInputMessage('')
      setIsMinimized(false)
    }
  }, [isOpen])

  // Ensure a stable session id for guest chat
  useEffect(() => {
    try {
      const sid = getGuestSessionId()
      setSessionId(sid)
    } catch {
      setSessionId('guest')
    }
  }, [])

  // Poll backend thread when open
  useEffect(() => {
    if (!isOpen || !sessionId) return
    let mounted = true
    const load = async () => {
      try {
        const data = await apiService.chat.fetchThread(sessionId)
        if (!mounted) return
        const mapped = (data.messages || []).map(m => ({
          id: m.id,
          text: m.text,
          sender: m.sender,
          timestamp: m.timestamp ? new Date(m.timestamp) : new Date(),
        })) as Message[]
        setMessages(prev => {
          // Avoid replacing initial greeting if there are no backend messages yet
          return mapped.length > 0 ? mapped : prev
        })
      } catch {}
    }
    load()
    const interval = setInterval(load, 3000)
    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [isOpen, sessionId])

  // Debug log
  useEffect(() => {
    console.log('LiveChat isOpen state changed:', isOpen)
  }, [isOpen])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && !isMinimized) {
      // Focus input after a short delay to ensure it's rendered
      setTimeout(() => {
        const inputElement = document.getElementById(inputId) as HTMLInputElement
        inputElement?.focus()
      }, 100)
    }
  }, [isOpen, isMinimized])

  const handleOptionSelect = (option: string) => {
    // Add user's selected option as a message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: option,
      sender: 'user',
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setShowOptions(false)
    setIsSending(true)

    // Simulate agent response
    setTimeout(() => {
      let responseText = ''
      
      if (agentAvailable) {
        // Agent is available - provide specific responses
        switch (option) {
          case 'Find Rovin products that meet my needs':
            responseText = 'I\'d be happy to help you find the perfect Rovin products! Could you tell me more about what you\'re looking for? For example:\n\n• What type of products are you interested in?\n• Do you have a specific use case in mind?\n• What features are most important to you?\n\nYou can also browse our full product catalog at /products'
            break
          case 'Find information about the company':
            responseText = 'Rovin is a leading provider of innovative solutions. Here\'s some information about us:\n\n• We specialize in delivering high-quality products\n• Our mission is to provide exceptional customer service\n• We\'re committed to innovation and excellence\n\nWould you like to know more about any specific aspect of our company?'
            break
          case 'Contact technical support':
            responseText = 'I can help connect you with our technical support team. Please provide:\n\n• A brief description of your technical issue\n• Any error messages you\'ve encountered\n• Your product model or order number (if applicable)\n\nAlternatively, you can email our technical support team directly at mukunzidamus@gmail.com'
            break
          case 'Other':
            responseText = 'I\'m here to help! Please describe what you need assistance with, and I\'ll do my best to assist you.'
            break
          default:
            responseText = 'Thank you for your message. How can I assist you further?'
        }
      } else {
        // Agent is not available
        responseText = 'Thank you for your message. Our support team will get back to you shortly. In the meantime, feel free to browse our FAQ section or contact us via email at mukunzidamus@gmail.com'
      }

      const supportMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: 'support',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, supportMessage])
      setIsSending(false)
    }, 1500)
  }

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
      await apiService.chat.send({ sessionId, text: userMessage.text })
      // Reply will appear via polling when admin responds
      setIsSending(false)
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
            console.log('Chat button clicked, opening chat...')
            setIsOpen(true)
            console.log('setIsOpen called')
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

  console.log('LiveChat render - isOpen:', isOpen, 'isMinimized:', isMinimized)

  if (!isOpen) {
    return null // This shouldn't happen, but just in case
  }

  return (
    <div 
      className={`fixed bottom-6 right-6 z-[9999] transition-all duration-300 ${
        isMinimized ? 'w-80 h-16' : 'w-96 h-[500px]'
      }`}
      style={{ 
        position: 'fixed', 
        bottom: '24px', 
        right: '24px', 
        zIndex: 9999,
        width: isMinimized ? '320px' : '384px',
        height: isMinimized ? '64px' : '500px',
        display: 'block',
        visibility: 'visible',
        opacity: 1
      }}
    >
      <div 
        className="bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col h-full" 
        style={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
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
                    <p className="text-sm whitespace-pre-line">{message.text}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender === 'user' ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              
              {/* Option Buttons */}
              {showOptions && messages.length >= 2 && (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleOptionSelect('Find Rovin products that meet my needs')}
                    className="text-left bg-white border border-gray-300 hover:border-black hover:bg-gray-50 rounded-lg px-4 py-3 text-sm transition-colors"
                  >
                    Find Rovin products that meet my needs
                  </button>
                  <button
                    onClick={() => handleOptionSelect('Find information about the company')}
                    className="text-left bg-white border border-gray-300 hover:border-black hover:bg-gray-50 rounded-lg px-4 py-3 text-sm transition-colors"
                  >
                    Find information about the company
                  </button>
                  <button
                    onClick={() => handleOptionSelect('Contact technical support')}
                    className="text-left bg-white border border-gray-300 hover:border-black hover:bg-gray-50 rounded-lg px-4 py-3 text-sm transition-colors"
                  >
                    Contact technical support
                  </button>
                  <button
                    onClick={() => handleOptionSelect('Other')}
                    className="text-left bg-white border border-gray-300 hover:border-black hover:bg-gray-50 rounded-lg px-4 py-3 text-sm transition-colors"
                  >
                    Other
                  </button>
                </div>
              )}

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
                  id={inputId}
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

