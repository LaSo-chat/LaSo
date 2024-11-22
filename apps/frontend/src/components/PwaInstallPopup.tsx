import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

export function PwaInstallPopup() {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      deferredPrompt.userChoice.then((choiceResult: { outcome: string }) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt')
        } else {
          console.log('User dismissed the install prompt')
        }
        setDeferredPrompt(null)
        setShowInstallPrompt(false)
      })
    }
  }

  const handleClose = () => {
    setShowInstallPrompt(false)
  }

  if (!showInstallPrompt) {
    return null
  }

  return (
    <div className="fixed top-0 left-0 right-0 bg-blue-600 text-white p-4 flex justify-between items-center z-50">
      <div className="flex-1">
        <p className="text-sm font-medium">
          Install this app on your device for quick and easy access.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          className="px-3 py-1 text-sm font-medium text-blue-600 bg-white rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          onClick={handleInstall}
        >
          Install
        </button>
        <button
          className="text-white hover:text-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          onClick={handleClose}
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </button>
      </div>
    </div>
  )
}

