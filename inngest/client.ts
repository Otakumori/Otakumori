/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable-line @next/next/no-img-element */
import { Inngest } from 'inngest';

// Create a client to send and receive events
export const inngest = new Inngest({
  name: 'Otakumori',
  id: 'otakumori-app',
});
