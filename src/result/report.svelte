<script>
  import Stats from "./stats.svelte";
  import Testcase from "./testcase.svelte";
  import { beforeUpdate } from "svelte";
  import { data } from '../result-store'; 

  export let testcases;
  export let stat;

  let timingChartData;

  beforeUpdate(() => {
    timingChartData = {
      series: [],
      labels: []
    };
    let i = 1;
    for (var testcase of testcases) {
      let timing = ((testcase._et - testcase._st) / 1000).toFixed(2);
      testcase.timeTaken = timing + "s";
      timingChartData.series.push(timing);
      timingChartData.labels.push("T" + i);
      i++;
    }
  });


</script>

<div>
  <Stats {stat} {timingChartData} />

  {#each testcases as testcase, index}
    <Testcase {testcase} {index}/>
  {/each}

</div>
