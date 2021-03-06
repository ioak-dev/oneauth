import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import OakPopoverMenu from '../../oakui/OakPopoverMenu';
import './style.scss';
import OakPrompt from '../../oakui/OakPrompt';
import { receiveMessage, sendMessage } from '../../events/MessageService';
import EditAdministrators from './EditAdministrators';
import OakModal from '../../oakui/OakModal';
import EditApp from './EditApp';
import { fetchRoles } from '../../actions/OaRoleActions';
import { deleteApp } from '../../actions/AppActions';
import AppDetails from './AppDetails';
import MapSpace from './MapSpace';

const appDomain = 'app';
const roleDomain = 'role';

interface Props {
  app: any;
}
const AppItem = (props: Props) => {
  const dispatch = useDispatch();
  const oaRoles = useSelector(state => state.oaRoles);
  const permittedSpace = useSelector(state => state.permittedSpace);
  const authorization = useSelector(state => state.authorization);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  const [spaceMapDialogOpen, setSpaceMapDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [countOfAdmins, setCountofAdmins] = useState<undefined | number>(0);
  const [countOfSpaces, setCountOfSpaces] = useState<undefined | number>(0);

  useEffect(() => {
    const eventBus = receiveMessage().subscribe(message => {
      if (message.name === appDomain && message.signal) {
        sendMessage('notification', true, {
          type: 'success',
          message: `${appDomain} ${message.data.action}`,
          duration: 5000,
        });
        if (message.data.action === 'updated') {
          setEditDialogOpen(false);
        }
        if (message.data.action === 'deleted') {
          setDeleteDialogOpen(false);
        }
      }
      if (message.name === roleDomain && message.signal) {
        sendMessage('notification', true, {
          type: 'success',
          message: `${roleDomain} ${message.data.action}`,
          duration: 5000,
        });
        if (message.data.action === 'updated') {
          setEditDialogOpen(false);
        }
      }
    });
    return () => eventBus.unsubscribe();
  });

  useEffect(() => {
    dispatch(fetchRoles(authorization));
  }, [authorization]);

  useEffect(() => {
    const existingAdmins = oaRoles.data.data?.filter(
      item => item.domainId === props.app._id
    );
    setCountofAdmins(existingAdmins?.length);
  }, [oaRoles.data.data]);

  useEffect(() => {
    const connectedSpace = permittedSpace.data?.filter(
      item => item.appId === props.app._id
    );
    console.log(connectedSpace.length);
    setCountOfSpaces(connectedSpace.length);
  }, [permittedSpace.data]);

  const editApp = () => {
    setEditDialogOpen(true);
  };

  const appDetails = () => {
    setDetailsDialogOpen(true);
  };
  const editAdmin = () => {
    setAdminDialogOpen(true);
  };

  const mapSpace = () => {
    setSpaceMapDialogOpen(true);
  };

  const confirmDeleteApp = () => {
    setDeleteDialogOpen(true);
  };

  const actionElements = props.app.protected
    ? [
        {
          label: 'Permitted Space',
          action: mapSpace,
          icon: 'edit',
        },
        {
          label: 'Details',
          action: editApp,
          icon: 'edit',
        },
        {
          label: 'Administrators',
          action: editAdmin,
          icon: 'people_alt',
        },
        {
          label: 'Roles',
          action: editAdmin,
          icon: 'vpn_key',
        },
        {
          label: 'Delete App',
          action: confirmDeleteApp,
          icon: 'delete',
        },
      ]
    : [
        {
          label: 'Details',
          action: editApp,
          icon: 'edit',
        },
        {
          label: 'Administrators',
          action: editAdmin,
          icon: 'people_alt',
        },
        {
          label: 'Roles',
          action: editAdmin,
          icon: 'vpn_key',
        },
        {
          label: 'Delete App',
          action: confirmDeleteApp,
          icon: 'delete',
        },
      ];

  return (
    <>
      <div className="oaapp-item" key={props.app._id}>
        <div className="content">
          <div
            className="title typography-8"
            onClick={appDetails}
          >{`${props.app.name}`}</div>
          <div className="redirect typography-6">{`${props.app.redirect}`}</div>
          <div className="statistics typography-4">
            <div className="administrators" onClick={editAdmin}>
              {countOfAdmins} Administrators
            </div>
            <div>
              {props.app.protected
                ? `${countOfSpaces} Connected Space(s)`
                : `Open App`}
            </div>
          </div>
        </div>
        <div className="action space-top-0">
          <OakPopoverMenu elements={actionElements} theme="primary" right>
            <div slot="label" className="action-item">
              <i className="material-icons">more_horiz</i>
            </div>
          </OakPopoverMenu>
        </div>

        <OakModal
          label="Map Space"
          visible={spaceMapDialogOpen}
          toggleVisibility={() => setSpaceMapDialogOpen(!spaceMapDialogOpen)}
        >
          <MapSpace
            app={props.app}
            toggleVisibilityHandler={() =>
              setSpaceMapDialogOpen(!spaceMapDialogOpen)
            }
          />
        </OakModal>

        <OakModal
          label="Edit App"
          visible={editDialogOpen}
          toggleVisibility={() => setEditDialogOpen(!editDialogOpen)}
        >
          <EditApp
            app={props.app}
            toggleVisibilityHandler={() => setEditDialogOpen(!editDialogOpen)}
          />
        </OakModal>
        <OakModal
          label="App Details"
          visible={detailsDialogOpen}
          toggleVisibility={() => setDetailsDialogOpen(!detailsDialogOpen)}
        >
          <AppDetails
            app={props.app}
            toggleVisibilityHandler={() =>
              setDetailsDialogOpen(!detailsDialogOpen)
            }
          />
        </OakModal>
        <OakModal
          label="App Administrators"
          visible={adminDialogOpen}
          toggleVisibility={() => setAdminDialogOpen(!adminDialogOpen)}
        >
          <EditAdministrators
            app={props.app}
            toggleVisibilityHandler={() => setAdminDialogOpen(!adminDialogOpen)}
          />
        </OakModal>
        <OakPrompt
          action={() => dispatch(deleteApp(authorization, props.app.appId))}
          visible={deleteDialogOpen}
          toggleVisibility={() => setDeleteDialogOpen(!deleteDialogOpen)}
        />
      </div>
    </>
  );
};

export default AppItem;
