<script>
  import { theme, form, showModal } from "../store";
  import { postFormData } from "../util";
  import { onMount } from "svelte";

  let key = "";
  let pass = "";
  let confPass = "";
  let file;
  let btnIndex = 0;
  let statusClass = "";
  let status = "";

  onMount(() => {
    btnIndex = 0;
  });

  let buttonText = [
    '<i class="fas fa-plus"></i> &nbsp; Add',
    '<i class="fas fa-spin fa-circle-notch"></i> &nbsp; Adding Certificate...',
    '<i class="fas fa-check"></i> &nbsp; Added',
    '<i class="fas fa-times"></i> &nbsp; Failed'
  ];

  let buttonStyle = [
    "",
    "background-color: #D7DBDD !important; pointer-events: none !important; color: gray !important; border: none !important",
    "background-color: #28B463 !important; color: #fff !important; pointer-events: none !important;",
    "background-color: #CB4335 !important; color: #fff !important; pointer-events: none !important;"
  ];

  function addCertificate() {
    file = document.getElementById("cert").files[0];
  }

  async function uploadCertificate() {
    status = "";
    var certForm = new FormData();
    certForm.append("cert", file);
    certForm.append("key", key);
    certForm.append("pass", pass);
    certForm.append("team", $form._TEAM);
    if (pass === confPass) {
      btnIndex = 1;
      var data = await postFormData("/api/add-new-cert", certForm);
      if (!data.err) {
        btnIndex = 2;
        $form.certificates = [...$form.certificates, key];
        setSuccessStatus("Certificate is ready to use.");
        statusClass = "passed";
        setTimeout(() => {
          $showModal = false;
        }, 3000);
      } else {
        setFailedStatus("Please try again!");
        btnIndex = 3;
        setTimeout(() => {
          btnIndex = 0;
        }, 2000);
      }
    } else {
      setFailedStatus("Passphrases don't match!");
    }
  }

  function setFailedStatus(st) {
    status = st;
    statusClass = "failed";
  }

  function setSuccessStatus(st) {
    status = st;
    statusClass = "passed";
  }
</script>

<style>
</style>

<div class="team-form simplifyr-form ">
  <header class="{$theme}-color">Add a new Certificate</header>
  <div class="body">
    <div class="element">
      <div class="label">
        <i class="fas fa-tag" />
        Key
      </div>
      <div class="ip">
        <input
          type="text"
          name="key"
          placeholder="Add Unique key for this certificate"
          bind:value={key} />
      </div>
    </div>
    <div class="element">
      <div class="label">
        <i class="fas fa-unlock-alt" />
        Select Certificate
      </div>
      <div class="ip">
        <input type="file" id="cert" on:change={() => addCertificate()} />
      </div>
    </div>
    <div class="element">
      <div class="label">
        <i class="fas fa-key" />
        Passphrase
      </div>
      <div class="ip">
        <input
          type="password"
          name="pass"
          placeholder="Passphrase for the certifiate"
          bind:value={pass} />
      </div>
    </div>
    <div class="element">
      <div class="label">
        <i class="fas fa-clone" />
        Confirm Passphrase
      </div>
      <div class="ip">
        <input
          type="password"
          name="con-pass"
          placeholder="Confirm Passphrase"
          bind:value={confPass} />
      </div>
    </div>
    <div class="element" style="text-align: right;">
      <div class="status-bar {statusClass}">{status}</div>
      <button
        class="{$theme}-theme"
        on:click={uploadCertificate}
        style={buttonStyle[btnIndex]}>
        {@html buttonText[btnIndex]}
      </button>
    </div>
  </div>
</div>
