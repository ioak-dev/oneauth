import React, { useEffect } from 'react';
import './style.scss';
import Navigation from '../Navigation';
import { sendMessage } from '../../events/MessageService';

interface Props {
  label?: string;
  logout: Function;
}
const Home = (props: Props) => {
  useEffect(() => {
    sendMessage('navbar', true);
  }, []);
  return (
    <div className="page-home">
      <div className="app-container smooth-page page-home--title">
        Secure identity and authentication provider
      </div>
      <div className="page-home--subtitle">
        Oneauth handles user account setup, password management and
        authentication needs of your organization. Connect all your
        applications/assets with a single user account per user. Supports
        sign-in with social identity providers such as Google, Outlook and
        Facebook.
      </div>
    </div>
  );
};

export default Home;
