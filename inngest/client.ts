import { Inngest } from 'inngest';

// Create a client to send and receive events
// Event key is used to authenticate when sending events to Inngest
export const inngest = new Inngest({
  name: 'Otakumori',
  id: 'otakumori-app',
  eventKey: process.env.INNGEST_EVENT_KEY,
});
