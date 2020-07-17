<script>
  import { onMount } from "svelte";
  import Recent from "./Recent.svelte";
  import PartTitle from "./PartTitle.svelte";
  import AuthChooser from "./AuthChooser.svelte";
  import SSLOption from "./SSLOption.svelte";
  import Protocol from "./Protocol.svelte";
  import Certificate from "./Certificate.svelte";
  import Editor from "./Editor.svelte";
  import {
    visiblePart,
    form,
    auth,
    protocol,
    ssl,
    certificate,
    recent,
    contentType,
    showModal
  } from "./store";
  import { processRawRequest } from "./util";

  var val = `GET /ping HTTP/1.1
Host: simplifyr.dev
x-simplifyr-key: 4e6578744269675468696e67`;

  var aws4Ips = `
x-api-key: <your_api_key>
accesskey: <your_access_key>
secretkey: <your_secret_key>
region: <region>`;

  var aws4IpsPattern = new RegExp(`
x-api-key: [a-zA-Z0-9><_/+-]+
accesskey: [a-zA-Z0-9><_/+-]+
secretkey: [a-zA-Z0-9><_/+-]+
region: [a-zA-Z0-9><_/+-]+`);

  var mode = "yaml";

  $recent = JSON.parse(localStorage[recentKey()] || "[]");

  function nextPart() {
    var cType = processRawRequest($form, $auth, $protocol, $ssl, $certificate);
    $contentType = cType;
    saveRequestInRecents();
    $visiblePart += 1;
  }

  function saveRequestInRecents() {
    var req = $form.httpReqOpt;
    var editor = $form["ed1"];
    var _recent = {
      host: req.headers.Host,
      url: req.headers.path.split('?')[0],
      method: req.method,
      rawReq: editor.getSession().getValue(),
      when: new Date().getTime()
    };
    $recent.splice(0, 0, _recent);
    $recent = $recent.slice(0, 5);
    localStorage[recentKey()] = JSON.stringify($recent);
  }


  function recentKey() {
    return "recent:" + sessionStorage.team;
  }

  auth.subscribe(() => {
    var ed = $form["ed1"];
    if (ed) {
      var v = ed.getSession().getValue();
      if ($auth === "1") {
        ed.getSession().setValue(v + aws4Ips);
      } else {
        ed.getSession().setValue(v.replace(aws4IpsPattern, ""));
      }
    }
  });

  function showRequestEditorForm() {
    processRawRequest($form, $auth, $protocol, $ssl, $certificate);
    $form.modal.type = 5;
    $form.modal.data = {};
    $form.modal.width = "60";
    $form.modal.topCloseBtn = true;
    $showModal = true;
  }
</script>

<style>
  .other-opts {
    position: relative;
    text-align: left;
    margin-top: 20px;
    margin-left: 5px;
  }
  .left {
    display: inline-block;
    margin-right: 15px;
  }

  .req-editor-btn {
    position: absolute;
    top: 0;
    right: 6px;
    line-height: 46px;
    font-size: 0.8rem;
    color: #737373;
    cursor: pointer;
  }
</style>

<div class="container {$visiblePart != 0 ? 'hide' : ''}">
  <PartTitle title="Enter HTTP Request" />
  <div class="req-editor-btn" on:click={showRequestEditorForm}>
    <i class="fas fa-pencil-alt" />
    Edit
  </div>
  <Editor width="99%" {val} eid="ed1" {mode} />
  <div class="other-opts">
    <div class="left">
      <AuthChooser />
    </div>
    <div class="left">
      <Protocol />
    </div>
    <div class="left">
      <SSLOption />
    </div>
    <div class="left">
      <Certificate />
    </div>
  </div>
  <div style="text-align: right; padding: 10px;">

    <button class="next-btn" on:click={nextPart}>
      Next
      <i class="fas fa-arrow-right" />
    </button>
  </div>
</div>

{#if $visiblePart == 0}
  <Recent />
{/if}
