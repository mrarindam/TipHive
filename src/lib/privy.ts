import { PrivyClient } from '@privy-io/node';

if (!process.env.NEXT_PUBLIC_PRIVY_APP_ID) {
  throw new Error('NEXT_PUBLIC_PRIVY_APP_ID is not defined');
}

if (!process.env.PRIVY_APP_SECRET) {
  console.warn('PRIVY_APP_SECRET is not defined. Authentication will fail.');
}

export const privy = new PrivyClient({
  appId: process.env.NEXT_PUBLIC_PRIVY_APP_ID,
  appSecret: process.env.PRIVY_APP_SECRET || ''
});
