import React, { useState, useEffect } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import { withCookies } from 'react-cookie';
import { GoogleLogin } from 'react-google-login';
import FacebookLogin from 'react-facebook-login';
import { getAuth, addAuth } from '../../../actions/AuthActions';
import './style.scss';
import { Authorization } from '../../Types/GeneralTypes';
import OakTextPlain from '../../../oakui/OakTextPlain';
import { sendMessage } from '../../../events/MessageService';
import { sentPasswordChangeEmail } from '../../Auth/AuthService';
import { isEmptyOrSpaces } from '../../Utils';
import OakButton from '../../../oakui/OakButton';
import { httpPost, httpGet } from '../../Lib/RestTemplate';
import { fetchSpace } from '../../../actions/SpaceActions';
import { fetchApp } from '../../../actions/AppActions';
import fetchUsers from '../../../actions/OaUserAction';
import { fetchRoles } from '../../../actions/OaRoleActions';
import { setProfile } from '../../../actions/ProfileActions';
import OakIcon from '../../../oakui/OakIcon';

interface Props {
  setProfile: Function;
  getAuth: Function;
  addAuth: Function;
  cookies: any;
  history: any;
  profile: any;
  authorization: Authorization;
  appId: string;
  switchToSignupPage: any;
  switchToResetPage: any;
  isSpaceLogin: boolean;
  space: string;
}

