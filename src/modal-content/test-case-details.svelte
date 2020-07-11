<script>
  import Editor from "../Editor.svelte";
  import { postPlainData } from "../util";

  export let data;
  export let delay;
  let eidLeft = parseInt(new Date().getTime() * Math.random());
  let eidRight = parseInt(new Date().getTime() * Math.random());
  let defaultView = "ui-result";
  export let view = defaultView;
  let showBody = false;

  setTimeout(() => {
    if (view == defaultView) {
      showBody = true;
    }
  }, delay);

  var urlDate = /(\d+)$/.exec(window.location.href) || ["NA"];

  

  var reportData = {
    q: data.test.query,
    _r: data._response,
    v: data.test.validator,
    i: data.test.index,
    tsuiteId: data.tsuite
  };
  var localTestKey =
    urlDate[0] + "---" + reportData.i + "---" + reportData.tsuiteId;

  let isReported = Boolean(window.localStorage.getItem(localTestKey)) || false;


  var val = data._response.body;
  
  if(/application\/json/.test(data._response.headers['content-type'])) {
    if(typeof val === 'string') {
      val = JSON.parse(val);
    }
    val = JSON.stringify(val, null, "\t");
  }

  if (!val) {
    val = "[SimplifyR] No response to show.";
  }

  var mode = "javascript";
  var validators = ["RJQL", "TEXT", "REGEX"];

  async function reportValidation() {
    var redisId = "issue::" + data.tsuite + "::" + new Date().getTime();
    isReported = undefined;
    var res = await postPlainData(
      "/api/key/" + redisId,
      JSON.stringify(reportData)
    );
    isReported = true;

    if (view != defaultView) {
      window.localStorage.setItem(localTestKey, true);
    }
  }

  function toggleBody() {
    if (view != defaultView) {
      showBody = !showBody;
    }
  }
</script>

<style>
  .test-case-details {
    color: #3c3c3c;
  }

  .body {
    display: flex;
    position: relative;
    border-top: 1px solid #f5f5f5;
  }

  .body .final-response {
    flex: 7;
  }

  .body .verdict {
    flex: 3 1 3%;
    margin-left: 10px;
    border-left: 1px solid #f1f1f1;
    padding-left: 10px;
  }

  .test-info {
    display: flex;
    padding-bottom: 12px;
  }

  .heading {
    font-weight: 500;
    padding: 10px 0px;
  }

  .status {
    font-size: 0.8rem;
    padding: 3px 8px;
    border-radius: 3px;
    margin-left: 5px;
    text-transform: uppercase;
  }

  .failed {
    color: #fff !important;
    background-color: #cb4335 !important;
  }

  .passed {
    color: #fff !important;
    background-color: #28b463 !important;
  }

  .query-holder {
    margin-top: 15px;

    padding: 5px 0px 5px 5px;
  }

  .query-holder.qh-passed {
    border-left: 2px solid #28b463;
  }

  .query-holder.qh-failed {
    border-left: 2px solid #e04e51;
  }

  .verbose {
    color: #823434;
    font-size: 0.85rem;
    word-break: keep-all;
    text-align: left;
  }

  .overall {
    margin: 10px 0px;
    text-align: right;
    font-size: 0.8rem;
    color: #a0a0a0;
    position: relative;
    height: 20px;
  }

  .qb {
    font-size: 0.75rem;
    margin: 5px 0px;
    word-break: normal;
  }

  .results {
    text-align: left;
  }

  .results h3 {
    font-size: 1rem;
    color: rgba(0, 0, 0, 0.8);
    margin-bottom: 2px !important;
  }

  .results ol {
    margin: 0px;
    padding: 0px;
    padding-left: 16px;
  }

  .warn {
    color: #f1c40f !important;
  }

  .all-cool {
    color: silver;
    font-size: 0.9rem;
    text-transform: uppercase;
    margin: 14px 0px 0px 0px;
  }

  .validator-type {
    position: absolute;
  }

  .report-test {
    position: absolute;
    font-size: 0.85rem;
    margin-top: 2px;
    bottom: -40px;
    z-index: 100;
  }

  /* View specific styles */

  .automation-clock {
    line-height: 22px;
  }

  .automation-body {
    padding-bottom: 34px;
  }

  .automation-info {
    cursor: pointer;
  }

  .automation-report-test {
    bottom: 7px;
  }

  .automation-center {
    text-align: center !important;
  }
