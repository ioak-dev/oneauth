import React, { useState } from 'react';

import { useSelector } from 'react-redux';
import './profile-settings.scss';
import { NavLink } from 'react-router-dom';
import { Authorization, Profile } from '../Types/GeneralTypes';
import OakTab from '../../oakui/OakTab';
import OakText from '../../oakui/OakText';
import OakButton from '../../oakui/OakButton';
import { httpPost } from '../Lib/RestTemplate';
import { sendMessage } from '../../events/MessageService';
import OakTextPlain from '../../oakui/OakTextPlain';
import { isEmptyOrSpaces } from '../Utils';
import OakIcon from '../../oakui/OakIcon';

interface Props {
  space: string;
}

const ProfileSettings = (props: Props) => {
  const authorization = useSelector(state => state.authorization);
  const [data, setData] = useState({
    firstName: '',
    lastName: '',
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    repeatPassword: '',
  });

  const [errors, setErrors] = useState({
    oldPassword: '',
    newPassword: '',
    repeatpassword: '',
  });

  const [meta, setMeta] = useState([
    { slotName: 'details', label: 'Basic details', icon: 'subject' },
    { slotName: 'password', label: 'Change Password', icon: 'security' },
  ]);

  const handlePasswordChange = event => {
    setPasswordData({
      ...passwordData,
      [event.target.name]: event.target.value,
    });
  };

  const handleUserDetailsChange = event => {
    setData({
      ...data,
      [event.target.name]: event.target.value,
    });
  };

  const updatePassword = () => {
    const errorState = {
      oldPassword: '',
      newPassword: '',
      repeatpassword: '',
    };
    let error = false;
    sendMessage('notification', false);

    if (passwordData.newPassword !== passwordData.repeatPassword) {
      error = true;
      errorState.repeatpassword = 'Password does not match';
      setErrors(errorState);
    }
    if (passwordData.oldPassword === passwordData.newPassword) {
      error = true;
      errorState.newPassword = 'Old and new password cannot be same';
      setErrors(errorState);
    }
    if (!error) {
      let baseAuthUrl = '/auth/oa';
      if (props.space) {
        baseAuthUrl = `/auth/${props.space}`;
      }
      httpPost(
        `${baseAuthUrl}/changepassword`,
        {
          userId: authorization.userId,
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword,
        },
        {
          headers: {
            Authorization: authorization.token,
          },
        }
      )
        .then((response: any) => {
          if (response.status === 200) {
            setPasswordData({
              oldPassword: '',
              newPassword: '',
              repeatPassword: '',
            });
          } else {
            sendMessage('notification', true, {
              type: 'failure',
              message: 'Failed with error',
              duration: 3000,
            });
          }
        })
        .catch(error => {
          if (error.response.status === 401) {
            sendMessage('notification', true, {
              type: 'failure',
              message:
                'Password incorrect. Please enter your right credentials to update password',
              duration: 3000,
            });
          } else {
            sendMessage('notification', true, {
              type: 'failure',
              message: 'Failed with error',
              duration: 3000,
            });
          }
        })
        .finally(() => {
          console.log(errorState);
          setErrors(errorState);
          sendMessage('login-spinner', false);
        });
    }
  };

  const updateUserDetails = () => {
    let baseAuthUrl = '/user';
    if (props.space) {
      baseAuthUrl = `/user/${props.space}`;
    }
    httpPost(
      `${baseAuthUrl}/updateprofile`,
      {
        userId: authorization.userId,
        firstName: data.firstName,
        lastName: data.lastName,
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
            firstName: '',
            lastName: '',
          });
        } else {
          sendMessage('notification', true, {
            type: 'failure',
            message: 'Failed with error',
            duration: 3000,
          });
        }
      })
      .catch(error => {
        if (error.response.status === 401) {
          sendMessage('notification', true, {
            type: 'failure',
            message: 'Something went wrong, please contact support.',
            duration: 3000,
          });
        } else {
          sendMessage('notification', true, {
            type: 'failure',
            message: 'Failed with error',
            duration: 3000,
          });
        }
      });
  };

  return (
    <div className="profile-settings">
      <OakTab meta={meta}>
        <div slot="details">
          <OakText
            type="text"
            label="First Name"
            data={data}
            id="firstName"
            handleChange={e => handleUserDetailsChange(e)}
          />
          <OakText
            type="text"
            label="Last Name"
            data={data}
            id="lastName"
            handleChange={e => handleUserDetailsChange(e)}
          />

          <OakButton theme="primary" variant="drama" action={updateUserDetails}>
            Update details
          </OakButton>
        </div>

        <div slot="password" className="change-password">
          {errors.newPassword && (
            <div className="error-text">
              <OakIcon mat="warning" color="warning" size="20px" />
              {errors.newPassword}
            </div>
          )}
          <OakText
            type="password"
            label="Old password"
            data={passwordData}
            id="oldPassword"
            handleChange={e => handlePasswordChange(e)}
          />
          <OakText
            type="password"
            label="New password"
            data={passwordData}
            id="newPassword"
            handleChange={e => handlePasswordChange(e)}
          />
          <div>
            {errors.repeatpassword && (
              <div className="error-text">
                <OakIcon mat="warning" color="warning" size="20px" />
                {errors.repeatpassword}
              </div>
            )}
          </div>
          <OakText
            type="password"
            label="Retype password"
            data={passwordData}
            id="repeatPassword"
            handleChange={e => handlePasswordChange(e)}
          />
          <OakButton theme="primary" variant="drama" action={updatePassword}>
            Update password
          </OakButton>
        </div>
      </OakTab>
    </div>
  );
};

export default ProfileSettings;
