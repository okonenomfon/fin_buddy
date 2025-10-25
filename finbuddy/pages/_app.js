import '../styles/globals.css'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

function MyApp({ Component, pageProps }) {
  const router = useRouter()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      setUser(JSON.parse(userData))
    } else if (!['/login', '/signup', '/'].includes(router.pathname)) {
      router.push('/login')
    }
  }, [router.pathname])

  return <Component {...pageProps} user={user} setUser={setUser} />
}

export default MyApp
