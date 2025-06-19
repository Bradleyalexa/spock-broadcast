<script lang="ts">
  import { pb } from "./pocketbase";

  let email = "";
  let password = "";
  let mode: "login" | "signup" = "signup";

  async function handleAuth() {
    try {
      if (mode === "signup") {
        await pb.collection("users").create({
          email,
          password,
          passwordConfirm: password,
        });
        await pb.collection("users").authWithPassword(email, password);
      } else {
        await pb.collection("users").authWithPassword(email, password);
      }
    } catch (err) {
      if (err instanceof Error) {
        alert("Error: " + err.message);
      }
    }
  }
</script>

<form on:submit|preventDefault={handleAuth}>
  <input type="email" bind:value={email} placeholder="Email" required />
  <input
    type="password"
    bind:value={password}
    placeholder="Password"
    required
  />
  <div>
    <button type="submit" on:click={() => (mode = "signup")}>Sign Up</button>
    <button type="submit" on:click={() => (mode = "login")}>Login</button>
  </div>
</form>
