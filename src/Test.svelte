<script>
  import PartTitle from "./PartTitle.svelte";
  import Editor from "./Editor.svelte";
  import { form, visiblePart, runTests, showModal, contentType } from "./store";
  import {
    postData,
    readHistory,
    postPlainData,
    getData,
    parseSFRFileContent
  } from "./util";

  import { onMount } from "svelte";

  var mode = 'xml';
  var fsize = "10pt";
  var border = "1px";
  var showingATest = false;
  var title = "Sample Test";
  var runnable = false;
  var validator = 0;
  var testToUpdate;
  var loadingFile = false;
  var isS3FormNeeded = false;
  var s3Location = "";
  var localHistoryItems = [];
  $form._TEAM = window.sessionStorage.team;
  var defaultTestSuiteName = "Untitled Test Suite";
  var testSuiteName = defaultTestSuiteName;
  var testSuiteRef;
  var showIpOptions = false;
  var showHistory = false;
  var searchText = "";
  var testcases = [];
  var historyItems = [];
  var searchableHistoryItems = [];

  var simTestCount;
  var isSimulationRequired = false;


  var tssIco = ['fa-hdd', 'fa-circle-notch fa-spin'];
  var tssIcoIndex = 0;

  $form.testcases = testcases;

  onMount(() => {
    readHistory($form._TEAM).then(function(data) {
      localHistoryItems = data;
    });
  });

  contentType.subscribe(() => {
    if($form['ed2']) {
      $form['ed2'].session.setMode('ace/mode/' + ($contentType || mode));
    }
  });

  function newTestSuite() {
    return prompt("Describe the Test Suite");
  }

  function saveTestCase() {
    var ip = $form["ed2"].getSession().getValue();
    var query = $form["ed3"].getSession().getValue();

    if (
      (ip.length == 0 && $form.httpReqOpt.method != "GET") ||
      query.length == 0 ||
      title.length == 0
    ) {
      return;
    }

    let uuid = new Date().getTime().toString(16);
    var test = {
      ip,
      query,
      title,
      uuid,
      index: testcases.length,
      validator
    };

    _saveOrUpdateTest(test);
  }

  function _saveOrUpdateTest(test) {
    if (!showingATest) {
      __save(test);
    } else {
      var props = ["ip", "query", "title", "validator"];
      for (var prop of props) {
        testToUpdate[prop] = test[prop];
      }
      if (saveInLocal()) {
        _persist();
      }
      showingATest = false;
    }
  }

  function clearIpForm() {
    $form["ed2"].getSession().setValue("");
    $form["ed3"].getSession().setValue("");
    title = "";
  }

  function __save(test) {
    if (saveInLocal()) {
      $form[test.uuid] = test;
      $form.testcases.push(test);
      testcases = [...$form.testcases];
      _persist();
      checkIsTestable();
    }
  }

  function showThisTest(uuid) {
    for (var test of $form.testcases) {
      if (test.uuid == uuid) {
        break;
      }
    }
    $form["ed2"].getSession().setValue(test.ip);
    $form["ed3"].getSession().setValue(test.query);
    title = test.title;
    validator = test.validator;
    showingATest = true;
    testToUpdate = test;
  }

  function deleteThis(e, uuid) {
    e.stopPropagation();
    for (var index = 0; index < testcases.length; index++) {
      if (testcases[index].uuid == uuid) {
        break;
      }
    }

    if (confirm("`" + testcases[index].title + "` will be deleted!")) {
      testcases.splice(index, 1);
      testcases = [...testcases];
      _persist();
    }
  }

  function checkIsTestable() {
    runnable =
      $form["ed1"].getSession().getValue().length > 0 &&
      testcases.length > 0 &&
      $form.output.type.length > 0;
  }

  function runTest() {
    $runTests = true;
    $visiblePart = 3;
  }

  function saveInLocal() {
    if (testSuiteName === defaultTestSuiteName && $form.testcases.length == 0) {
      testSuiteName = newTestSuite();
      if (testSuiteName && isTestSuiteUnique(testSuiteName)) {
        var now = new Date().getTime();
        testSuiteRef = testSuiteName.replace(/\s+/g, "-") + "-RS" + now;
        $form.testSuite = testSuiteName;
        localHistoryItems.push(testSuiteRef);
        return true;
      } else {
        testSuiteName = defaultTestSuiteName;
        return false;
      }
    } else {
      return true;
    }
  }

  async function _persist() {
    var tsKey =
      $form._TEAM +
      "::" +
      removeExistingTestCount(testSuiteRef) +
      "::" +
      $form.testcases.length;
    var res = await postPlainData(
      "/api/teams/" + $form._TEAM + "/testsuites/" + tsKey,
      JSON.stringify($form.testcases)
    );
    clearIpForm();

    function removeExistingTestCount(testSuiteRef) {
      return testSuiteRef.replace(/::\d+$/, "");
    }
  }

  function isTestSuiteUnique(name) {
    name = name.replace(/\s+/, "-");
    for (var item of localHistoryItems) {
      item = item.replace(/-RS\d+::\d+$/, "");
      if (item === name) {
        return false;
      }
    }
    return true;
  }

  function readFile(e) {
    var files = e.target.files;
    if (files && files.length > 0) {
      loadingFile = true;
      getFileIterator(files).read();
    }
    return false;
  }

  function isSimplifyrFile(name) {
    return /\.sfr$/.test(name);
  }

  function getFileIterator(files) {
    var i = 0;

    function read() {
      var file = files[i];
      var reader = new FileReader();

      reader.onload = function() {
        if (isSimplifyrFile(file.name)) {
          createTestCase(reader.result);
          saveTestCase();
        } else {
          setEditorMode(file.name);
          $form["ed2"].getSession().setValue(reader.result);
        }
        if (next()) {
          read();
        } else {
          loadingFile = false;
        }
      };

      reader.onerror = function() {};
      reader.readAsText(file);
    }

    function next() {
      i++;
      return i < files.length;
    }

    return {
      read
    };
  }

  function createTestCase(content) {
    var tc = parseSFRFileContent(content);
    if (tc) {
      validator = tc.validator;
      $form["ed2"].session.setMode("ace/mode/" + tc.mode);
      $form["ed2"].getSession().setValue(tc.ip);
      $form["ed3"].getSession().setValue(tc.validation);
      title = tc.title;
    }
  }

  function loadFile(e) {
    var el = e.target;
    while (Object.keys(el.dataset).length != 1) {
      el = el.parentNode;
    }
    var act = el.dataset["act"];

    if (act == undefined) {
      return;
    }
    if (act == "0") {
      document.getElementById("file").click();
    } else if (act == "2") {
      $form["ed2"]
        .getSession()
        .setValue($form.testcases[$form.testcases.length - 1].ip);
      $form["ed3"]
        .getSession()
        .setValue($form.testcases[$form.testcases.length - 1].query);
    } else if (act == "1") {
      //loadFromS3();
      isS3FormNeeded = true;
    } else if (act == "3") {
      //loadFromS3();
      isSimulationRequired = true;
    }
  }

  async function loadFromS3() {
    var key = s3Location;
    if (!isS3Path(key)) {
      return;
    }
    var slashAt = key.indexOf("/");
    var payload = {
      Bucket: key.substr(0, slashAt),
      Key: key.substr(slashAt + 1)
    };
    var data = await postData("/api/s3-file", payload);
    if (typeof data == "object" && typeof data != "string") {
      data = JSON.stringify(data);
    }
    setEditorMode(payload.Key);
    $form["ed2"].getSession().setValue(data);
    isS3FormNeeded = false;

    function isS3Path(p) {
      return !(p.length == 0 || p.split("\n").length > 1 || !/\//.test(p));
    }
  }

  function setEditorMode(file) {
    var i = file.lastIndexOf(".") + 1;
    var ext = file.substr(i);
    $form["ed2"].session.setMode("ace/mode/" + ext);
  }

  function updateValidator() {}

  function showSavedTests() {
    showHistory = !showHistory;
    if (!showHistory) {
      return;
    }
    var history = [];
    for (var h of localHistoryItems) {
      var meta = /(-RS\d+)/.exec(h)[0];
      var name = h
        .replace(meta, "")
        .replace(/-/g, " ")
        .replace(/::\d+$/, "");
      var ntests = /::(\d+)$/.exec(h)[1];
      history.push({
        key: h,
        name,
        cd: formattedDate(meta),
        ntests
      });
    }
    searchableHistoryItems = historyItems = history;
  }

  function formattedDate(meta) {
    var t = new Date(parseInt(meta.replace("-RS", "")));
    return moment(t).fromNow();
  }

  async function useThisTestSuite(ts) {
    tssIcoIndex = 1;
    showHistory = false;
    if (!ts.tests) {
      var res = await getData(
        "/api/teams/" +
          $form._TEAM +
          "/testsuites/" +
          $form._TEAM +
          "::" +
          ts.key
      );
      ts.tests = JSON.parse(res.testsuite);
    }
    testcases = $form.testcases = ts.tests;
    testSuiteName = ts.name;
    $form.testSuite = ts.name;
    document.getElementsByTagName("title")[0].innerText =
      "SimplifyR: " + ts.name;
    testSuiteRef = ts.key;
    checkIsTestable();
    clearIpForm();
    tssIcoIndex = 0;
  }

  function replicateTests() {
    var testToReplicate = testcases[0];
    for (var i = 0; i < simTestCount; i++) {
      var uuid = new Date().getTime().toString(16);
      var newTest = Object.assign({}, testToReplicate);
      newTest.title += "-" + uuid;
      newTest.uuid = uuid;
      newTest.index = $form.testcases.length;
      $form.testcases.push(newTest);
    }
    testcases = [...$form.testcases];
    isSimulationRequired = false;
    if (saveInLocal()) {
      _persist();
    }
  }

  function searchAndShow() {
    historyItems = searchableHistoryItems;
    if (searchText.length != 0) {
      var itemsToDisplay = historyItems.filter(h => {
        var regex = new RegExp(searchText, "i");
        return regex.test(h.name);
      });
      historyItems = itemsToDisplay;
    }
  }

  function showRJQLDoc() {
    $form.modal.type = 1;
    $form.modal.width = 80;
    $form.modal.topCloseBtn = false;
    $showModal = true;
  }

  var sampleQuery = `msg = "PONG"`;
  var sampleXML = ``;
</script>

<style>
  .label {
    text-align: left;
    margin-bottom: 14px;
    padding-left: 3px;
    position: relative;
    font-weight: 600;
    color: #868686;
  }

  .adder {
    background-color: #e1e1e1 !important;
    color: gray !important;
    user-select: none;
    margin-right: -2px;
  }

  .test:hover .delete-btn {
    display: block;
  }

  .delete-btn {
    display: none;
    position: absolute;
    margin-top: -22px;
    margin-left: 28px;
    color: darkgray;
    font-size: 16px;
  }

  .test:hover .title {
    display: block;
  }

  .title {
    display: none;
    position: absolute;
    color: #cbc5c5;
    margin-top: 40px;
    margin-left: -5px;
    width: 170px;
    background-color: #141313;
    box-shadow: 0px 6px 10px 0px rgba(0, 0, 0, 0.5);
    border-radius: 3px;
    z-index: 1000;
    text-align: left;
    line-height: 20px;
    padding: 4px 10px;
    font-size: 0.7rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .test-runner-btn {
    position: absolute;
    right: 8px;
    top: 11px;
    color: #d4ac0d;
    transition: all 0.3s ease;
    cursor: pointer;
  }

  .test-runner-btn:hover {
    transform: scale(1.2, 1.2);
  }

  #file {
    width: 31px;
    position: absolute;
    margin-left: -10px;
    margin-top: -3px;
    height: 24px;
    opacity: 0;
    cursor: pointer;
  }

  select {
    border: none;
    border-bottom: 2px solid #ccc;
    outline: none;
    border-radius: 0px;
    color: gray;
    padding: 0px;
    margin: 0px;
  }

  select option {
    color: gray;
    font-size: 0.9rem;
    border: none;
  }

  select option:hover {
    background-color: #e1e1e1;
  }

  select option:focus {
    outline: none;
  }

  .ip-options {
    position: absolute;
    top: 0px;
    left: 113px;
    color: #3c3c3c;
    z-index: 100;
    cursor: pointer;
  }

  .ip-options:hover .opt-list {
    display: block;
  }

  .ip-options .opt-list {
    display: none;
    background-color: #fff;
    box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.5);
    border-radius: 2px;
    padding: 4px 0px;
  }

  .ip-options .opt {
    font-size: 0.8rem;
    text-align: left;
    padding: 3px 12px 3px 9px;
    transition: all 0.1s ease;
    color: #756a6a;
  }

  .ip-options .opt:hover {
    background-color: #e9e9e9;
    cursor: pointer;
  }

  .ip-options .opt span {
    padding-left: 5px;
  }

  .disabled {
    pointer-events: none;
    opacity: 0.3;
  }

  .s3-form {
    margin-left: -2px;
    box-shadow: 0px 0px 7px 0px rgba(0, 0, 0, 0.2);
    background-color: #fff;
    padding: 8px 10px 0px 10px;
    border-radius: 2px;
    border: 1px solid #e7e7e7;
    margin-top: -9px;
    position: absolute;
    z-index: 10;
    width: 95%;
    text-align: left;
  }

  .s3-form input {
    border: none;
    outline: none;
    width: 80%;
  }

  .s3-form span {
    padding: 0px 5px;
    cursor: pointer;
  }

  .act-wrapper {
    text-align: right;
    position: absolute;
    top: 15px;
    right: 10px;
  }

  .red {
    color: #e74c3c;
  }

  .green {
    color: #28b463;
  }

  .history {
    position: absolute;
    top: 1px;
    left: 0px;
    color: grey;
    width: 46px;
    line-height: 46px;
    cursor: pointer;
  }

  .saved-suites {
    position: absolute;
    top: 46px;
    left: 0px;
    background-color: #fff;
    box-shadow: 0px 6px 8px -1px rgba(0, 0, 0, 0.17);
    text-align: left;
    border-top: none;
    z-index: 1000;
    max-height: 188px;
    overflow: auto;
    width: 100%;
  }

  .saved-suites .suite {
    padding: 10px 5px;
    width: 100%;
    box-sizing: border-box;
    border-top: 1px solid #f7f7f7;
    position: relative;
  }

  .saved-suites .suite:first-child {
    border-top: none;
  }

  .suite:hover .btn {
    display: block;
  }

  .suite .btn {
    display: none;
    position: absolute;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
    z-index: 1001;
    transition: all 0.2s ease;
    background-color: rgba(0, 0, 0, 0.1);
  }

  .suite .btn .hldr {
    text-align: center;
    margin-top: 19px;
  }

  .suite .btn .hldr span {
    border: 2px solid #f1c40f;
    padding: 4px 20px;
    border-radius: 3px;
    cursor: pointer;
    transition: all 0.2s ease;
    background-color: #fad7a0;
    box-shadow: 0px 2px 9px 0px rgba(0, 0, 0, 0.5);
  }

  .suite .btn .hldr span:hover {
    background-color: #f1c40f;
  }

  .ts-n {
    font-weight: 600;
    margin-bottom: 5px;
    color: rgba(0, 0, 0, 0.6);
    font-size: 14px;
  }

  .ts-n i {
    padding-right: 8px;
  }

  .ts-cd {
    position: relative;
    font-size: 0.7rem;
    color: #ccc;
    text-align: right;
  }

  .t-cnt {
    position: absolute;
  }

  .hist-1 {
    border-right: 1px solid #e9e9e9;
    background-color: #fff;
  }

  .hist-search {
    position: absolute;
    top: -2px;
    left: 50px;
  }

  .hist-search input {
    font-size: 11px;
    background-color: transparent;
    border: none;
    outline: none;
    color: #5a5353;
  }

  .rjql-doc-link {
    display: inline-block;
    font-size: 0.9rem;
    font-weight: 400;
    color: #6d6da7;
    cursor: pointer;
    transition: all 0.3s ease-in-out;
  }

  .rjql-doc-link:hover {
    transform: scale(1.2, 1.2);
  }
