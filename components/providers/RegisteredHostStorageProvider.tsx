import { ReactNode, useEffect, useState } from 'react';
import { RegisteredHost } from '../../entities/HostEntity';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ToastError } from '../ui/ToastMsg';
import RegisteredHostsStorageContext from '../../contexts/hosts-storage';

const hostKey = 'registeredHosts';

const RegisteredHostStorageProvider = ({ children }: { children: ReactNode }) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [registeredHosts, setRegisteredHosts] = useState<RegisteredHost[]>([]);

  useEffect(() => {
    const loadInitialHosts = async () => {
      try {
        setLoading(true);
        let hostsStored = (await AsyncStorage.getItem(hostKey)) || '[]';
        setRegisteredHosts(JSON.parse(hostsStored));
      } catch (e) {
        console.error(e);
        setError('Error loading hosts');
      } finally {
        setLoading(false);
      }
    };

    loadInitialHosts();
  }, []);

  const addHost = async (host: RegisteredHost) => {
    try {
      setLoading(true);
      setError(null);
      let hosts = JSON.parse((await AsyncStorage.getItem(hostKey)) || '[]');
      if (hosts.find((h: RegisteredHost) => h.id === host.id)) {
        throw new Error('Host already registered');
      }
      let updtatedRegisteredHosts = [...hosts, host];
      await AsyncStorage.setItem(hostKey, JSON.stringify(updtatedRegisteredHosts));
      setRegisteredHosts(updtatedRegisteredHosts);
    } catch (e) {
      console.error(e);
      setError('Error adding host');
    } finally {
      setLoading(false);
    }
  };

  const removeHost = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      let hosts: RegisteredHost[] = JSON.parse((await AsyncStorage.getItem(hostKey)) || '[]');
      let updtatedRegisteredHosts = hosts.filter((h: RegisteredHost) => h.id !== id);
      await AsyncStorage.setItem(hostKey, JSON.stringify(updtatedRegisteredHosts));
      setRegisteredHosts(updtatedRegisteredHosts);
    } catch (e) {
      console.error(e);
      setError('Error removing host');
    } finally {
      setLoading(false);
    }
  };

  return (
    <RegisteredHostsStorageContext.Provider
      value={{ loading, registeredHosts, error, addHost, removeHost }}
    >
      {children}
    </RegisteredHostsStorageContext.Provider>
  );
};

export default RegisteredHostStorageProvider;
