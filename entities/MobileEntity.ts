type VideoProp = {
  resolution: string;
  fps: number;
};

type CameraInfo = {
  name: string;
  videoFormat: VideoProp[];
};

export type MobileInfo = {
  id: string;
  name: string;
  cameras: CameraInfo[];
};
