<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { pb, currentUser } from "./pocketbase";
  import { get } from "svelte/store";

  let newMessage = "";
  let messages: any[] = [];
  let unsubscribe: () => void;
  let user: any;
  $: user = $currentUser;

  async function sendMessage() {
    if (!newMessage.trim()) return;

    const created = await pb.collection("messages").create({
      text: newMessage,
      user: user?.id,
    });

    // Ambil kembali message yang sudah lengkap expand user
    const expanded = await pb.collection("messages").getOne(created.id, {
      expand: "user",
    });

    messages = [...messages, expanded];
    newMessage = "";
  }

  function logout() {
    pb.authStore.clear();
    currentUser.set(null);
  }

  onMount(async () => {
    const u = get(currentUser);
    if (!u) return;

    const result = await pb.collection("messages").getList(1, 50, {
      sort: "created",
      expand: "user",
    });
    messages = result.items;

    unsubscribe = await pb
      .collection("messages")
      .subscribe("*", async ({ action, record }) => {
        if (action === "create") {
          let senderData;

          try {
            // 🔍 Jika record.user adalah object, ambil dari situ
            if (typeof record.user === "object" && record.user.email) {
              senderData = record.user;
            } else {
              // ✅ Jika masih ID string, fetch user datanya
              const userId =
                typeof record.user === "string" ? record.user : record.user?.id;
              senderData = await pb.collection("users").getOne(userId, {
                fields: "email,id",
              });
            }

            record.expand = { user: senderData };
            messages = [...messages, record];
          } catch (e) {
            console.error("🔥 Gagal fetch user info", e);
          }
        }
      });
  });

  onDestroy(() => {
    unsubscribe?.();
  });
</script>

<p>
  Logged in as <strong>{user?.email}</strong>
  <button on:click={logout}>Logout</button>
</p>

<div class="messages">
  {#each messages as message (message.id)}
    <div class="msg">
      <img
        class="avatar"
        src={`https://api.dicebear.com/9.x/pixel-art/svg?seed=${message.expand?.user?.email ?? "unknown"}`}
        alt="avatar"
        width="40"
      />

      <div>
        <small>
          Sent by <strong
            >{message.expand?.user?.email || "Unknown user"}</strong
          >
        </small>
        <p>{message.text}</p>
      </div>
    </div>
  {/each}
</div>

<form on:submit|preventDefault={sendMessage}>
  <input
    type="text"
    bind:value={newMessage}
    placeholder="Type a message"
    autocomplete="off"
    required
  />
  <button type="submit">Send</button>
</form>
