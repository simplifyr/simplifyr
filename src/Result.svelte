<script>
  import PartTitle from "./PartTitle.svelte";
  import {
    form,
    visiblePart,
    runTests,
    currentProgress,
    showModal,
    theme
  } from "./store";
  import { postData, syncS3Files, postPlainData } from "./util";
  import { validator } from "./validator";
  import AutomationDoc from "./AutomationDoc.svelte";

  var progressDiv;
  var op = [];
  var autoReqList = [];
  var autoUrl = null;
  var learnMore = false;
  var syncingS3 = false;
  const LOADER = '<i class="fas fa-sync fa-spin"></i>';
  const ELLIPSIS = '<i class="fas fa-ellipsis-h"></i>';

  var saveBtnText = [
    '<i class="fas fa-save"></i> Save',
    LOADER + " Saving...",
    '<i class="fas fa-check"></i> Saved',
    '<a href="{link}" target="_blank"><i class="fas fa-external-link-alt"></i> Open Result</a>'
  ];

  var saveBtnCls = ['', 'disabled', 'success', ''];

  var saveBtnIndex = 0;

  var TestRunner = {
    runNext: async function() {
      var o = op[this.currentTest];
      o._st = new Date().getTime();
      var req = Object.assign({}, $form.httpReqOpt);
      var test = this.tests[this.currentTest];
      this.currentTest++;
      req.body = test.ip;
      o.apiResp = o.loader;
      op = [...op];
      populateAutoReqList(req, test);
      let res = await postData("/api/post-test", req);
      updateAPIStatus(o, res);
    },

    init: function(tests) {
      this.tests = tests;
      this.currentTest = 0;
    },
    hasNext: function() {
      return this.currentTest < this.tests.length;
    }
  };

  runTests.subscribe(async function() {
    if ($runTests) {
      saveBtnIndex = 0;
      autoUrl = null;
      if ($form.output.type == "s3" && !$form.s3Syncd) {
        syncingS3 = true;
        await syncS3Files($form);
        __next();
      } else {
        __next();
      }
    }
  });

  function __next() {
    syncingS3 = false;
    op = [];
    var tests = $form.testcases;
    for (var i = 0; i < tests.length; i++) {
      var o = getBasicOP(tests[i], i + 1);
      o.apiErr = false;
      op.push(o);
    }
    autoReqList = [];
    $currentProgress = 3 / 4 - 0.01;
    progressDiv = (1 - $currentProgress) / tests.length;
    autoUrl = null;
    TestRunner.init(tests);
    TestRunner.runNext();
    $runTests = false;
  }

  async function syncS3(o) {
    o.attempts++;
    var s = await syncS3Files($form);
    if (s && s.length > 0) {
      var awsApiDate = new Date(o.test.result.headers.date).getTime();
      var found = false;
      for (var f of s) {
        var lastModified = new Date(f.cd).getTime();
        if (isTargetFile(awsApiDate, lastModified)) {
          delete f.cd;
          o._response = await postData("/api/s3-file", f);
          try {
            o._response = JSON.parse(o._response);
          } catch (e) {}
          updateS3Status(o, "check");
          found = true;
          break;
        }
      }

      if (!found) {
        syncS3Again(o);
      }
    } else {
      syncS3Again(o);
    }
  }

  function syncS3Again(o) {
    if (o.attempts < 50) {
      syncS3(o);
    } else {
      updateS3Status(o, "times");
    }
  }

  function populateAutoReqList(req, test) {
    autoReqList.push({
      req,
      output: $form.output,
      query: test.query,
      validator: test.validator,
      title: test.title
    });
  }

  function updateAPIStatus(o, res) {
    o.test.result = res;
    o.s3 = LOADER;
    o.apiResp = res.status.code + ' ' + res.status.msg;

    if (res.status.code === 600) {
      o.apiErr = true;
    }
    if ($form.output.type === "s3") {
      op = [...op];
      if (!o.apiErr) {
        syncS3(o);
      } else {
        updateS3Status(o, "times");
      }
    } else {
      o._response = res;
      updateValidationStatus(o);
    }
  }

  function updateS3Status(o, s3) {
    o.validation = LOADER;
    o.s3 = '<i class="fas fa-' + s3 + '"></i>';
    validateResponse(o);
    runNextTest();
  }

  function updateValidationStatus(o) {
    o.validation = LOADER;
    runNextTest();
    op = [...op];
    validateResponse(o);
  }

  function validateResponse(o) {
    op = [...op];
    $currentProgress += progressDiv;
    validator(o);
    op = [...op];
  }

  const __TS__ = () => $form.testSuite.replace(/\s+/g, "-");

  function runNextTest() {
    if (TestRunner.hasNext()) {
      TestRunner.runNext();
    } else {
      var apiUrl =
        "/api/teams/" +
        $form._TEAM +
        "/automation/" +
        "auto::" +
        $form._TEAM +
        "::" +
        __TS__();

      autoUrl = toAutoURL();

      postPlainData(apiUrl, JSON.stringify(autoReqList));
    }
  }

  function toAutoURL() {
    return (
      window.location.origin +
      "/run/teams/" +
      $form._TEAM +
      "/automation/" +
      __TS__() +
      "/"
    );
  }

  function isTargetFile(aws, lm, df) {
    return  lm - aws <= 80000;
  }



  function getBasicOP(test, i) {
    return {
      test,
      no: i,
      desc: test.title,
      loader: LOADER,
      apiResp: ELLIPSIS,
      s3: ELLIPSIS,
      validation: ELLIPSIS,
      timeTaken: ELLIPSIS,
      attempts: 0
    };
  }

  function showDetails(o) {
    o.tsuite = $form._TEAM + "::" + $form.testSuite.replace(/\s+/, "-");
    $form.modal.type = 0;
    $form.modal.data = o;
    $form.modal.width = 80;
    $showModal = true;
  }

  function _normalize(apiResp) {
    var uselessDiv = document.getElementById("--useless--");
    var { loader, validation } = getBasicOP({ title: "" }, null);
    if (apiResp != loader && apiResp != validation) {
      uselessDiv.innerHTML = apiResp;
      apiResp = uselessDiv.innerText;
    }
    return apiResp;
  }

  async function saveAll() {
    if (saveBtnIndex === 3) {
      return;
    }
    saveBtnIndex = 1;
    var sf = {
      passed: 0,
      failed: 0,
      total: op.length
    };
    for (var o of op) {
      sf.passed += o.status == "passed" ? 1 : 0;
      delete o.test.ip;
    }
    sf.failed = sf.total - sf.passed;

    var now = new Date().getTime();

    var key = "result::" + $form._TEAM + "::" + __TS__() + "::" + now;

    var r = JSON.stringify({
      sf,
      result: op,
      done: true
    });

    var resp = await postPlainData("/api/key/" + key, JSON.stringify(r));
    if (resp.status === "OK") {
      saveBtnIndex = 2;
      setTimeout(function() {
        saveBtnText[3] = saveBtnText[3].replace(
          "{link}",
          toAutoURL().replace("run", "result") + "?" + now
        );
        saveBtnIndex = 3;
      }, 2000);
    } else {
      saveBtnIndex = 0;
    }
  }
