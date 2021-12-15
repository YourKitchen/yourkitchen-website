import React, { useContext } from 'react'
import './Login.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import LoadingIndicator from 'react-loading-indicator'
import { MessageContext, MessageType } from '../../Header/Message/Message'
import GoogleLogin from 'react-google-login'
import {
  FacebookLoginClient,
  InitParams,
  LoginOptions,
} from '@greatsumini/react-facebook-login'
import { auth } from '@yourkitchen/common'
import { AuthContext } from '../../../Contexts/AuthContext'
import AppleLogin from 'react-apple-login'
import { useLocation, useNavigate } from 'react-router-dom'

enum SignInType {
  Google = 'google',
  Facebook = 'facebook',
  Apple = 'apple',
  Email = 'email',
}

const Login: React.FC = () => {
  document.title = 'Login | YourKitchen'
  const { loadingAuthState, user, refreshUser } = useContext(AuthContext)
  const navigate = useNavigate()
  const [email, setEmail] = React.useState<string>('')
  const { setNewMessage } = useContext(MessageContext)
  const { hash, pathname } = useLocation()

  React.useEffect(() => {
    if (user) {
      navigate('/') // Go back to homepage if user exists
    }
  }, [user])

  React.useEffect(() => {
    if (hash) {
      const params = new URLSearchParams(hash.substring(1))
      if (params.has('id_token') && params.get('state') === 'Apple') {
        const accessToken = params.get('id_token')
        successHandler(SignInType.Apple, accessToken || undefined)
      }
    }
    ;(async () => {
      const initParams: InitParams = {
        version: 'v9.0',
        xfbml: false,
        cookie: false,
        localStorage: true,
        appId: '2670782929873283',
      }
      await FacebookLoginClient.loadSdk('en_US')
      FacebookLoginClient.init(() => {
        console.log('Facebook client init complete')
      }, initParams)
    })()
  }, [])

  const handleEmailSend = async (event: any) => {
    event.preventDefault()
    try {
      if (email === undefined || email === '') {
        setNewMessage('Email is not valid', MessageType.Error)
        return
      }
      const body = {
        email,
      }
      setEmail('')
      setNewMessage('An email has been sent', MessageType.Success)
      const response = await auth.post('/send', body)
      const res = await response.data
      if (res.ok === 1) {
        navigate('/')
      }
    } catch (err) {
      const error = err as any
      setNewMessage(await error.response.data.message, MessageType.Error)
    }
  }

  const errorHandler = (error: Error) => {
    console.error(error)
    setNewMessage(error.message, MessageType.Error)
  }

  const facebookLogin = () => {
    const options: LoginOptions = {
      scope: 'email,public_profile',
    }
    FacebookLoginClient.login((res) => {
      const accessToken = res.authResponse?.accessToken
      successHandler(SignInType.Facebook, accessToken)
    }, options)
  }

  const successHandler = async (type: SignInType, token?: string) => {
    if (!token) {
      return setNewMessage('No token found', MessageType.Error)
    }
    const body = {
      access_token: token,
    }

    const postType = `/${type}`
    try {
      const response = await auth.post(postType, body)
      const data = await response.data
      if (data.ok === 1) {
        refreshUser()
        if (pathname === '/login') {
          return navigate('/')
        }
      } else {
        setNewMessage(await data.message, MessageType.Error)
      }
    } catch (err) {
      setNewMessage(
        err.response ? await err.response.data.message : 'Request failed',
        MessageType.Error,
      )
    }
  }

  return (
    <div className="loginButtonWrapper" style={{ textAlign: 'center' }}>
      <h1>Login</h1>
      {!loadingAuthState && (
        <>
          <input
            id="emailInput"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value)
            }}
          />
          <button id={SignInType.Email} onClick={handleEmailSend}>
            <FontAwesomeIcon icon={['fas', 'paper-plane']} />
          </button>
          <br></br>
          <h4 style={{ color: 'grey' }}>Other options</h4>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              width: '100%',
            }}
          >
            <button
              className="facebookButton"
              style={{
                margin: 5,
                flex: 0.33,
                backgroundColor: '#4267b2',
                height: 50,
                textAlign: 'center',
              }}
              onClick={facebookLogin}
            >
              <FontAwesomeIcon icon={['fab', 'facebook-f']} />
            </button>
            <GoogleLogin
              clientId="486079812811-md8h6t93nsbalkdriuovekc7hfepgbcm.apps.googleusercontent.com"
              onSuccess={(res) => {
                const response: any = res // Any conversion
                successHandler(SignInType.Google, response.tokenId)
              }}
              onFailure={errorHandler}
              render={(renderProps) => (
                <button
                  id={SignInType.Google}
                  style={{
                    margin: 5,
                    flex: 0.33,
                  }}
                  onClick={renderProps.onClick}
                  disabled={renderProps.disabled}
                >
                  <FontAwesomeIcon icon={['fab', 'google']} />
                </button>
              )}
            ></GoogleLogin>
            <AppleLogin
              clientId="com.yourkitchen.web"
              autoLoad={false}
              redirectURI={'https://yourkitchen.io/login'}
              responseType="code id_token"
              responseMode="fragment"
              state="Apple"
              render={(renderProps) => (
                <button
                  style={{
                    margin: 5,
                    flex: 0.33,
                  }}
                  id={SignInType.Apple}
                  onClick={renderProps.onClick}
                  disabled={renderProps.disabled}
                >
                  <FontAwesomeIcon icon={['fab', 'apple']} />
                </button>
              )}
            />
          </div>
        </>
      )}
      {loadingAuthState && <LoadingIndicator />}
    </div>
  )
}

export default Login
