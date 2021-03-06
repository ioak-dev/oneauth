import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import OakAutoComplete from '../../oakui/OakAutoComplete';
import OakButton from '../../oakui/OakButton';
import { updatePermittedSpace } from '../../actions/PermittedSpaceAction';
import MapSpaceItem from './MapSpaceItem';

interface Props {
  app: any;
  toggleVisibilityHandler: Function;
}

const MapSpace = (props: Props) => {
  const dispatch = useDispatch();
  const authorization = useSelector(state => state.authorization);
  const oaSpace = useSelector(state => state.space);
  const permittedSpace = useSelector(state => state.permittedSpace);
  const [items, setItems] = useState<undefined | any[]>([{}]);
  const [data, setData] = useState({
    autoCompleteDropdownData: [{}],
  });

  useEffect(() => {
    const spaceList: any[] = [];
    permittedSpace.data?.filter(item =>
      item.appId === props.app._id ? spaceList.push({ id: item.spaceId }) : ''
    );

    const existingSpacelist: any[] = [];
    const availableSpaceList: any[] = [];
    oaSpace?.data.filter(val => {
      return spaceList.some(item => {
        return val.spaceId === item.id;
      })
        ? existingSpacelist.push(val)
        : availableSpaceList.push({ key: val.spaceId, value: val.name });
    });

    setItems(existingSpacelist);
    setData({ autoCompleteDropdownData: availableSpaceList });
  }, [permittedSpace.data, oaSpace.data]);

  const handleAutoCompleteChange = (value: string) => {
    dispatch(
      updatePermittedSpace(authorization, {
        appId: props.app._id,
        spaceId: value,
      })
    );
  };

  return (
    <>
      <div className="modal-body">
        <div className="autocomplete-space space-bottom-2">
          <OakAutoComplete
            placeholder="Search by space name"
            handleChange={handleAutoCompleteChange}
            objects={data.autoCompleteDropdownData}
          />
        </div>
        <div
          className="oaapp-view space-top-2 space-bottom-4"
          key={oaSpace._id}
        >
          <div className="list-view-header typography-5">
            <div className="label">Name</div>
            <div className="label">SpaceId</div>
            <div className="label" />
          </div>
          {items?.map(item => (
            <MapSpaceItem
              appSpaceItem={item}
              appId={props.app._id}
              key={item._id}
            />
          ))}
        </div>
      </div>
      <div className="modal-footer">
        <OakButton
          action={props.toggleVisibilityHandler}
          theme="default"
          variant="appear"
          align="left"
        >
          <i className="material-icons">close</i>Close
        </OakButton>
      </div>
    </>
  );
};

export default MapSpace;
