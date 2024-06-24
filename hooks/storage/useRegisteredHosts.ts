import { useContext } from 'react';
import RegisteredHostsStorageContext from '../../contexts/hosts-storage';

const useRegisteredHost = () => useContext(RegisteredHostsStorageContext);

export default useRegisteredHost;