</script>

<style>
  table {
    border-collapse: collapse;
    width: 100%;
  }

  table th {
    color: #566573;
    padding: 5px 3px;
  }

  table tbody tr:hover {
    background-color: #f1f1f1;
    cursor: pointer;
  }

  table td {
    color: #4d5656;
    font-size: 0.9rem;
    padding: 9px 3px;
  }

  .api-res-col {
    width: 20px;
    max-width: 200px;
    min-width: 200px;
    word-break: break-word;
  }

  .tab-container {
    margin-bottom: 20px;
    margin-left: -9px;
  }

  .no-test {
    text-align: center;
    opacity: 0.7;
  }

  .no-test img {
    width: 100%;
    max-width: 320px;
  }

  .no-test .no-test-msg {
    text-transform: uppercase;
    color: gray;
  }

  .auto-link {
    margin: 25px 0px 0px 0px;
    font-size: 0.85rem;
    color: gray;
    user-select: none;
  }

  #learn-more {
    color: blue;
    margin-left: 15px;
  }

  #learn-more:hover {
    text-decoration: underline;
    cursor: pointer;
  }

  .save-result-btn {
    top: 5px;
    right: 10px;
    line-height: 36px;
    font-size: 0.9rem;
    position: absolute;
    transition: all 0.3s ease;
    cursor: pointer;
    color: #673ab7;
    font-weight: 600;
  }

  .save-result-btn:hover {
    color: #512DA8;
  }
</style>

<div class="container {$visiblePart != 3 ? 'hide' : ''}">
  <PartTitle title="Test Results" />
  <div
    class="save-result-btn {autoUrl ? '' : 'hide'}
    {saveBtnCls[saveBtnIndex]}"
    on:click={saveAll}>
    {@html saveBtnText[saveBtnIndex]}
  </div>
  <div class="tab-container">
    <div class="{op.length == 0 || syncingS3 ? '' : 'hide'} no-test">
      <img src="/test.png" alt="test" />
      <div class="no-test-msg">
        {@html syncingS3 ? LOADER + '  Syncing with S3...' : 'Try running some tests'}
      </div>
    </div>
    <table class={op.length > 0 && !syncingS3 ? '' : 'hide'}>
      <thead>
        <tr>
          <th>Case No.</th>
          <th>Description</th>
          <th class="api-res-col">API Response</th>
          <th class={$form.output.type != 's3' ? 'hide' : ''}>File on S3</th>
          <th>Validation</th>
          <th>Time</th>
        </tr>
      </thead>
      <tbody>
        {#each op as o}
          <tr on:click={() => showDetails(o)}>
            <td>{o.no}</td>
            <td>{o.desc}</td>
            <td class="api-res-col {o.apiErr ? 'failed' : ''}">
              {@html _normalize(o.apiResp)}
            </td>
            <td class={$form.output.type != 's3' ? 'hide' : ''}>
              {@html o.s3}
            </td>
            <td>
              {@html o.validation}
            </td>
            <td>
              {@html o.timeTaken}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
    {#if autoUrl != null}
      <div class="auto-link">
        <b>
          <i class="fas fa-cogs" />
        </b>
        &nbsp;
        {@html autoUrl}
        <span id="learn-more" on:click={() => (learnMore = !learnMore)}>
          <i class="fas fa-info-circle" />
          {!learnMore ? 'show more' : 'hide'}
        </span>
      </div>
      <div class=" {learnMore ? '' : 'hide'}">
        <AutomationDoc url={autoUrl} />
      </div>
    {/if}
  </div>
</div>
