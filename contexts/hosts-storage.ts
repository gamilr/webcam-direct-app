import { createContext } from 'react';
import { RegisteredHost } from '../entities/HostEntity';

type RegisteredHostsStorageType = {
  loading: boolean;
  registeredHosts: RegisteredHost[];
  error: string | null;
  addHost: (host: RegisteredHost) => Promise<void>;
  removeHost: (id: string) => Promise<void>;
};

const RegisteredHostsStorageContext = createContext<RegisteredHostsStorageType>({
  loading: true,
  registeredHosts: [],
  error: null,
  addHost: async () => {},
  removeHost: async () => {},
});

export default RegisteredHostsStorageContext;
