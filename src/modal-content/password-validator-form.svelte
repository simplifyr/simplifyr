<script>
  import { theme, showModal } from "../store";
  import {onMount} from 'svelte';
  export let data;
  let pass;

  onMount(() => {
      document.getElementById('pss').focus();
  });

  function ok() {
    if (pass) {
      $showModal = false;
      data.login(pass, data.team);
    }
  }

  function checkEnter(e) {
    if (e.keyCode === 13) {
      ok();
    }
  }
</script>

<style>
  .v-btn {
    position: absolute;
    top: 0;
    background-color: gray;
    right: 0;
    padding: 12px;
    border-top-right-radius: 3px;
    border-bottom-right-radius: 3px;
    color: #fff;
    font-size: 0.8rem;
    cursor: pointer;
    opacity: 0.8;
    transition: all 0.2s ease-in-out;
  }

  .v-btn:hover {
    opacity: 1;
  }

  input {
    transition: none;
    font-size: 1rem;
  }

  input:focus {
    font-size: 1rem;
  }

  .rel {
    position: relative;
  }
</style>

<div class="simplifyr-form ">
  <div class="body">
    <div class="element">
      <div class="label">
        <i class="fas fa-key" />
        Password
      </div>
      <div class="ip rel">
        <input id="pss"
          type="password"
          placeholder="Enter Team Password"
          bind:value={pass} on:keyup={(event) =>checkEnter(event)}/>
        <div
          class="v-btn {$theme}-theme"
          on:click={ok}>
          <i class="fas fa-check" />
          &nbsp; Verify
        </div>
      </div>
    </div>
  </div>
</div>
