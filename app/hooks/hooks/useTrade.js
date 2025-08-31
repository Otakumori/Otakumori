/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable-line @next/next/no-img-element */
import { useState } from 'react';

export default function useTrade() {
  const [trades, setTrades] = useState([]);

  const initiateTrade = (item) => {
    setTrades([...trades, item]);
  };

  return { trades, initiateTrade };
}