const SigninPage = (props: Props) => {
  const dispatch = useDispatch();
  const profile = useSelector(state => state.profile);
  const [data, setData] = useState({
    email: '',
    password: '',
  });
  const [emailConfirmationLink, setEmailConfirmationLink] = useState('hide');

  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });

  const signinAction = event => {
    event.preventDefault();
    let baseAuthUrl = '/auth';
    if (props.isSpaceLogin) {
      baseAuthUrl = `/auth/${props.space}`;
    }
    const errorState = {
      email: '',
      password: '',
    };
    let error = false;
    sendMessage('notification', false);
    sendMessage('spinner');
    setEmailConfirmationLink('hide');
    if (isEmptyOrSpaces(data.email)) {
      error = true;
      errorState.email = 'Cannot be empty';
    } else if (
      !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(data.email)
    ) {
      error = true;
      errorState.email = 'Invalid email';
    }
    if (isEmptyOrSpaces(data.password)) {
      error = true;
      errorState.password = 'Cannot be empty';
    }
    if (!error) {
      httpPost(
        `${baseAuthUrl}/authorize`,
        {
          email: data.email,
          password: data.password,
        },
        null
      )
        .then((authorizeResponse: any) => {
          getSession(baseAuthUrl, authorizeResponse);
        })
        .catch((error: any) => {
          if (error.response.status === 404) {
            errorState.email = 'User account does not exist';
          } else if (error.response.status === 401) {
            errorState.password = 'Incorrect password';
          } else if (error.response.status === 403) {
            errorState.email = 'Email not confirmed';
            setEmailConfirmationLink('showLink');
          }
        })
        .finally(() => {
          setErrors(errorState);
          sendMessage('spinner', false);
        });
    } else {
      setErrors(errorState);
      sendMessage('spinner', false);
    }
  };

  const getSession = (baseAuthUrl, authorizeResponse) => {
    if (authorizeResponse.status === 200) {
      httpGet(`${baseAuthUrl}/session/${authorizeResponse.data.auth_key}`, null)
        .then(sessionResponse => {
          if (sessionResponse.status === 200) {
            console.log(sessionResponse);
            sendMessage('notification', true, {
              type: 'success',
              message: 'logged in',
            });
            if (props.isSpaceLogin && props.appId) {
              props.cookies.set(props.space, authorizeResponse.data.auth_key);
              redirectToRequestedApp(authorizeResponse, sessionResponse);
            } else {
              success(authorizeResponse, sessionResponse);
            }
          }
        })
        .catch((error: any) => {
          if (error.response.status === 404) {
            sendMessage('notification', true, {
              type: 'failure',
              message: 'Invalid session token',
              duration: 3000,
            });
          } else if (error.response.status === 401) {
            sendMessage('notification', true, {
              type: 'failure',
              message: 'Session expired',
              duration: 3000,
            });
          }
        });
    }
  };

  const redirectToRequestedApp = (authorizeResponse, sessionResponse) => {
    httpGet(`/app/${props.appId}`, {
      headers: {
        Authorization: sessionResponse.data.token,
      },
    }).then(appResponse => {
      window.location.href = `${appResponse.data.data.redirect}?authKey=${authorizeResponse.data.auth_key}&space=${props.space}`;
    });
  };

  const handleChange = event => {
    setData({ ...data, [event.currentTarget.name]: event.currentTarget.value });
  };

  const success = (authorizeResponse, sessionResponse) => {
    sendMessage('loggedin', true);
    if (props.isSpaceLogin) {
      props.cookies.set(props.space, authorizeResponse.data.auth_key);
      props.history.push(`/space/${props.space}/home`);
      sendMessage('notification', true, {
        type: 'success',
        message: 'logged in to space',
        duration: 3000,
      });
    } else {
      // dispatch(fetchSpace(data));
      // dispatch(fetchApp(data));
      // dispatch(fetchUsers(data));
      // dispatch(fetchRoles(data));
      props.cookies.set('oneauth', authorizeResponse.data.auth_key);
      props.history.push('/');
      sendMessage('notification', true, {
        type: 'success',
        message: 'logged in to oneauth',
        duration: 3000,
      });
    }
  };

  const resendActivationLink = () => {
    console.log(data.email);
    setEmailConfirmationLink('showSent');
  };

  const onFacebookSignIn = facebookProfile => {
    console.log('****fb login****');
    console.log(facebookProfile);
  };

  const onGoogleSignIn = googleProfile => {
    if (googleProfile?.tokenId) {
      let baseAuthUrl = '/auth';
      if (props.isSpaceLogin) {
        baseAuthUrl = `/auth/${props.space}`;
      }
      const errorState = {
        email: '',
        password: '',
      };
      sendMessage('notification', false);
      sendMessage('spinner');
      httpPost(
        `${baseAuthUrl}/authorize/google/${googleProfile.tokenId}`,
        null,
        null
      )
        .then((authorizeResponse: any) => {
          getSession(baseAuthUrl, authorizeResponse);
        })
        .finally(() => {
          sendMessage('notification', false);
          sendMessage('spinner', false);
        });
    }
  };

  return (
    <form method="GET" onSubmit={signinAction} noValidate className="login">
      <div className="form-signin">
        <div>
          <div className="label">
            {!errors.email && <div className="label-text">Email</div>}
            {errors.email && (
              <div className="error-text">
                <OakIcon mat="warning" color="warning" size="20px" />
                {errors.email}
              </div>
            )}
            {emailConfirmationLink === 'showLink' && (
              <div className="link" onClick={resendActivationLink}>
                Resend confirmation link
              </div>
            )}
            {emailConfirmationLink === 'showSent' && <>Activation link sent</>}
          </div>
          <OakTextPlain
            id="email"
            data={data}
            handleChange={e => handleChange(e)}
          />
        </div>
        <div>
          <div className="label">
            {!errors.password && <div className="label-text">Password</div>}
            {errors.password && (
              <div className="error-text">
                <OakIcon mat="warning" color="warning" size="20px" />
                {errors.password}
              </div>
            )}
            <div className="link" onClick={props.switchToResetPage}>
              Forgot Password?
            </div>
          </div>
          <OakTextPlain
            id="password"
            data={data}
            handleChange={e => handleChange(e)}
          />
        </div>
      </div>
      <div className="action">
        <OakButton variant="regular" theme="primary" action={signinAction}>
          Log In
        </OakButton>
        <p className="hr">or</p>
        <div className="button-link">
          <div className="link" onClick={props.switchToSignupPage}>
            Create an account
          </div>
        </div>
      </div>
      <div className="space-top-3 social-signin">
        <div className="social-signin-container">
          <div className="social-google">
            <GoogleLogin
              clientId="81306451496-fg67eb502dvfb50c31huhkbn481bi29h.apps.googleusercontent.com"
              buttonText="Google"
              onSuccess={onGoogleSignIn}
              onFailure={onGoogleSignIn}
              onAutoLoadFinished={onGoogleSignIn}
            />
          </div>
          <div className="social-facebook">
            <FacebookLogin
              appId="696666571109190"
              textButton="Facebook"
              fields="name,email,picture,first_name,last_name,firstName,lastName"
              onClick={onFacebookSignIn}
              callback={onFacebookSignIn}
              icon="fa-facebook"
            />
          </div>
        </div>
      </div>
    </form>
  );
};

const mapStateToProps = state => ({
  authorization: state.authorization,
});

export default connect(mapStateToProps, { getAuth, addAuth })(
  withCookies(SigninPage)
);
