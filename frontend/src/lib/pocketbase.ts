import PocketBase from 'pocketbase';
import { writable } from 'svelte/store';

export const pb = new PocketBase('https://spockbc.fun');
pb.realtime["connect"]('wss://spockbc.fun');
export const currentUser = writable(pb.authStore.model);

pb.authStore.onChange(() => {
  console.log("📌 authStore changed");
  currentUser.set(pb.authStore.model);
});
