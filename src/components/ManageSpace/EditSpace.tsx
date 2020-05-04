import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './style.scss';
import OakText from '../../oakui/OakText';
import OakButton from '../../oakui/OakButton';
import { updateSpace } from '../../actions/SpaceActions';
import { isEmptyOrSpaces } from '../Utils';
import { sendMessage } from '../../events/MessageService';

interface Props {
  space: any;
  toggleVisibilityHandler: Function;
}

const EditSpace = (props: Props) => {
  const dispatch = useDispatch();
  const authorization = useSelector(state => state.authorization);
  const [view, setView] = useState({
    day: '',
    hour: '',
    minutes: '',
    name: '',
  });
  const [spaceData, setSpaceData] = useState({});

  useEffect(() => {
    setSpaceData(props.space);
  }, [props.space]);

  useEffect(() => {
    const expiry = convertor(props.space.sessionExpiry);
    setView({
      ...view,
      day: `${expiry.day}`,
      hour: `${expiry.hour}`,
      minutes: `${expiry.minutes}`,
      name: props.space.name,
    });
  }, [props.space.sessionExpiry]);

  const convertor = data => {
    const day = Math.floor(data / (60 * 24));
    const hour = Math.floor((data - day * 1440) / 60);
    const minutes = data % 60;
    return { day, hour, minutes };
  };

  const handleChange = event => {
    setView({
      ...view,
      [event.target.name]: event.target.value,
    });
  };

  const validateEmptyText = (text, message) => {
    if (isEmptyOrSpaces(text)) {
      sendMessage('notification', true, {
        type: 'failure',
        message,
        duration: 5000,
      });
      return false;
    }
    return true;
  };

  const editSpace = () => {
    if (
      validateEmptyText(view.name, 'Space name cannot be empty') &&
      validateEmptyText(
        view.day || view.hour || view.minutes,
        'Session Expiry is not provided'
      )
    ) {
      const localSessionExpiry = `${+view.day * 24 * 60 +
        +view.hour * 60 +
        +view.minutes}`;
      setSpaceData({
        ...spaceData,
        name: view.name,
        sessionExpiry: localSessionExpiry,
      });
      dispatch(updateSpace(authorization, spaceData));
    }
  };

  return (
    <>
      <div className="modal-body">
        <OakText
          data={view}
          id="name"
          label="Space Name"
          handleChange={e => handleChange(e)}
        />
        <div className="session-expiry">
          <OakText
            data={view}
            id="day"
            type="number"
            label="Expiry in days"
            handleChange={e => handleChange(e)}
          />
          <OakText
            data={view}
            id="hour"
            type="number"
            label="Expiry in hours"
            handleChange={e => handleChange(e)}
          />
          <OakText
            data={view}
            id="minutes"
            type="number"
            label="Expiry in minutes"
            handleChange={e => handleChange(e)}
          />
        </div>
      </div>
      <div className="modal-footer">
        <OakButton
          action={props.toggleVisibilityHandler}
          theme="default"
          variant="animate in"
          align="left"
        >
          <i className="material-icons">close</i>Cancel
        </OakButton>
        <OakButton
          theme="primary"
          action={editSpace}
          variant="animate none"
          align="right"
        >
          <i className="material-icons">double_arrow</i>Update
        </OakButton>
      </div>
    </>
  );
};

export default EditSpace;