</style>

<div class="container {$visiblePart != 2 ? 'hide' : ''}">
  <div
    class="history {localHistoryItems.length == 0 || tssIcoIndex != 0 ? 'disabled' : ''}
    {showHistory ? 'hist-1' : ''}"
    on:click={showSavedTests}
    title="Saved Tests">
    <i class="fas {tssIco[tssIcoIndex]}" />
    <div
      class="hist-search {showHistory ? '' : 'hide'}"
      on:click={e => e.stopPropagation()}>
      <input
        type="text"
        placeholder="Start typing..."
        on:keyup={searchAndShow}
        bind:value={searchText} />
    </div>
  </div>
  <div class="saved-suites {showHistory ? '' : 'hide'}">
    {#each historyItems as history}
      <div class="suite">
        <div class="btn">
          <div class="hldr">
            <span on:click={() => useThisTestSuite(history)}>
              <i class="fas fa-clone" />
              USE
            </span>
          </div>
        </div>
        <div class="ts-n">
          <i class="fas fa-stream" />
          {@html history.name}
        </div>
        <div class="ts-cd">
          <div class="t-cnt">
            {history.ntests} Test{history.ntests > 1 ? 's' : ''}
          </div>
          {history.cd}
        </div>
      </div>
    {/each}
  </div>

  <PartTitle title={testSuiteName} />

  <div class="test-runner-btn {runnable ? '' : 'disabled'}" on:click={runTest}>
    <i class="fas fa-bolt" />
    Run
  </div>
  <div
    class="ip"
    style="text-align: left; margin-bottom: 10px; margin-right: 10px;">
    <input
      type="text"
      placeholder="Describe your test"
      bind:value={title}
      style="border-color: #efefef;" />
  </div>
  <div style="display: flex;">

    <div
      style="flex: 7; border-right: 1px solid rgb(241, 241, 241); position:
      relative;">
      <div class="label">
        Input Payload
        <input
          type="file"
          id="file"
          title="Add File"
          on:change={readFile}
          style="display:none;"
          multiple
          accept=".sfr" />
      </div>
      <div class="ip-options">
        <div class={loadingFile ? 'hide' : ''}>
          <div style="text-align: left; color:#888181;">
            <i class="fas fa-bars" />
          </div>
          <div
            class="opt-list {isS3FormNeeded || isSimulationRequired ? 'hide' : ''}" >
            <div class="opt" data-act="0" on:click={loadFile} style="display: none">
              <i class="fas fa-desktop" />
              <span>Load from PC</span>
            </div>
            <div class="opt" data-act="1" on:click={loadFile} style="display: none">
              <i class="fab fa-aws" />
              <span>Read S3 file</span>
            </div>
            <div
              class="opt {$form.testcases.length == 0 ? 'disabled' : ''}"
              data-act="2"
              on:click={loadFile}>
              <i class="far fa-folder" />
              <span>Copy last test</span>
            </div>
            <div
              class="opt {$form.testcases.length == 0 ? 'disabled' : ''}"
              data-act="3"
              on:click={loadFile}>
              <i class="far fa-window-restore" />
              <span>Replicate test</span>
            </div>
          </div>
        </div>

        <div class={!loadingFile ? 'hide' : ''}>
          <i class="fas fa-circle-notch fa-spin" />
        </div>
      </div>
      <div class="{!isS3FormNeeded ? 'hide' : ''} s3-form">
        <input type="text" placeholder="S3 File Location" bind:value={s3Location} />
        <div class="act-wrapper">
          <span class="s3-act green" on:click={loadFromS3}>
            <i class="fas fa-check" />
          </span>
          <span class="s3-act red" on:click={() => (isS3FormNeeded = false)}>
            <i class="fas fa-times" />
          </span>
        </div>
      </div>
      <div class="{!isSimulationRequired ? 'hide' : ''} s3-form">
        <input
          type="text"
          placeholder="Enter Test Count"
          bind:value={simTestCount} />
        <div class="act-wrapper">
          <span class="s3-act green" on:click={replicateTests}>
            <i class="fas fa-check" />
          </span>
          <span
            class="s3-act red"
            on:click={() => (isSimulationRequired = false)}>
            <i class="fas fa-times" />
          </span>
        </div>
      </div>
      <Editor width="100%" val={sampleXML} eid="ed2" {mode} {fsize} />
    </div>
    <div style="flex: 3 1 3%; margin-left: 10px; ">
      <div class="label" style="margin-bottom: 10px;">
        Validator
        <select bind:value={validator} on:change={updateValidator}>
          <option value="0">RJQL</option>
          <option value="1">Text</option>
          <option value="2">RegEx</option>
        </select>
        <div
          class="rjql-doc-link {validator == 0 ? '' : 'hide'}"
          on:click={() => showRJQLDoc()}
          title="What is RJQL">
          <i class="fas fa-question-circle" />
        </div>
      </div>
      <Editor
        width="98%"
        val={sampleQuery}
        eid="ed3"
        mode="javascript"
        showLineNo={false}
        {fsize} />
    </div>
  </div>

  <div style="text-align: left; margin: 10px 0px;">
    <div
      class="test adder"
      on:click={saveTestCase}
      title={showingATest ? 'Update' : 'Save'}>
      <i class="fas fa-{showingATest ? 'check' : 'plus'}" />
    </div>
    {#each testcases as test, i}
      <div class="test" on:click={() => showThisTest(test.uuid)}>
        <div class="delete-btn" on:click={e => deleteThis(e, test.uuid)}>
          <i class="fas fa-minus-circle" />
        </div>
        <div class="title">{test.title}</div>
        <i class="fas fa-receipt" />
        {i + 1}
      </div>
    {/each}
  </div>
</div>
