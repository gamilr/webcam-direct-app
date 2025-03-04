export type VideoProp = {
  resolution: [number, number];
  fps: number;
};

export type CameraSdp = {
  name: string;
  format: VideoProp;
  sdp: string;
};

export type MobileSdpOffer = {
  mobile_id: string;
  camera_offer: [CameraSdp];
};

export type MobileSdpAnswer = {
  camera_answer: [CameraSdp];
};
