import React, { useEffect, useState } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import { withRouter } from 'react-router';
import { withCookies } from 'react-cookie';
import { getProfile, setProfile } from '../../actions/ProfileActions';

import './style.scss';
import Desktop from './Desktop';
import Mobile from './Mobile';

import { Authorization, Profile } from '../Types/GeneralTypes';
import { receiveMessage, sendMessage } from '../../events/MessageService';
import { httpPost } from '../Lib/RestTemplate';
import OakModal from '../../oakui/OakModal';
import OakTab from '../../oakui/OakTab';
import ProfileSettings from './ProfileSettings';

interface Props {
  sendEvent: Function;
  getAuth: Function;
  addAuth: Function;
  removeAuth: Function;
  authorization: Authorization;
  getProfile: Function;
  setProfile: Function;
  profile: Profile;
  login: Function;
  transparent: boolean;
  logout: Function;
  toggleSettings: any;
  history: any;
  cookies: any;
  location: any;
  match: any;
}

const Navigation = (props: Props) => {
  const dispatch = useDispatch();
  const profile = useSelector(state => state.profile);
  const [data, setData] = useState({
    visible: false,
    mobilemenu: 'hide',
    chooseTheme: false,
    showSettings: false,
    transparentNavBar: false,
    firstLoad: true,
    showNavbar: false,
    editProfileDialog: false,
  });

  const [space, setSpace] = useState('');

  useEffect(() => {
    receiveMessage().subscribe(event => {
      if (event.name === 'spaceChange') {
        setSpace(event.data);
      }
    });
  }, []);

  useEffect(() => {
    receiveMessage().subscribe(message => {
      if (message.name === 'navbar') {
        setData({ ...data, showNavbar: message.signal });
      }
      if (message.name === 'loggedin') {
        // props.reloadProfile(nextProps.authorization);
        setData({ ...data, firstLoad: false });
      }
    });
  }, []);

  useEffect(() => {
    if (data.firstLoad && props.authorization && props.authorization.isAuth) {
      setData({ ...data, firstLoad: false });
    }
  }, [props.authorization.isAuth]);

  const toggleDarkMode = () => {
    if (props.profile.theme === 'theme_dark') {
      props.setProfile({
        ...props.profile,
        theme: 'theme_light',
      });
    } else {
      props.setProfile({
        ...props.profile,
        theme: 'theme_dark',
      });
    }
  };

  const login = type => {
    if (space) {
      props.history.push(`/space/${space}/login?type=${type}`);
    } else {
      props.history.push(`/login?type=${type}`);
    }
  };

  const logout = () => {
    let baseAuthUrl = '/auth/oa';
    let authKey = props.cookies.get('oneauth');
    if (space) {
      authKey = props.cookies.get(space);
      baseAuthUrl = `/auth/${space}`;
    }

    httpPost(`${baseAuthUrl}/session/${authKey}/invalidate`, null, null).then(
      (response: any) => {
        if (response.status === 200 || response.status === 404) {
          props.removeAuth();
          if (space) {
            props.cookies.remove(space);
            props.history.push(`/space/${space}/home`);
            sendMessage('notification', true, {
              type: 'success',
              message: `Signed out of space ${space}`,
              duration: 3000,
            });
          } else {
            props.cookies.remove('oneauth');
            props.history.push(`/home`);
            sendMessage('notification', true, {
              type: 'success',
              message: `Signed out of oneauth`,
              duration: 3000,
            });
          }
        }
      }
    );
  };

  const toggleSettings = () => {
    setData({ ...data, showSettings: !data.showSettings });
  };

  return (
    <>
      {data.showNavbar && (
        <div className="nav">
          <Desktop
            {...props}
            logout={logout}
            login={login}
            toggleSettings={toggleSettings}
            transparent={data.transparentNavBar}
            toggleDarkMode={toggleDarkMode}
            space={space}
            editProfile={() => setData({ ...data, editProfileDialog: true })}
          />
          <Mobile
            {...props}
            logout={logout}
            login={login}
            toggleSettings={toggleSettings}
            transparent={data.transparentNavBar}
            toggleDarkMode={toggleDarkMode}
            space={space}
          />
          <OakModal
            fullscreen
            label="User profile settings"
            visible={data.editProfileDialog}
            toggleVisibility={() =>
              setData({ ...data, editProfileDialog: !data.editProfileDialog })
            }
          >
            <div className="modal-body">
              <ProfileSettings space={space} />
            </div>
          </OakModal>
        </div>
      )}
    </>
  );
};

const mapStateToProps = state => ({
  profile: state.profile,
});

export default connect(mapStateToProps, { getProfile, setProfile })(
  withCookies(withRouter(Navigation))
);
