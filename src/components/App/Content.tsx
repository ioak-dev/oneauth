import React, { useEffect } from 'react';
import { Route } from 'react-router-dom';
import './style.scss';
import { HashRouter } from 'react-router-dom/cjs/react-router-dom.min';
import { withCookies } from 'react-cookie';
import { connect } from 'react-redux';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import Home from '../Home';
import SpaceLogin from '../Login/SpaceLogin';
import Landing from '../Landing';
import PrivateRoute from '../Auth/PrivateRoute';
import AuthInit from '../Auth/AuthInit';
import { getAuth, addAuth, removeAuth } from '../../actions/AuthActions';
import { getProfile, setProfile } from '../../actions/ProfileActions';

import Notification from '../Notification';
import Navigation from '../Navigation';
import { httpGet } from '../Lib/RestTemplate';
import { Authorization } from '../Types/GeneralTypes';
import { receiveMessage, sendMessage } from '../../events/MessageService';
import Tenant from '../Tenant';
import constants from '../Constants';
import OaLogin from '../Login/OaLogin';
import OakRoute from '../Auth/OakRoute';
import ManageSpace from '../ManageSpace';
import ManageApp from '../ManageApp';
import SpaceHome from '../SpaceHome';
import TestPage from '../SpacePages/TestPage';

const themes = {
  themecolor1: getTheme('#69A7BF'),
  themecolor2: getTheme('#99587B'),
  themecolor3: getTheme('#A66C26'),
  themecolor4: getTheme('#37AE82'),
};

function getTheme(color: string) {
  return createMuiTheme({
    palette: {
      primary: {
        main: color,
      },
      secondary: {
        main: color,
      },
    },
  });
}

interface Props {
  getProfile: Function;
  setProfile: Function;
  getAuth: Function;
  addAuth: Function;
  removeAuth: Function;
  cookies: any;

  // event: PropTypes.object,
  profile: any;
  authorization: Authorization;
}

const Content = (props: Props) => {
  useEffect(() => {
    props.getProfile();
    props.getAuth();
    props.getAuth();
  }, []);

  useEffect(() => {
    const eventBus = receiveMessage().subscribe(message => {
      if (message.name === 'session expired') {
        logout(null, 'failure', 'Session expired. Login again');
      }
    });
    return () => eventBus.unsubscribe();
  });

  const logout = (
    event: any,
    type = 'success',
    message = 'You have been logged out'
  ) => {
    props.removeAuth();
    props.cookies.remove('oneauth');
    sendMessage('notification', true, {
      type,
      message,
      duration: 3000,
    });
  };

  return (
    <div
      className={`App ${props.profile.theme} ${props.profile.textSize} ${props.profile.themeColor}`}
    >
      <HashRouter>
        {/* <AuthInit /> */}
        <div className="body">
          <div className="body-content">
            <Notification />
            <MuiThemeProvider theme={themes.themecolor1}>
              <Route
                exact
                path="/home"
                render={propsLocal => (
                  <OakRoute
                    {...propsLocal}
                    {...props}
                    logout={() => logout}
                    component={Home}
                    middleware={['readAuthenticationOa']}
                  />
                )}
              />
              <Route
                exact
                path="/"
                render={propsLocal => (
                  <OakRoute
                    {...propsLocal}
                    {...props}
                    logout={() => logout}
                    component={Home}
                    middleware={['readAuthenticationOa']}
                  />
                )}
              />
              <Route
                path="/space/:tenant/login"
                render={(propsLocal: any) => (
                  <OakRoute
                    {...propsLocal}
                    {...props}
                    logout={() => logout}
                    component={SpaceLogin}
                  />
                )}
              />
              <Route
                exact
                path="/space/:tenant/home"
                render={(propsLocal: any) => (
                  <OakRoute
                    {...propsLocal}
                    {...props}
                    logout={() => logout}
                    component={SpaceHome}
                    middleware={['readAuthenticationSpace']}
                  />
                )}
              />
              <Route
                exact
                path="/space/:tenant"
                render={(propsLocal: any) => (
                  <OakRoute
                    {...propsLocal}
                    {...props}
                    logout={() => logout}
                    component={SpaceHome}
                    middleware={['readAuthenticationSpace']}
                  />
                )}
              />
              <Route
                exact
                path="/space/:tenant/test"
                render={(propsLocal: any) => (
                  <OakRoute
                    {...propsLocal}
                    {...props}
                    logout={() => logout}
                    component={TestPage}
                    middleware={['authenticateSpace']}
                  />
                )}
              />
              <Route
                path="/login"
                render={(propsLocal: any) => (
                  <OakRoute
                    {...propsLocal}
                    {...props}
                    logout={() => logout}
                    component={OaLogin}
                  />
                )}
              />
              {/* <Route
                path="/"
                exact
                render={(propsLocal: any) => (
                  <Home {...propsLocal} {...props} logout={() => logout} />
                )}
              /> */}
              <Route
                path="/managespace"
                exact
                render={propsLocal => (
                  <OakRoute
                    {...propsLocal}
                    {...props}
                    logout={() => logout}
                    component={ManageSpace}
                    middleware={['authenticateOa']}
                  />
                )}
              />
              <Route
                path="/manageapp"
                exact
                render={propsLocal => (
                  <OakRoute
                    {...propsLocal}
                    {...props}
                    logout={() => logout}
                    component={ManageApp}
                    middleware={['authenticateOa']}
                  />
                )}
              />
            </MuiThemeProvider>
          </div>
        </div>
      </HashRouter>
    </div>
  );
};

const mapStateToProps = (state: any) => ({
  authorization: state.authorization,
  user: state.user,
  profile: state.profile, // ,
  //   event: state.event
});

export default connect(mapStateToProps, {
  getAuth,
  addAuth,
  removeAuth,
  getProfile,
  setProfile,
})(withCookies(Content));
