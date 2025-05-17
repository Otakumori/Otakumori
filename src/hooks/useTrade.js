import { useState } from 'react';

export default function useTrade() {
  const [trades, setTrades] = useState([]);

  const initiateTrade = item => {
    setTrades([...trades, item]);
  };

  return { trades, initiateTrade };
}
