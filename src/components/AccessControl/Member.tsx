import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheck,
  faCross,
  faPencilAlt,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { faTrashAlt } from '@fortawesome/free-regular-svg-icons';

import './Member.scss';

import OakClickArea from '../../oakui/wc/OakClickArea';
import OakButton from '../../oakui/wc/OakButton';
import OakCheckbox from '../../oakui/wc/OakCheckbox';
import OakCheckboxGroup from '../../oakui/wc/OakCheckboxGroup';
import { newId } from '../../events/MessageService';
import { updateRoles, deleteRoles } from '../../actions/OaRoleActions';

interface Props {
  domainId: string;
  domainType: string;
  userId: string;
  roles: any[];
  rolesMaster: string[];
}

const Member = (props: Props) => {
  const { id, userId }: any = useParams();
  const [showEdit, setShowEdit] = useState(false);
  const [roleNames, setRoleNames] = useState<string[]>([]);
  const dispatch = useDispatch();
  const authorization = useSelector((state: any) => state.authorization);
  const [confirmPromptOpen, setConfirmPromptOpen] = useState(false);
  const user = useSelector((state: any) =>
    state.oaUsers?.data?.find((item: any) => item._id === props.userId)
  );

  useEffect(() => {
    const _roleNames: string[] = [];
    props.roles.forEach((item) => {
      _roleNames.push(item.name);
    });
    setRoleNames(_roleNames);
  }, [props.roles]);

  const handleChange = (detail: any) => {
    const _roleNames = roleNames.filter((item) => item !== detail.name);
    if (detail.value) {
      if (detail.value) {
        _roleNames.push(detail.name);
      }
    }
    setRoleNames(_roleNames);
  };

  const save = () => {
    const _originalRoleNames: string[] = [];
    props.roles.forEach((item) => {
      _originalRoleNames.push(item.name);
    });
    _originalRoleNames.forEach((item) => {
      if (!roleNames.includes(item)) {
        dispatch(
          deleteRoles(
            authorization,
            props.domainType,
            props.userId,
            props.domainId,
            item
          )
        );
      }
    });

    roleNames.forEach((item) => {
      if (!_originalRoleNames.includes(item)) {
        dispatch(
          updateRoles(authorization, {
            type: props.domainType,
            userId: props.userId,
            domainId: props.domainId,
            name: item,
          })
        );
      }
    });

    setShowEdit(false);
  };

  const formId = newId();

  return (
    <>
      {showEdit && (
        <div className="member-edit">
          <div className="member-view__left">
            <OakCheckboxGroup
              checkboxGroupName={formId}
              name="role"
              handleChange={handleChange}
            >
              {props.rolesMaster.map((item) => (
                <OakCheckbox
                  name={item}
                  value={roleNames.includes(item)}
                  checkboxGroupName={formId}
                >
                  {item}
                </OakCheckbox>
              ))}
            </OakCheckboxGroup>
          </div>
          <div className="member-view__right">
            <OakButton handleClick={save} theme="primary" shape="icon">
              <FontAwesomeIcon icon={faCheck} />
            </OakButton>
            <OakButton
              handleClick={() => setShowEdit(false)}
              theme="default"
              shape="icon"
            >
              <FontAwesomeIcon icon={faTimes} />
            </OakButton>
          </div>
        </div>
      )}
      {!showEdit && (
        <div className="member-view">
          <OakClickArea handleClick={() => setShowEdit(true)}>
            <div className="member-view__left">
              <div className="member-view__left__name">{`${user.given_name} ${user.family_name}`}</div>
              <div className="member-view__left__description">
                {props.roles?.map((item) => (
                  <div key={item._id}>{item.name}</div>
                ))}
              </div>
            </div>
          </OakClickArea>
          <div className="member-view__right">
            <OakButton
              handleClick={() => {}}
              theme="danger"
              shape="icon"
              variant="drama"
            >
              <FontAwesomeIcon icon={faTrashAlt} />
            </OakButton>
          </div>
        </div>
      )}
    </>
  );
};

export default Member;
