<script>
  import { theme, form, showMainApp, showModal } from "./store";
  import { getData, postData } from "./util";
  import Forbidden from "./Forbidden.svelte";

  var loadingTeams = true;
  var team = "";
  var teamsToDisplay = [];
  var newTeamBtnActive = true;
  var validIp = -1;
  var text2display = "";

  var imgArr = ["1", "4", "6", "2", "3", "5"];

  (async function getIP() {
    var vals = document
      .getElementById("simplifyr-info-data")
      .innerText.split(" ");

    var all = await Promise.all([
      getData("https://api6.ipify.org?format=json"),
      getData("/api/sys/info")
    ]);
    var c = all[0].ip;
    var i = 0;
    for (var r of regx) {
      c = c.replace(r, vals[i]);
      i++;
    }
    validIp = all[1].indexOf(c) >= 0 ? 1 : 0;
  })();

  (async function getTeams() {
    $form.teams = await getData("/api/teams/");
    teamsToDisplay = $form.teams = $form.teams.map(t => {
      return t.split("::")[1];
    });
    teamsToDisplay.concat($form.teams);
    teamsToDisplay = [...teamsToDisplay];
    loadingTeams = false;
  })();

  function search() {
    teamsToDisplay = $form.teams.filter(t => t.startsWith(team.toLowerCase()));
  }

  async function selectTeam(team) {
    $form.modal.data = { login, team };
    $form.modal.type = 4;
    $form.modal.width = 30;
    $form.modal.topCloseBtn = false;
    $showModal = true;
  }

  async function login(pass, team) {
    validIp = -1;
    text2display = "Verifying...";
    var result = await postData("/api/verify", { team, pass });
    if (result.status) {
      window.localStorage["team"] = team;
      $showMainApp = true;
    } else {
      text2display = "Verification failed!";
      setTimeout(() => {
        validIp = 1;
      }, 2000);
    }
  }

  function addNewTeam() {
    if (newTeamBtnActive) {
      $form.modal.data = { refresh };
      $form.modal.type = 2;
      $form.modal.width = 40;
      $form.modal.topCloseBtn = true;
      $showModal = true;
    }
  }

  function refresh() {
    teamsToDisplay = [...$form.teams];
  }

  var regx = [/^/, /\./, /\./, /\./, /2/g, /8/g, /5/g];
</script>

<style>
  h1 {
    font-weight: 400;
  }

  .main {
    padding-top: 70px;
    text-align: center;
    margin: 0px auto;
    width: 80%;
    position: relative;
  }

  #team-name {
    font-size: 1.2rem;
    text-align: center;
    color: inherit;
    border: none;
    border-bottom: 2px solid #e8e8e8;
    background-color: transparent;
    outline: none;
    width: 60%;
    max-width: 400px;
  }

  ul.team-list {
    padding: 0px;
    margin: 0px auto;
    margin-top: 50px;
    width: 50%;
  }

  ul.team-list li {
    display: inline-block;
    margin: 10px;
    font-size: 20px;
    cursor: pointer;
    border-bottom-left-radius: 3px;
    border-bottom-right-radius: 3px;
    transition: all 0.2s ease-in-out;
  }

  ul.team-list li:hover {
    /*background-color: #ecf4ff;*/
    transform: scale(1.1, 1.1);
  }

  ul.team-list li div.bg-img {
    height: 132px;
    width: 132px;
    background-size: cover;
    border-radius: 3px;
    box-shadow: 0px 1px 2px 0px grey;
  }

  ul.team-list li div.team-name {
    color: #333;
    padding: 5px;
    text-transform: uppercase;
    font-size: 0.9rem;
  }

  .new-team-adder {
    position: absolute;
    z-index: 1000;
    right: 0px;
    top: 17px;
    padding: 10px;
    border-radius: 3px;
    color: #fff;
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.2s ease-in;
  }

  .new-team-adder:hover {
    box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.2);
  }

  .disable {
    pointer-events: none;
    opacity: 0.3;
    background-color: gray !important;
    cursor: default;
  }

  .loding-info {
    color: #cacfd2;
    text-transform: uppercase;
    font-weight: 600;
  }
</style>

<div class="main {$theme}-color">
  {#if validIp === 1}
    <div class="new-team-adder {$theme}-theme" on:click={addNewTeam}>
      <i class="fas fa-sitemap" />
      &nbsp; New Team
    </div>
    <h1>Which team you are from?</h1>
    <input
      type="text"
      id="team-name"
      bind:value={team}
      placeholder="Start typing..."
      on:keyup={search} />
    {#if !loadingTeams}
      {#if teamsToDisplay.length > 0}
        <ul class="team-list">
          {#each teamsToDisplay as _team, i}
            <li on:click={() => selectTeam(_team)}>
              <div
                class="bg-img"
                style="background-image: url('/avatar/{imgArr[i % imgArr.length]}.jpg')" />
              <div class="team-name">{_team}</div>
            </li>
          {/each}
        </ul>
      {:else}
        <div
          class="team-loader"
          style="color: rgb(208, 207, 207); margin-top: 5%; font-size: 1.2rem;
          text-transform: uppercase; ">
          <img src="/nodata.png" alt="NO DATA" style="width: 200px;" />
          <div>
            {$form.teams.length == 0 ? 'Add a team to get started' : "Couldn't find your team"}
          </div>
        </div>
      {/if}
    {:else}
      <div class="team-loader" style="color: #d1d1d1; margin-top: 15%">
        Loading teams...
      </div>
    {/if}
  {:else if validIp === 0}
    <Forbidden />
  {:else}
    <div style="margin-top: 15%; text-align: center;">
      <img src="/init.gif" alt="loading..." style="width: 64px;" />
      <div class="loding-info">{text2display}</div>
    </div>
  {/if}
</div>
