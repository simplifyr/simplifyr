<script>
  import Progress from "./Progress.svelte";
  import Theme from "./Theme.svelte";
  import { visiblePart, theme, form } from "./store";

  export let showNav;

  let showThemeChooser = true;

  theme.subscribe(() => {
    showThemeChooser = !showThemeChooser;
  });

  function showTeamChooserPage() {
    delete window.localStorage.team;
    window.location.assign('/');
  }
</script>

<style>
  .parent {
    position: fixed;
    width: 100%;
    z-index: 100;
    background-color: #fbfbfb;
    z-index: 200;
    padding-bottom: 13px;
  }

  .rest {
    width: 80%;
    margin: 0px auto;
  }

  .logo div.version {
    position: absolute;
    font-size: 0.75rem;
    top: 3px;
    left: 128px;
    text-transform: lowercase;
    font-weight: 600;
  }

  .logo .l-1 img {
    cursor: pointer;
  }

  .logo .l-2 {
    position: absolute;
    top: 6px;
    font-size: 1.8rem;
    height: 30px;
    left: 60px;
  }

  .row {
    width: 100%;
    margin: -12px -2px;
  }

  .col {
    float: left;
    width: 24%;
    margin: 0px 2px;
  }

  .row .col:last-child {
    float: right !important;
  }

  .nav {
    padding: 0px 0px 10px 0px;
    box-sizing: border-box;
    text-align: center;
  }

  .theme-chooser {
    position: absolute;
    left: -2px;
    z-index: 99;
    top: 52px;
  }

  .team-chooser {
    position: absolute;
    right: 0px;
    font-size: .9rem;
    top: 16px;
    cursor: pointer;
    user-select: none;
    transition: all .1s ease-in-out;
    text-transform: uppercase;
  }

  .team-chooser:hover {
    transform: scale(1.1, 1.1);
  }
</style>

<div class="parent doc-body {$theme}">
  <div class="rest">
    <div class="logo">
      <div class="l-1">
        <img
          src="/{$theme}.png"
          alt="logo"
          on:click={() => (showThemeChooser = !showThemeChooser)} />
      </div>
      <div class="l-2">
        Simpli<b>fyR</b>
        <div class="version">0.0.1</div>
      </div>

      <div class="theme-chooser">
        <Theme showRest={showThemeChooser} />
      </div>
      {#if showNav}
        <div class="team-chooser" on:click={showTeamChooserPage} title="Switch Team"><i class="fas fa-sitemap"></i> {$form._TEAM}</div>
      {/if}
    </div>
    {#if showNav}
      <Progress />
      <div class="row">
        <div class="col nav {$visiblePart != 0 ? 'd' : 'a'}nav">
          <span on:click={() => ($visiblePart = 0)}>
            <i class="fas fa-random" />
            Request
          </span>
        </div>
        <div class="col nav {$visiblePart != 1 ? 'd' : 'a'}nav">
          <span on:click={() => ($visiblePart = 1)}>
            <i class="fab fa-hubspot" />
            Response
          </span>
        </div>
        <div class="col nav {$visiblePart != 2 ? 'd' : 'a'}nav">
          <span on:click={() => ($visiblePart = 2)}>
            <i class="fas fa-tasks" />
            Testcase
          </span>
        </div>
        <div class="col nav {$visiblePart != 3 ? 'd' : 'a'}nav">
          <span on:click={() => ($visiblePart = 3)}>
            <i class="fas fa-clipboard-check" />
            Result
          </span>
        </div>
      </div>
    {/if}
  </div>
</div>
