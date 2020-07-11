<script>
  import { data, poll } from "../result-store";
  import { theme } from "../store";

  function moreThan30Mins() {
    var diff = new Date().getTime() - parseInt($data.urlDate);
    var diffInMin = diff / (60 * 1000);
    return diffInMin > 30;
  }

  var timer = setInterval(function() {
    if (
      $data.data &&
      $data.data.done == false &&
      $data.data.total &&
      !moreThan30Mins()
    ) {
      $poll = true;
    } else {
      if(($data.data &&
      $data.data.done) || moreThan30Mins()) {
        clearInterval(timer);
      }
    }
  }, 3000);
</script>

<style>
  @keyframes breath {
    0% {
      animation-timing-function: cubic-bezier(0.9647, 0.2413, -0.0705, 0.7911);
      transform: scale(0.9099999999999999) rotate(45deg);
    }
    51% {
      animation-timing-function: cubic-bezier(0.9226, 0.2631, -0.0308, 0.7628);
      transform: scale(1.02994) rotate(45deg);
    }
    100% {
      transform: scale(0.9099999999999999) rotate(45deg);
    }
  }

  .ldr {
    animation: breath 0.7s infinite linear;
    opacity: 0.5;
    filter: grayscale(100%);
  }

  .ldr-txt {
    color: #adadad;
    text-transform: uppercase;
    margin-top: -18px;
  }

  .body {
    text-align: center;
  }

  .empty-banner {
    filter: grayscale(1);
    opacity: 0.4;
    width: 50%;
  }

  .no-data {
    margin-top: 15%;
    color: #e1e1e1;
    text-transform: uppercase;
  }
</style>

<div class="body">
  {#if $data.loading}
    <div style="margin-top: 20%;">
      <img src="/loader.png" alt="loader" class="ldr" />
      <div class="ldr-txt">Loading</div>
    </div>
  {:else if $data.data && $data.data.done == false && $data.data.total && !moreThan30Mins()}
    <div class="no-data">
      <img
        src="/wip.gif"
        alt="WIP"
        class="empty-banner"
        style="width: 200px;" />
      <div>
        Still running {$data.data.currentTest + 1} of {$data.data.total} tests,
        check back later!
      </div>
    </div>
  {:else if ($data.data && $data.data.done == false && moreThan30Mins()) || $data.data == null}
    <div class="no-data">
      <img src="/empty-banner.png" alt="No Data Found" class="empty-banner" />
      <div>no data found</div>
    </div>
  {/if}
</div>
