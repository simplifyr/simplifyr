<script>
  import Header from "./Header.svelte";
  import { data, sfs, _theme } from "./result-store";
  import DateSelector from "./result/date-selector.svelte";
  import Report from "./result/report.svelte";
  import Wait from './result/wait.svelte';
  import OverAll from "./result/overall.svelte";
  import { getData } from './util';

  document.getElementById('site-icon').href = '/' + $_theme + '.png';

  $data = JSON.parse(document.getElementById("cdata").innerText);
  $data.data = JSON.parse($data.data);
  
  if(typeof $data.data == 'string') {
    $data.data = JSON.parse($data.data);
  }
  document.getElementById("cdata").remove();
  $data.urlDate = parseInt(window.location.search.replace(/^\?/, ""));

  var testSuiteName = window.location.pathname.split("/")[5].replace(/-/g, " ");

  function getDates() {
    return $data.keys
      .map(key => parseInt(/(\d+)$/.exec(key)[0]))
      .sort((d1, d2) => d2 - d1);
  }

  (async function getSFS() {
    if($data.keys.length > 0) {
      var resp = await getData('sfs/' + $data.keys);
      $sfs = resp.sfs;
    }
  })();


</script>

<style>
  main {
    width: 80%;
    margin: 0 auto;
    padding-top: 73px;
    padding-bottom: 30px;
  }

  .grid {
    display: flex;
  }

  .center {
    flex: 75%;
  }

  .right {
    margin-left: 5px;
    flex: 24%;
    position: relative;
  }

  .info {
    position: relative;
    height: 40px;
    line-height: 40px;
  }
  .info .a-r {
    position: absolute;
    right: 0px;
    top: 0px;
  }
</style>

<Header showNav={false} />
<main>
  <div class="grid">
    <div class="center">
      <div class="info">
        <span style="font-size: 1.2rem; ">
          <i class="fas fa-tasks" />
          <b>{testSuiteName}</b>
        </span>
        <div class="a-r">
          <DateSelector dates={getDates()} />
        </div>
      </div>
      {#if $data.data && $data.data.done}
        <Report testcases={$data.data.result} stat={$data.data.sf} />
      {:else}
       <Wait />
      {/if}
    </div>
    <div class="right">
      <OverAll dates={getDates()} />
    </div>
  </div>
</main>
