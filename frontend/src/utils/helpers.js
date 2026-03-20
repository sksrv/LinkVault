
export const timeAgo = (dateString) => {
  const seconds = Math.floor((Date.now() - new Date(dateString)) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}


export const getDomain = (url) => {
  try {
    return new URL(url).hostname.replace('www.', '')
  } catch {
    return url
  }
}

// Truncate text
export const truncate = (text, maxLength = 120) => {
  if (!text) return ''
  return text.length > maxLength ? text.slice(0, maxLength) + '…' : text
}

// Ensure URL has protocol
export const normalizeUrl = (url) => {
  if (!url) return ''
  if (!/^https?:\/\//i.test(url)) return 'https://' + url
  return url
}

// Get site emoji/icon placeholder
export const getSiteEmoji = (url) => {
  const domain = getDomain(url)
  if (domain.includes('youtube') || domain.includes('youtu.be')) return '▶'
  if (domain.includes('github')) return '⌥'
  if (domain.includes('twitter') || domain.includes('x.com')) return '✕'
  if (domain.includes('reddit')) return '◈'
  if (domain.includes('linkedin')) return 'in'
  if (domain.includes('medium')) return 'M'
  if (domain.includes('figma')) return '◇'
  if (domain.includes('notion')) return 'N'
  if (domain.includes('vercel')) return '▲'
  if (domain.includes('stackoverflow')) return 'S'
  return domain.charAt(0).toUpperCase()
}

// Parse tags from comma-separated string
export const parseTags = (str) => {
  return str
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)
}

// Debounce utility
export const debounce = (fn, delay) => {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}
