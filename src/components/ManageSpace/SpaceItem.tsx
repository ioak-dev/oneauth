import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import OakPopoverMenu from '../../oakui/OakPopoverMenu';
import './style.scss';
import OakPrompt from '../../oakui/OakPrompt';
import { deleteSpace } from '../../actions/SpaceActions';
import { receiveMessage, sendMessage } from '../../events/MessageService';
import EditAdministrators from './EditAdministrators';
import OakModal from '../../oakui/OakModal';
import EditSpace from './EditSpace';
import { fetchRoles } from '../../actions/OaRoleActions';

const domain = ['space', 'role'];

interface Props {
  space: any;
  id: string;
}
const SpaceItem = (props: Props) => {
  const dispatch = useDispatch();
  const oaRoles = useSelector(state => state.oaRoles);
  const authorization = useSelector(state => state.authorization);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [countOfAdmins, setCountofAdmins] = useState<undefined | number>(0);

  useEffect(() => {
    const eventBus = receiveMessage().subscribe(message => {
      if (message.name === domain[0] && message.signal) {
        sendMessage('notification', true, {
          type: 'success',
          message: `${domain[0]} ${message.data.action}`,
          duration: 5000,
        });
        if (message.data.action === 'updated') {
          setEditDialogOpen(false);
        }
        if (message.data.action === 'deleted') {
          setDeleteDialogOpen(false);
        }
      }
      if (message.name === domain[1] && message.signal) {
        sendMessage('notification', true, {
          type: 'success',
          message: `${domain[1]} ${message.data.action}`,
          duration: 5000,
        });
        if (message.data.action === 'updated') {
          setAdminDialogOpen(false);
          setEditDialogOpen(false);
        }
        if (message.data.action === 'deleted') {
          setAdminDialogOpen(false);
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
      item => item.domainId === props.space._id
    );

    setCountofAdmins(existingAdmins?.length);
  }, [oaRoles.data.data]);

  const editSpace = () => {
    setEditDialogOpen(true);
  };

  const editAdmin = () => {
    setAdminDialogOpen(true);
  };

  const confirmDeleteSpace = () => {
    setDeleteDialogOpen(true);
  };

  const actionElements = [
    {
      label: 'Edit Space',
      action: editSpace,
      icon: 'library_add_check',
    },
    {
      label: 'Delete Space',
      action: confirmDeleteSpace,
      icon: 'apps',
    },
    {
      label: 'Update Admin',
      action: editAdmin,
      icon: 'people_alt',
    },
  ];

  return (
    <>
      <div className="space-item" key={props.space.id}>
        <div className="content">
          <div className="title typography-8">{`${props.space.name} (${props.space.spaceId})`}</div>
          <div className="statistics typography-4">
            <div className="administrators" onClick={editAdmin}>
              {countOfAdmins} Administrators
            </div>
            <div>2 Connected Apps</div>
          </div>
        </div>
        <div className="action space-top-0">
          <OakPopoverMenu elements={actionElements} theme="primary" right>
            <div slot="label" className="action-item">
              <i className="material-icons">more_horiz</i>
            </div>
          </OakPopoverMenu>
        </div>
      </div>

      <OakModal
        label="Edit space"
        visible={editDialogOpen}
        toggleVisibility={() => setEditDialogOpen(!editDialogOpen)}
      >
        <EditSpace space={props.space} />
      </OakModal>
      <OakModal
        label="Space Administrators"
        visible={adminDialogOpen}
        toggleVisibility={() => setAdminDialogOpen(!adminDialogOpen)}
      >
        <EditAdministrators space={props.space} />
      </OakModal>
      <OakPrompt
        action={() => dispatch(deleteSpace(authorization, props.space.spaceId))}
        visible={deleteDialogOpen}
        toggleVisibility={() => setDeleteDialogOpen(!deleteDialogOpen)}
      />
    </>
  );
};

export default SpaceItem;
