<script>
  import { onMount } from "svelte";
  export let chartData;
  export let type;
  export let opts = {};

  let chartId;

  onMount(() => {
    chartId = "chart-" + parseInt(new Date().getTime() * Math.random());
    var defaultOption = {
      height: 250
    };

    let Chart = getChart();

    setTimeout(() => {
      new Chart(
        "#" + chartId,
        chartData,
        Object.assign(defaultOption, Object.assign(opts, options[type]))
      );
    }, 50);
  });

  function getChart() {
    switch (type) {
      case "pie":
        return Chartist.Pie;
      case "doughnut":
        return Chartist.Pie;
      case "bar":
        return Chartist.Bar;
      case "line":
        return Chartist.Line;
    }
  }

  var options = {
    doughnut: {
      donut: true,
      donutWidth: 60,
      donutSolid: true,
      startAngle: 270,
      showLabel: true
    },
    bar: {
      distributeSeries: true
    },
    line: {
      low: 0,
      showArea: true
    }
  };
</script>

<div id={chartId} />
