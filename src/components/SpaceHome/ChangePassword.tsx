import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import './style.scss';
import { sendMessage } from '../../events/MessageService';
import { httpPost } from '../Lib/RestTemplate';
import { Authorization } from '../Types/GeneralTypes';
import { isEmptyOrSpaces } from '../Utils';
import OakButton from '../../oakui/OakButton';
import OakTextPlain from '../../oakui/OakTextPlain';
import OakIcon from '../../oakui/OakIcon';

interface Props {
  goHome: any;
  space: string;
  history: any;
}

const ChangePassword = (props: Props) => {
  const loginType = 'appspace';
  const authorization = useSelector(state => state.authorization);
  const [data, setData] = useState({
    oldpassword: '',
    password: '',
    repeatpassword: '',
  });

  const [stage, setStage] = useState('form');

  const [errors, setErrors] = useState({
    oldpassword: '',
    password: '',
    repeatpassword: '',
  });

  const handleChange = event => {
    setData({ ...data, [event.currentTarget.name]: event.currentTarget.value });
  };

  const changePassword = event => {
    event.preventDefault();
    const baseAuthUrl = `/auth/${loginType}/${props.space}`;
    const errorState = {
      oldpassword: '',
      password: '',
      repeatpassword: '',
    };
    let error = false;
    sendMessage('notification', false);
    sendMessage('login-spinner');
    if (isEmptyOrSpaces(data.oldpassword)) {
      error = true;
      errorState.oldpassword = 'Cannot be empty';
    }
    if (isEmptyOrSpaces(data.password)) {
      error = true;
      errorState.password = 'Cannot be empty';
    }
    if (data.password !== data.repeatpassword) {
      error = true;
      errorState.repeatpassword = 'Password does not match';
    }
    if (!error) {
      console.log('save');
      httpPost(
        `${baseAuthUrl}/changepassword`,
        {
          userId: authorization.userId,
          oldPassword: data.oldpassword,
          newPassword: data.password,
        },
        {
          headers: {
            Authorization: authorization.token,
          },
        }
      )
        .then((response: any) => {
          if (response.status === 200) {
            setData({
              oldpassword: '',
              password: '',
              repeatpassword: '',
            });
            setStage('passwordUpdated');
            sendMessage('login-notification', true, {
              type: 'success-main',
              message:
                'Your account password has been updated. You can login with your new password from next time',
            });
          } else {
            sendMessage('login-notification', true, {
              type: 'failure',
              message: 'Failed to update your password',
            });
          }
        })
        .catch(error => {
          if (error.response.status === 401) {
            errorState.oldpassword = 'Incorrect password';
          } else {
            sendMessage('login-notification', true, {
              type: 'failure',
              message: 'Failed to update your password',
            });
          }
        })
        .finally(() => {
          setErrors(errorState);
          sendMessage('login-spinner', false);
        });
    } else {
      console.log('error');
      setErrors(errorState);
      sendMessage('login-spinner', false);
    }
  };

  const handleSubmit = event => {
    if (stage === 'form') {
      // requestLink(event);
      changePassword(event);
    }
  };

  return (
    <>
      <form
        method="GET"
        onSubmit={handleSubmit}
        noValidate
        className="space-change-password-link"
      >
        {stage === 'form' && <></>}
        {stage === 'form' && (
          <div className="form-changepassword">
            <div>
              <div className="label">
                {!errors.oldpassword && (
                  <div className="label-text">Current password</div>
                )}
                {errors.oldpassword && (
                  <div className="error-text">
                    <OakIcon mat="warning" color="warning" size="20px" />
                    {errors.oldpassword}
                  </div>
                )}
              </div>
              <OakTextPlain
                id="oldpassword"
                type="password"
                placeholder="Type your current password"
                data={data}
                handleChange={e => handleChange(e)}
              />
            </div>
            <div>
              <div className="label">
                {!errors.password && (
                  <div className="label-text">New password</div>
                )}
                {errors.password && (
                  <div className="error-text">
                    <OakIcon mat="warning" color="warning" size="20px" />
                    {errors.password}
                  </div>
                )}
              </div>
              <OakTextPlain
                id="password"
                type="password"
                placeholder="Make it a good one"
                data={data}
                handleChange={e => handleChange(e)}
              />
            </div>
            <div>
              <div className="label">
                {!errors.repeatpassword && (
                  <div className="label-text">Repeat password</div>
                )}
                {errors.repeatpassword && (
                  <div className="error-text">
                    <OakIcon mat="warning" color="warning" size="20px" />
                    {errors.repeatpassword}
                  </div>
                )}
              </div>
              <OakTextPlain
                id="repeatpassword"
                type="password"
                placeholder="Don't forget it"
                data={data}
                handleChange={e => handleChange(e)}
              />
            </div>
          </div>
        )}
        <div className="action">
          {['form'].includes(stage) && (
            <OakButton variant="regular" theme="primary" action={handleSubmit}>
              Change Password
            </OakButton>
          )}
          {['form'].includes(stage) && <p className="hr">or</p>}
          <div className="button-link">
            <div className="link" onClick={props.goHome}>
              Back to Home
            </div>
          </div>
        </div>
      </form>
    </>
  );
};

export default ChangePassword;
