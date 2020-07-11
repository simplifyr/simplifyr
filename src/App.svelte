<script>
  import Header from "./Header.svelte";
  import Options from "./Options.svelte";
  import Output from "./Output.svelte";
  import Test from "./Test.svelte";
  import Result from "./Result.svelte";
  import Modal from "./Modal.svelte";
  import TeamChooser from "./TeamChooser.svelte";
  import { form, theme, showMainApp } from "./store";

  (function init() {
    $form.modal = {};
    $form.certificates = [];
    $form._TEAM = window.localStorage.team;
    document.getElementById('site-icon').href = '/' + $theme + '.png';
  })();
</script>

<style>
  main {
    text-align: center;
    width: 80%;
    margin: 0 auto;
    padding-top: 140px;
    padding-bottom: 30px;
  }
</style>

{#if $showMainApp}
  <div class="main-app">
    <Header showNav={true} />
    <main>
      <div class="doc-body {$theme}">
        <Options />
        <Output />
        <Test />
        <Result />
      </div>
    </main>
  </div>
{:else}

  <div class="team-chooser">
    <Header showNav={false} />
    <TeamChooser />
  </div>
{/if}
<Modal />
<div style="display:none" id="--useless--" />
