<script>
  import Graph from "./graph.svelte";
  import { getChartData } from  '../util';

  export let stat;
  export let timingChartData;

  var chartData = getChartData(stat, 0);

</script>

<style>
  .body {
    background-color: #fff;
    border: 1px solid #dddfe2;
    padding: 0px 0px 10px 0px;
    margin-top: 20px;
    border-radius: 3px;
  }

  .heading {
    padding: 10px;
    background-color: #f8f8f8;
    margin-left: 0px;
    margin-right: 0px;
    font-weight: 600;
  }

  

  .row {
    display: flex;
    margin-top: 15px;
  }

  .col {
    flex: 48%;
    text-align: center;
    text-transform: uppercase;
    color: gray;
    font-size: 0.8rem;
  }
</style>

<div class="body">
  <div class="heading">Quick Stats</div>
  <div class="row">
    <div class="col">
      <Graph {chartData} type={'doughnut'}  />
      Testcase status
    </div>

    <div class="col">
      <Graph chartData={timingChartData} type={'bar'} />
      Time taken by each testcase
    </div>
  </div>
</div>
