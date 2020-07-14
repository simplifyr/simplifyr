<script>
  import { onMount } from "svelte";
  import { theme, form, showModal, protocol } from "../store";

  let part = 0;
  let method;
  let url;
  let headers = [];
  let params = [];

  let headerMap = {};
  let paramMap = {};

  let hKey, hVal, pKey, pVal;

  let http = 'HTTP/1.1';

  onMount(() => {
    method = $form.httpReqOpt.method;
    var _temp = $form.httpReqOpt.headers;
    delete _temp["path"];
    delete _temp["Host"];
    var urlParts = $form.httpReqOpt.url.split("?");
    url = urlParts[0];
    for (var header of Object.keys(_temp)) {
      headers = [...headers, { key: header, value: _temp[header] }];
      headerMap[header] = true;
    }

    var qry = urlParts[1];
    if (qry) {
      for (var param of qry.split("&")) {
        var [key, value] = param.split("=");
        params = [...params, { key, value }];
        paramMap[key] = true;
      }
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
    params = params.filter(p => p.key != key);
  }

  function deleteHeader(key) {
    delete headerMap[key];
    headers = headers.filter(h => h.key != key);
  }

  function setDataInEditor() {
    let [_p, _b, _h, ...path] = url.split('/');
    let paramString = params.map(({key, value}) => key + '=' + value).join('&');
    let headerString = headers.map(({key, value}) => key + ': ' + value).join('\n');
    headerString = 'Host: ' + _h + '\n' + headerString;
    path = '/' + path.join('/') + '?' + paramString;
    let httpReq = method + ' ' + path + ' ' + http + '\n' + headerString;
    $protocol = _p.split(':')[0];
    $form["ed1"].setValue(httpReq, httpReq.length);
    $showModal = false;    
  }
</script>

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

<div class="team-form simplifyr-form ">
  <header class="{$theme}-color">Request</header>
  <div class="body">
    <div class="row">
      <div class="key">
        <select bind:value={method}>
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
        </select>
      </div>
      <div class="value">
        <input type="text" placeholder="URL" bind:value={url} />
      </div>
    </div>
    <div class="row doc-body {$theme}">
      <div
        class="req-opt {part === 1 ? 'd' : 'a'}nav"
        on:click={() => (part = 0)}>
        <i class="fas fa-hashtag"></i> Headers
      </div>
      <div
        class="req-opt {part === 0 ? 'd' : 'a'}nav"
        on:click={() => (part = 1)}>
        <i class="fas fa-question"></i> Params
      </div>
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
              on:keyup={addHeaderOnEnter} />
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
                on:click={() => deleteHeader(header.key)}>
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
              on:keyup={addParamOnEnter} />
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
                on:click={() => deleteParam(param.key)}>
                <i class="fas fa-trash" />
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
  <div class="doc-body {$theme}" style="margin-top: 15px;">
    <button on:click={setDataInEditor}>
      <i class="fas fa-save"></i> &nbsp;SET
    </button>
  </div>
</div>
