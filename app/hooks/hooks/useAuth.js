/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable-line @next/next/no-img-element */
import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';

export default function useAuth() {
  return useContext(AuthContext);
}
