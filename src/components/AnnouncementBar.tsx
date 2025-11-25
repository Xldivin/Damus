import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

interface AnnouncementBarProps {
  backgroundColor?: string
  textColor?: string
}

export function AnnouncementBar() {
  const navigate = useNavigate()

  const messages = [
    { text: "Students Get 10% Off", link: "/pages/student-discount" },
    { text: "Free shipping on orders over $50! Shop now and save", link: "/products" },
    { text: "Free returns", link: "/pages/returns" },
    { text: "Download the app", link: "/app" },
  ]

  const [currentIndex, setCurrentIndex] = useState(0)
  const [fade, setFade] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      // Fade out
      setFade(false)
      
      // After fade out, change message and fade in
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % messages.length)
        setFade(true)
      }, 150) // Half of transition duration
    }, 2000) // Change message every 1 second

    return () => clearInterval(interval)
  }, [messages.length])

  const currentMessage = messages[currentIndex]

  return (
    <div className={`bg-black text-white py-2 relative`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-3">
          <p 
            className={`text-xs sm:text-sm font-bold text-center flex-1 transition-opacity duration-300 ${
              fade ? "opacity-100" : "opacity-0"
            }`}
          >
            <a 
              href={currentMessage.link} 
              onClick={(e) => {
                e.preventDefault()
                navigate(currentMessage.link)
              }}
              className="hover:underline"
            >
              {currentMessage.text}
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

