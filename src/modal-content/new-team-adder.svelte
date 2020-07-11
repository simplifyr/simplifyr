<script>
  import { theme, form, showModal } from "../store";
  import { postData } from "../util";
  import { onMount } from "svelte";

  let teamName = "";
  let adminPass = "";
  let pass = "";
  let btnIndex = 0;
  let statusClass = "";
  let status = "";
  let cnfPass = "";

  onMount(() => {
    btnIndex = 0;
  });

  let buttonText = [
    '<i class="fas fa-plus"></i> &nbsp; Add',
    '<i class="fas fa-spin fa-circle-notch"></i> &nbsp; Adding Team...',
    '<i class="fas fa-check"></i> &nbsp; Added',
    '<i class="fas fa-times"></i> &nbsp; Failed'
  ];

  let buttonStyle = [
    "",
    "background-color: #D7DBDD !important; pointer-events: none !important; color: gray !important; border: none !important",
    "background-color: #28B463 !important; color: #fff !important; pointer-events: none !important;",
    "background-color: #CB4335 !important; color: #fff !important; pointer-events: none !important;"
  ];

  async function addNewTeam() {
    status = "";
    teamName = teamName.toLowerCase();
    if ($form.teams.indexOf(teamName) == -1) {
      if (pass.length > 0 && pass == cnfPass) {
        btnIndex = 1;
        var res = await postData("/api/teams", { teamName, adminPass, pass });
        if (!res.err) {
          btnIndex = 2;
          $form.teams.push(teamName);
          setSuccessStatus(teamName + " is now registered.");
          setTimeout(done, 2000);
        } else {
          btnIndex = 3;
          setFailedStatus(res.err);
          setTimeout(() => {
            btnIndex = 0;
          }, 2000);
        }
      } else {
        setFailedStatus("Passwords don't match");
      }
    } else {
      setFailedStatus(teamName + " already exists.");
    }
  }

  function done() {
    $form.modal.data.refresh();
    $showModal = false;
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
  .team-form .body {
    margin: 0px auto;
    width: 98%;
  }

  .team-form header {
    padding-left: 6px;
  }
</style>

<div class="team-form simplifyr-form ">
  <header class="{$theme}-color">Add a new Team</header>
  <div class="body">
    <div class="element">
      <div class="label">
        <i class="fas fa-bookmark" />
        Team Name
      </div>
      <div class="ip">
        <input
          type="text"
          name="team-name"
          placeholder="Enter a Team Name"
          bind:value={teamName} />
      </div>
    </div>
    <div class="element">
      <div class="label">
        <i class="fas fa-key" />
        Team Password
      </div>
      <div class="ip">
        <input
          type="password"
          name="pass"
          placeholder="Add a password"
          bind:value={pass} />
      </div>
    </div>
    <div class="element">
      <div class="label">
        <i class="fas fa-key" />
        Confirm Team Password
      </div>
      <div class="ip">
        <input
          type="password"
          name="cnfPass"
          placeholder="Confirm password"
          bind:value={cnfPass} />
      </div>
    </div>
    <div class="element">
      <div class="label">
        <i class="fas fa-user-ninja" />
        Admin Passphrase
      </div>
      <div class="ip">
        <input
          type="password"
          name="admin-pass"
          placeholder="Prove it's you admin"
          bind:value={adminPass} />
      </div>
    </div>

    <div class="element" style="text-align: right;">
      <div class="status-bar {statusClass}">{status}</div>
      <button
        class="{$theme}-theme"
        on:click={addNewTeam}
        style={buttonStyle[btnIndex]}>
        {@html buttonText[btnIndex]}
      </button>
    </div>
  </div>
</div>
