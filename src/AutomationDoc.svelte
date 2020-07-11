<script>
  export let url;


  function copy(id) {
    document.getElementById(id).select();
    document.execCommand('copy');
  }

  var opShort = {
    passed: '[count]',
    failed: '[count]',
    resultURL: '[url]'
  };
</script>

<style>
  .table {
    margin-top: 10px;
    padding: 10px 10px 0px 10px;
  }

  .col {
    padding: 15px;
    word-break: break-word;
  }

  .row {
    display: flex;
  }

  .s2 {
    flex: 15%;
  }

  .s6 {
    flex: 70%;
    border-left: 1px solid #e8e8e8;
  }

  .header {
    font-weight: 600;
  }

  .left-align {
    text-align: left;
  }

  .para {
    margin: 10px 0px;
    font-size: 0.85rem;
  }

  .link {
    padding: 5px 10px;
    border-radius: 3px;
    background-color: #f4f4f4;
    font-size: 0.8rem;
    font-weight: 600;
    color: #A569BD;
    cursor: pointer;
  }

  .table .row:first-child {
    background-color: #eaf2f8;
    border-top-right-radius: 3px;
    border-top-left-radius: 3px;
  }

  .table .row:last-child {
    border-bottom-right-radius: 3px !important;
    border-bottom-left-radius: 3px !important;
  }

  .odd {
    background-color: #ecf0f1;
  }

  .even {
    background-color: #f8f9f9;
  }

  .keyword {
      color: #EC7063;
  }

  .opt {
      border-left: 1px solid #e8e8e8;
  }

  .auto-desc {
    padding: 10px;
    text-align: left;
    margin-top: 20px;
  }

  .result-url {
    margin-top: 15px;
    font-size: .9rem;
  }
</style>

<div class="auto-desc">
<p>
  This Testsuite can be auto triggered by sending a <b>GET</b> request to 
  <span class="link" on:click={() => copy('w12')} title="COPY">{url}</span>
  <input type="text" id="w12" value={url} style="opacity: 0; position: absolute;"> This helps you integrate your tests 
  into you CI/CD pipeline. 
</p>
<p>
  Below is the detailed description on how to send a request based on your requirement.
</p>
</div>

<div class="table">
  <div class="row">
    <div class="col s2 header">Parameter</div>
    <div class="col s2 header opt">Optional</div>
    <div class="col s6 header">Description</div>
  </div>
  <div class="row even">
    <div class="col s2">mode</div>
    <div class="col s2 opt">Yes</div>
    <div class="col s6 left-align">
      Request can be of two modes
      <b>sync</b>
      &amp;
      <b>async</b>
      (default).
      <div class="para">
        <b>sync</b>
        <br />
        Response is returned after all testcases are executed.
      </div>
      <div class="para">
        <b>async</b>
        <br />
        Response is returned immediately. And tests will be executed in the
        background.
      </div>

      <div class="link" on:click={() => copy('w18')} title="COPY"><span class="keyword">curl </span>{url}?mode=sync</div>
      <input type="text" id="w18" value="curl {url}?mode=sync" style="opacity: 0; position: absolute;">
    </div>
  </div>
  <div class="row odd">
    <div class="col s2">op</div>
    <div class="col s2 opt">Yes</div>
    <div class="col s6 left-align">
      Delcares the type of response.
      <div class="para">
        <b>short</b>
        <br />
        Returns short result on completion.
        <div class="link">
            <code style="font-size: .9rem; color: rgb(128, 112, 47)">
            {@html JSON.stringify(opShort, null, '\t').replace(/"/g, '').replace(/\n/g, '<br>').replace(/\t/g, '&nbsp;&nbsp;')}
            </code>
        </div>
        <div class="para">
        ** <b>op</b> parameter makes sense only for Requests with <b>mode</b> as <b>sync</b>.
        </div>
        <div class="link" on:click={() => copy('w13')} title="COPY"><span class="keyword">curl </span>"{url}?mode=sync&amp;op=short"</div>
        <input type="text" id="w13" value="curl '{url}?mode=sync&amp;op=short'" style="opacity: 0; position: absolute;">
      </div>
    </div>
  </div>
</div>
<div class="result-url">
  Result will be available at <a href={url.replace(/\/run/, '/result')} target="_blank">{url.replace(/\/run/, '/result')}</a>
</div>
