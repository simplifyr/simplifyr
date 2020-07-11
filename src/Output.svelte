<script>
  import PartTitle from "./PartTitle.svelte";
  import { visiblePart, form } from './store';
  import { syncS3Files } from './util';


  var opt = [false, false];

  var s3Form = false;

  $form.output = {
      type: '',
      Bucket: 'S3 Bucket',
      Prefix: 'Prefix'
  };

  //gamma-tcu2k-ap-northeast-1

  function selectOption(i) {
    if (!opt[i]) {
      opt = opt.map(n => false);
      opt[i] = true;

      opt = [...opt];

      s3Form = i == 1;
      $form.output.type = s3Form ? 's3' : 'api';
    }
  }

  function nextPart() {
    $visiblePart += 1;
    if(s3Form) {
      syncS3Files($form);
    }
  }
</script>

<style>
  .o-o span {
    padding-right: 15px;
    cursor: pointer;
  }

  .o-o {
    text-align: left;
  }

  .ip {
    float: left;
    width: 49%;

  }

  .s3-form {
      display: flex;
      margin: 20px 10px 20px 0px;
 }

  
.s3-form .ip:last-child {
    margin-left: 5px;
    float: right !important;
}

</style>

<div class="container {$visiblePart != 1 ? 'hide' : ''}">
  <PartTitle title="Response Type" />
  <div class="o-o">
    <span on:click={() => selectOption(0)}>
      <i class="fa{opt[0] ? 's' : 'r'} fa-circle" />
      API Response
    </span>
    <span on:click={() => selectOption(1)}>
      <i class="fa{opt[1] ? 's' : 'r'} fa-circle" />
      S3 Bucket
    </span>

    <div style="display: {s3Form ? 'block' : 'none'}" class="s3-form">
      <div class="ip">
        <label>Bucket Name</label>
        <input type="text" bind:value={$form.output.Bucket} />
      </div>
      <div class="ip">
        <label>Path</label>
        <input type="text" bind:value={$form.output.Prefix} />
      </div>
    </div>
  </div>
  <div style="text-align: right; padding: 10px;">
    <button class="next-btn" on:click={nextPart}>
      Next
      <i class="fas fa-arrow-right" />
    </button>
  </div>
</div>
