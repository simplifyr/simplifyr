<script>
  import { onMount } from "svelte";
  import { theme, showModal, authRequest, form } from "../store";

  let part = 0;
  let headers = [];
  let params = [];

  let headerMap = {};
  let paramMap = {};

  let body = `{
    "user": "sparm16",
    "password": "password1"
  }`;

  let hKey, hVal, pKey, pVal;
  let title = "";

  onMount(() => {
    if (!$authRequest.title) {
      $authRequest = {
        method: "GET",
        url: "",
      };
    } else {
      headers = $authRequest.headers || [];
      params = $authRequest.params || [];
      body =
        $authRequest.body ||
        `{
        "user": "sparm16",
        "password": "password1"
      }`;
      title = $authRequest.title || "Credential";
    }
  });

  function addHeader() {
    if (!headerMap[hKey] && hKey && hVal) {
      headers = [...headers, { key: hKey, value: hVal }];
      headerMap[hKey] = true;
      hKey = "";
      hVal = "";
    }
  }

  function addParam() {
    if (!paramMap[pKey] && pKey && pVal) {
      params = [...params, { key: pKey, value: pVal }];
      paramMap[pKey] = true;
      pKey = "";
      pVal = "";
    }
  }

  function addHeaderOnEnter(e) {
    if (e.keyCode === 13) {
      addHeader();
    }
  }

  function addParamOnEnter(e) {
    if (e.keyCode === 13) {
      addParam();
    }
  }

  function deleteParam(key) {
    delete paramMap[key];
    params = params.filter((p) => p.key != key);
  }

  function deleteHeader(key) {
    delete headerMap[key];
    headers = headers.filter((h) => h.key != key);
  }

  function setAuthData() {
    $showModal = false;
    $authRequest.headers = headers;
    $authRequest.params = params;
    $authRequest.body = body;
    $authRequest.title = title;
    if ($form.modal.callback) {
      $form.modal.callback();
    }
  }

  /*
{
  "user": "sparm16",
  "password": "password1"
}
  */
</script>

<div class="team-form simplifyr-form ">
  <header class="{$theme}-color">Auth Request</header>
  <div class="body">
    <div class="row">
      <div class="key">
        <select disabled>
          <option>Title</option>
        </select>
      </div>
      <div class="value">
        <input type="text" placeholder="Add a title..." bind:value={title} />
      </div>
    </div>
    <div class="row">
      <div class="key">
        <select bind:value={$authRequest.method}>
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
        </select>
      </div>
      <div class="value">
        <input type="text" placeholder="URL" bind:value={$authRequest.url} />
      </div>
    </div>
    <div class="row doc-body {$theme}">
      <div
        class="req-opt {part === 0 ? 'anav' : 'dnav'}"
        on:click={() => (part = 0)}
      >
        <i class="fas fa-hashtag" /> Headers
      </div>
      <div
        class="req-opt {part === 1 ? 'anav' : 'dnav'}"
        on:click={() => (part = 1)}
      >
        <i class="fas fa-question" /> Params
      </div>
      {#if $authRequest.method === "POST" || $authRequest.method === "PUT"}
        <div
          class="req-opt {part === 2 ? 'anav' : 'dnav'}"
          on:click={() => (part = 2)}
        >
          <i class="fas fa-asterisk" /> Body
        </div>
      {/if}
    </div>
    {#if part === 0}
      <div class="wrapper">
        <div class="row ip-row">
          <div class="key">
            <input placeholder="Name" bind:value={hKey} />
          </div>
          <div class="value">
            <input
              placeholder="Value"
              bind:value={hVal}
              on:keyup={addHeaderOnEnter}
            />
          </div>
          <div class="action-btn {$theme}-theme" on:click={addHeader}>
            <i class="fas fa-check" />
          </div>
        </div>
        <div class="h-p-list">
          {#each headers as header}
            <div class="row ip-row">
              <div class="key">
                <input placeholder="Name" bind:value={header.key} />
              </div>
              <div class="value">
                <input placeholder="Value" bind:value={header.value} />
              </div>
              <div
                class="action-btn del-red"
                on:click={() => deleteHeader(header.key)}
              >
                <i class="fas fa-trash" />
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}
    {#if part === 1}
      <div class="wrapper">
        <div class="row ip-row">
          <div class="key">
            <input placeholder="Name" bind:value={pKey} />
          </div>
          <div class="value">
            <input
              placeholder="Value"
              bind:value={pVal}
              on:keyup={addParamOnEnter}
            />
          </div>
          <div class="action-btn {$theme}-theme" on:click={addParam}>
            <i class="fas fa-check" />
          </div>
        </div>
        <div class="h-p-list">
          {#each params as param}
            <div class="row ip-row">
              <div class="key">
                <input placeholder="Name" bind:value={param.key} />
              </div>
              <div class="value">
                <input placeholder="Value" bind:value={param.value} />
              </div>
              <div
                class="action-btn del-red"
                on:click={() => deleteParam(param.key)}
              >
                <i class="fas fa-trash" />
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}
    {#if part === 2 && ($authRequest.method === "POST" || $authRequest.method === "PUT")}
      <div class="ip">
        <textarea
          bind:value={body}
          placeholder="Enter Body"
          style="height: 150px;"
        />
      </div>
    {/if}
  </div>
  <div class="doc-body {$theme}" style="margin-top: 15px;">
    <button on:click={setAuthData}>
      <i class="fas fa-save" /> &nbsp;Add Auth
    </button>
  </div>
</div>

<style>
  select {
    border: none;
    border-bottom: 2px solid #e1e1e1;
    outline: none;
  }

  select option {
    outline: none !important;
  }

  .row {
    display: flex;
    margin-bottom: 15px;
  }

  .value {
    flex-grow: 1;
    padding-left: 10px;
  }

  .ip-row {
    margin-bottom: 3px !important;
  }

  .ip-row input {
    font-size: 0.8rem;
  }

  .action-btn {
    padding: 0px 4px;
    width: 30px;
    height: 30px;
    line-height: 30px;
    text-align: center;
    font-size: 0.7rem;
    color: #fff;
    margin-left: 5px;
    border-radius: 3px;
    cursor: pointer;
  }

  .row input {
    width: 100%;
  }

  .req-opt {
    padding: 0px 15px 5px 15px;
    font-size: 0.9rem;
  }

  .del-red {
    background-color: #a8291c;
  }

  .h-p-list {
    max-height: 200px;
    overflow: auto;
  }
</style>
