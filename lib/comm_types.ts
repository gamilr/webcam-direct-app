import { encode, decode } from '@msgpack/msgpack';

// MessagePack serialization/deserialization functions
export function msgpackSer<T>(data: T): Uint8Array | null {
  try {
    return encode(data);
  } catch (e) {
    console.error(`Failed to serialize data: ${e}`);
    return null;
  }
}

export function msgpackDes<T>(data: Uint8Array): T | null {
  try {
    return decode(data) as T;
  } catch (e) {
    console.error(`Failed to deserialize data: ${e}`);
    return null;
  }
}

// DataChunk represents a chunk of data with remaining length and buffer
export interface DataChunk {
  // Remaining length of the data
  r: number;
  // Buffer containing the data
  d: Uint8Array;
}

// Convert functions for DataChunk
export function dataChunkFromBytes(bytes: Uint8Array): DataChunk | null {
  return msgpackDes<DataChunk>(bytes);
}

export function dataChunkToBytes(data: DataChunk): Uint8Array | null {
  return msgpackSer(data);
}

// SDP Offer and Answer
export interface VideoProp {
  resolution: [number, number];
  fps: number;
}

export interface CameraSdp {
  name: string;
  format: VideoProp;
  sdp: string;
}

// Mobile Sdp Offer will be sent to the host to establish the connection
export interface MobileSdpOffer {
  mobile_id: string;
  camera_offer: CameraSdp[];
}

export function mobileSdpOfferFromBytes(bytes: Uint8Array): MobileSdpOffer | null {
  return msgpackDes<MobileSdpOffer>(bytes);
}

export function mobileSdpOfferToBytes(data: MobileSdpOffer): Uint8Array | null {
  return msgpackSer(data);
}

// Mobile Sdp Answer will be sent to the mobile to establish the connection
export interface MobileSdpAnswer {
  camera_answer: CameraSdp[];
}

export function mobileSdpAnswerFromBytes(bytes: Uint8Array): MobileSdpAnswer | null {
  return msgpackDes<MobileSdpAnswer>(bytes);
}

export function mobileSdpAnswerToBytes(data: MobileSdpAnswer): Uint8Array | null {
  return msgpackSer(data);
}

// Provisioning information of the host
export interface HostProvInfo {
  id: string;
  name: string;
  connection_type: string;
}

export function hostProvInfoFromBytes(bytes: Uint8Array): HostProvInfo | null {
  return msgpackDes<HostProvInfo>(bytes);
}

export function hostProvInfoToBytes(data: HostProvInfo): Uint8Array | null {
  return msgpackSer(data);
}

// Call notification to mobile that the answer is ready
export interface SdpAnswerReady {
  mobile_id: string;
}

export function sdpAnswerReadyFromBytes(bytes: Uint8Array): SdpAnswerReady | null {
  return msgpackDes<SdpAnswerReady>(bytes);
}

export function sdpAnswerReadyToBytes(data: SdpAnswerReady): Uint8Array | null {
  return msgpackSer(data);
}

// MobileSchema type definitions and conversion
export interface MobileSchema {
  id: string;
  name: string;
  // Add other properties as needed
}

export function mobileSchemaFromBytes(bytes: Uint8Array): MobileSchema | null {
  return msgpackDes<MobileSchema>(bytes);
}

export function mobileSchemaToBytes(data: MobileSchema): Uint8Array | null {
  return msgpackSer(data);
}
