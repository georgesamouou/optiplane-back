
// ** React Imports
import { createContext, useEffect, useState } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** Axios
import axios from 'axios'

// ** Config
import authConfig from 'src/configs/auth'
import API_URL from 'src/configs/api'

// ** Defaults
const defaultProvider = {
  user: null,
  loading: true,
  setUser: () => null,
  setLoading: () => Boolean,
  login: () => Promise.resolve(),
  logout: () => Promise.resolve()
}

export const getServerSideProps = async () => {

  return {
    props: {
      BASE_URL: process.env.BASE_URL
    }
  }
}

const AuthContext = createContext(defaultProvider)

const AuthProvider = ({ children }) => {
  // ** States
  const [user, setUser] = useState(defaultProvider.user)
  const [loading, setLoading] = useState(defaultProvider.loading)

  // ** Hooks
  const router = useRouter()
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName)
      setLoading(true)
      if (storedToken) {
        fetch(`${API_URL}/auth-me`, {
              method: 'GET',
              headers: {
                Authorization: storedToken,
                'Content-Type': 'application/json',
              }
            })
              .then(response => {
                if (!response.ok) {
                  throw new Error('Network response was not ok');
                }

                return response.json();
              })
              .then(responseData => {
                setLoading(false);
                setUser({ ...responseData });
              })
              .catch(() => {
                localStorage.removeItem('userData');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('accessToken');
                setUser(null);
                console.log("an error auth me");
                setLoading(false);
                if (authConfig.onTokenExpiration === 'logout' && !router.pathname.includes('login')) {
                  router.replace('/login');
                }
              });
      } else {
        setLoading(false)
      }
    }
    initAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleLogin = async(params, errorCallback) => {
    fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    })
      .then(response => response.json())
      .then(responseData => {
        if (params.rememberMe) {
          window.localStorage.setItem(authConfig.storageTokenKeyName, responseData.accessToken);
          window.localStorage.setItem('userData', JSON.stringify(responseData));
        }
        const returnUrl = router.query.returnUrl;
        setUser({ ...responseData });
        const redirectURL = returnUrl && returnUrl !== '/' ? returnUrl : '/';
        router.replace(redirectURL);
      })
      .catch(err => {
        if (errorCallback) errorCallback(err);
      });

  }

  const handleLogout = () => {
    setUser(null)
    window.localStorage.removeItem('userData')
    window.localStorage.removeItem(authConfig.storageTokenKeyName)
    router.push('/login')
  }

  const values = {
    user,
    loading,
    setUser,
    setLoading,
    login: handleLogin,
    logout: handleLogout
  }

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>
}

export { AuthContext, AuthProvider }