</style>

<div class="test-case-details">
  <div class="test-info {view}-info" on:click={toggleBody}>
    <div style="flex: 8; text-align: left; font-weight: 600;">
      <i class="fas fa-receipt" />
      {data.desc}
      <span class="status {data.status}">{data.status}</span>
    </div>
    <div
      style="flex: 2 1 2%; text-align: right; font-size: .8rem; color: gray;"
      class="{view}-clock">
      <i class="far fa-clock" />
      {data.timeTaken}
    </div>
  </div>
  <div class="body {!showBody ? 'hide' : ''} {view}-body">
    <div class="final-response">
      <div class="heading {view}-center">
        <i class="fab fa-hubspot" />
        Response
      </div>
      <Editor
        width="100%"
        maxLines={25}
        {val}
        eid="ed{eidLeft}"
        {mode}
        readOnly={true}
        fsize="11px"
        highlights={data.result.highlights} />
    </div>
    <div class="verdict">
      <div class="heading {view}-center">
        <i class="fab fa-searchengin" />
        Validation
      </div>
      <div>
        <div class="overall">
          <div class="validator-type">
            <i class="fas fa-broom" />
            {validators[data.test.validator]}
          </div>

          {#if data.test.validator == '0'}
            <i class="fas fa-life-ring" />
            {data.result.overAll.passed} of {data.result.overAll.total}
            <span title="Query Block" style="cursor: pointer;">QB</span>
            {data.result.overAll.passed == 1 ? '' : 's'} passed
          {/if}
        </div>

        {#if data.result.overAll.total != data.result.overAll.passed}
          <div class="verbose {data.result.passed ? 'warn' : ''}">
            {@html data.result.verb}
            {#if data.result.errLineNo != -1 && data.result.errLineNo != undefined}
              at line {data.result.errLineNo}
            {/if}
          </div>
        {/if}

        <div class="query-holder qh-{data.status}">
          <Editor
            width="100%"
            val={data.test.query}
            eid="ed{eidRight}"
            {mode}
            readOnly={true}
            showLineNo={true}
            maxLines={15}
            fsize="11px" />
        </div>

        {#if data.result.overAll.total - data.result.overAll.passed > 1}
          <div class="results">
            <h3>Other Errors:</h3>
            <ol style="height: 100px; overflow: auto;">
              {#each data.result.qbs as res, i}
                {#if !res.status && res.verb != data.result.verb}
                  <li class="qb">
                    {@html res.verb}
                    {res.line != undefined ? ', at line ' + res.line : ''}
                  </li>
                {/if}
              {/each}
            </ol>
          </div>
        {/if}

        {#if data.result.overAll.total == data.result.overAll.passed}
          <div class="all-cool {view}-center">
            <i class="fas fa-check" />
            All the queries passed
          </div>
        {:else if data.result.passed}
          <div class="all-cool {view}-center">
            <i class="fas fa-exclamation" />
            The queries passed partially.
          </div>
        {/if}

      </div>

    </div>
    <div class="report-test {view}-report-test">
      {#if isReported == false}
        <i class="fas fa-exclamation-circle" />
        Is validation wrong?
        <a href="javascript:void(0)" on:click={reportValidation}>Report</a>
      {:else if isReported == true}
        <span style="color: gray;">
          <i class="fas fa-check" />
          Wrong validation reported.
        </span>
      {:else}
        <i class="fas fa-sync fa-spin" />
      {/if}
    </div>
  </div>
  <div
    class={view != defaultView || showBody ? 'hide' : ''}
    style="text-align: center; margin-top: 20px; margin-bottom: 10px; color:
    gray;">
    {@html data.loader}
    Generating ...
  </div>
</div>
