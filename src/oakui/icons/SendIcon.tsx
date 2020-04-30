import React from 'react';

interface Props {
  style: object;
}
const SendIcon = (props: Props) => {
  return (
    <svg
      version="1.0"
      id="Layer_1"
      x="0px"
      y="0px"
      width="57px"
      height="56px"
      viewBox="0 0 57 56"
      enableBackground="new 0 0 57 56"
      style={props.style}
    >
      <g id="Chat-Fenster">
        <g
          id="chat_FAQ_Accordion2-Copy-13"
          transform="translate(-1364.000000, -1001.000000)"
        >
          <g id="Send-Message" transform="translate(397.000000, 1008.000000)">
            <g id="Send-Button" transform="translate(990.000000, 10.000000)">
              <g id="Base_1_">
                <path
                  d="M5.5-15L5.5-15c14.4,0,26,11.6,26,26l0,0c0,14.4-11.6,26-26,26l0,0
						c-14.4,0-26-11.6-26-26l0,0C-20.5-3.4-8.9-15,5.5-15z"
                />
              </g>
              <g id="Send_1_">
                <path
                  fill="#FFFFFF"
                  d="M16,0.5c-0.1-0.1-0.3-0.1-0.4-0.1L-7,10.8c-0.1,0.1-0.2,0.2-0.2,0.3s0.1,0.3,0.2,0.3l6.4,3.1
						c0.1,0.1,0.3,0,0.4,0L6,9.9l-4.9,4.9C1,14.9,1,15,1,15.1l0.5,6.2c0,0.1,0.1,0.3,0.2,0.3h0.1c0.1,0,0.2,0,0.3-0.1l3.4-3.9l4.2,2
						c0.1,0,0.2,0,0.3,0s0.2-0.1,0.2-0.2l5.9-18.6C16.1,0.7,16.1,0.6,16,0.5z"
                />
              </g>
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
};

export default SendIcon;
