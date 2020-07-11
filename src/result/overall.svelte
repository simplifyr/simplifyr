<script>
  import Graph from "./graph.svelte";
  import { sfs } from "../result-store";
  import { getChartData } from "../util";

  export let dates;

  let map = {};
  let resultData;
  let resultOpts = {
    high: 0
  };
  let percentageData;

  dates.forEach(date => {
    let key = moment(date).format("DD/MM'YY");
    if (map[key] == undefined) {
      map[key] = 0;
    }
    map[key]++;
  });

  var executionData = {
    labels: Object.keys(map),
    series: Object.values(map)
  };

  sfs.subscribe(function() {
    if ($sfs) {
      resultData = toResultData();
      percentageData = toPercentageData();
    }
  });

  function toResultData(failedNeeded = false) {
    Date.prototype.short = function() {
      return this.getDate() + "/" + (this.getMonth() + 1);
    };
    var data = {
      labels: [],
      series: [[]]
    };

    if (failedNeeded) {
      data.series.push([]);
    }

    for (var sf of $sfs) {
      data.labels.push('');
      data.series[0].push(sf.passed);
      if (failedNeeded) {
        data.series[1].push(sf.failed);
      }
    }
    resultOpts.high = $sfs[0].total;
    return data;
  }

  function toPercentageData() {
    var stat = {
      passed: 0,
      failed: 0,
      total: 0
    };

    for (var sf of $sfs) {
      stat.passed += sf.passed;
      stat.failed += sf.failed;
      stat.total += sf.total;
    }

    stat.passed = ((stat.passed * 100) / stat.total).toFixed(2);
    stat.failed = ((stat.failed * 100) / stat.total).toFixed(2);

    return getChartData(stat, 1);
  }
</script>

<style>
  .overall {
    /*height: 600px;*/
    background-color: #fff;
    border: 1px solid #dddfe2;
    min-width: 294px;
    max-width: 294px;
    /*position: fixed;*/
    border-radius: 3px;
    padding-bottom: 15px;
  }

  .heading {
    line-height: 40px;
    padding: 0px 10px;
    background-color: #f8f8f8;
  }

  .block {
    text-align: center;
    text-transform: uppercase;
    color: #b1afaf;
    font-size: 0.8rem;
    padding: 27px 0px;
    border-top: 1px solid #efefef;
    border-top-style: dotted;
  }

  .exe-count {
    font-size: 7rem;
    color: #ff7043;
    font-family: "Gelasio", serif;
  }
</style>

<div class="overall">
  <div class="heading">
    <b>Overall</b>
  </div>
  <div class="block">
    <div>testsuite has been executed</div>
    <div class="exe-count">{dates.length}</div>
    <div>times</div>
  </div>
  {#if resultData}
    <div class="block">
      <Graph chartData={resultData} type="line" opts={resultOpts} />
      Passed Testcases by date
    </div>
  {/if}

  {#if percentageData}
    <div class="block">
      <Graph chartData={percentageData} type="doughnut" />
      PAss/Fail Percentage
    </div>
  {/if}
  <div class="block">
    <Graph chartData={executionData} type="bar" />
    Date wise execution count
  </div>
</div>
