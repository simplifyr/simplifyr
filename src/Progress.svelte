<script>
  import { tweened } from "svelte/motion";
  import { cubicOut } from "svelte/easing";
  import { visiblePart, currentProgress } from "./store";

  let indicatorPos = 0;
  let viewPerc;

  const progress = tweened(0, {
    duration: 400,
    easing: cubicOut
  });

  visiblePart.subscribe(() => {
    $progress = $visiblePart / 4 - 0.01;
    setIndicatorPos();
  });

  currentProgress.subscribe(() => {
    $progress = $currentProgress;
    setIndicatorPos();
  });

  function setIndicatorPos() {
    indicatorPos = parseInt($progress * 100);
    viewPerc = indicatorPos === 0 ? 0 :
             (indicatorPos != 100 ? indicatorPos + 1 : 100);
  }

  
</script>

<style>

  progress {
    border-radius: 2px;
    width: 100%;
    height: 3px;
  }
  progress::-webkit-progress-bar {
    background-color: #F2F3F4;
    border-radius: 2px;
    }


  .perc {
    font-size: 10px;
    top: 11px;
    position: absolute;
    left: -1px;
  }

</style>

<div style="margin: 7px 0px 30px 0px; position: relative;">
  <div style="left: {indicatorPos}%" class="indicator">
    <div class="perc">{viewPerc}%</div>
  </div>
  <progress value={$progress} />
</div>
