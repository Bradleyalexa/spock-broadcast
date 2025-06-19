<script lang="ts">
  import Login from "./lib/Login.svelte";
  import Messages from "./lib/Messages.svelte";
  import { currentUser } from "./lib/pocketbase";
  import { onMount } from "svelte";

  let user: any;
  $: user = $currentUser;
</script>

<h1>Pocketchat</h1>

{#if user}
  <Messages />
{:else}
  <Login />
{/if}
