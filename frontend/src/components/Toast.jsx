import { useState, useEffect } from 'react'

let toastTimeout

export const showToast = (() => {
  let setter = null
  const show = (msg, type = 'success') => {
    if (setter) setter({ msg, type, visible: true })
    clearTimeout(toastTimeout)
    toastTimeout = setTimeout(() => {
      if (setter) setter((p) => ({ ...p, visible: false }))
    }, 3000)
  }
  show._register = (fn) => { setter = fn }
  return show
})()

const Toast = () => {
  const [toast, setToast] = useState({ msg: '', type: 'success', visible: false })

  useEffect(() => {
    showToast._register(setToast)
  }, [])

  if (!toast.visible) return null

  return (
    <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3.5
                     rounded-2xl border shadow-2xl shadow-black/50 animate-slide-up
                     ${toast.type === 'success'
                       ? 'bg-dark-700 border-brand-500/30 text-white'
                       : 'bg-dark-700 border-red-500/30 text-white'
                     }`}>
      {toast.type === 'success' ? (
        <div className="w-5 h-5 bg-brand-500 rounded-full flex items-center justify-center flex-shrink-0">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
      ) : (
        <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </div>
      )}
      <span className="text-sm font-medium">{toast.msg}</span>
    </div>
  )
}

export default Toast
