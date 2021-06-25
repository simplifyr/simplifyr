<script>
  import {
    authRequestList,
    form,
    showModal,
    authRequest,
    theme,
    visiblePart,
  } from "./store";
  import { getData } from "./util";

  let authId;
  let authMap = {};
  let selectedAuth = {};

  function addOrUpdateAuth(add) {
    if (add) {
      $authRequest = {};
    } else {
      $authRequest = selectedAuth;
    }
    $form.modal.type = 6;
    $form.modal.data = {};
    $form.modal.width = "60";
    $form.modal.topCloseBtn = true;
    $form.modal.callback = add ? addNewAuth : updateExistingAuth;
    $showModal = true;
  }

  function addNewAuth() {
    selectedAuth = $authRequest;
    $authRequest = {};
    authId = "NA";
  }

  function updateExistingAuth() {}

  async function getAuthDetails() {
    if (!authMap[authId]) {
      let d = await getData("/api/key/" + authId);
      authMap[authId] = JSON.parse(d.value);
    }
    selectedAuth = authMap[authId];
  }

  visiblePart.subscribe((n) => {
    if (n === 1) {
      $authRequest = selectedAuth;
    }
  });
</script>

<div class="auth-request">
  <div class="auth-req-header">
    <div>Http auth request</div>
    <div
      on:click={() => addOrUpdateAuth(true)}
      class="add-auth-btn {$theme}-color"
    >
      <i class="fa fa-plus" /> Add Auth
    </div>
  </div>
  {#if $authRequestList.length > 0}
    <select
      bind:value={authId}
      on:change={getAuthDetails}
      class="{$theme}-color"
    >
      <option disabled selected value="NA">Select an existing request</option>
      {#each $authRequestList as auth}
        <option value={auth}>{auth.split("::")[2].replace(/-/g, " ")}</option>
      {/each}
    </select>
  {:else}
    <div>No auth available</div>
  {/if}

  {#if selectedAuth.title}
    <div class="auth-details">
      <div class="header">
        <div>
          <span class="title">Title</span>
          <span style="font-weight: 600;">{selectedAuth.title}</span>
        </div>
        <div
          class="auth-edit-btn {$theme}-color"
          on:click={() => addOrUpdateAuth(false)}
        >
          <i class="fa fa-pencil-alt" />
        </div>
      </div>
      <div class="body">
        <div>
          <span class="method">{selectedAuth.method} </span>
          <span class="url">{selectedAuth.url} </span>
        </div>
        {#if selectedAuth.headers && selectedAuth.headers.length > 0}
          <div class="bold {$theme}-color">
            <i class="fas fa-hashtag" /> Headers
          </div>
          {#each selectedAuth.headers as header}
            <div class="key-value">
              <div>{header.key}</div>
              <div>{header.value}</div>
            </div>
          {/each}
        {/if}

        {#if selectedAuth.params && selectedAuth.params.length > 0}
          <div class="bold {$theme}-color">
            <i class="fas fa-question" /> Params
          </div>
          {#each selectedAuth.params as param}
            <div class="key-value">
              <div>{param.key}</div>
              <div>{param.value}</div>
            </div>
          {/each}
        {/if}

        {#if selectedAuth.body}
          <div class="bold {$theme}-color">
            <i class="fas fa-asterisk" /> Body
          </div>
          <div>
            {@html selectedAuth.body.replace(/\n/g, "<br>")}
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  select {
    border: none;
    border-bottom: 2px solid #e1e1e1;
    outline: none;
    width: 100%;
  }

  .auth-request {
    text-align: left;
    margin-top: 20px;
    background-color: #fbfbfb;
    margin-right: 10px;
    padding: 10px;
    box-sizing: border-box;
    border-radius: 4px;
    border: 1px solid #ececec;
  }

  .auth-req-header {
    font-weight: 600;
    padding-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .add-auth-btn {
    cursor: pointer;
    font-size: 0.9rem;
  }

  .auth-details {
    background-color: #fff;
    padding: 10px;
    border-radius: 4px;
    border: 1px solid #f3f3f3;
  }

  .header,
  .key-value {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .bold {
    font-weight: 600;
    margin: 20px 0px 10px 0px;
    padding-bottom: 5px;
    font-size: 0.9rem;
  }

  .auth-edit-btn {
    color: #333;
    cursor: pointer;
    font-size: 0.8rem;
  }

  .method {
    color: gray;
    padding-right: 10px;
  }

  .url {
    color: #5151af;
  }

  .body {
    margin-top: 15px;
  }

  .title {
    color: gray;
    text-transform: uppercase;
    margin-right: 16px;
  }
</style>
