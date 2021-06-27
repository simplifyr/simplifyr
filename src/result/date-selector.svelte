<script>
  import { data, poll } from "../result-store";
  import { getData } from "../util";
  export let dates;

  let showDropDown = false;

  let dateFormat = "ddd MMM Do'YY, h:mmA";

  let redisKey = toRedisKey();

  function toRedisKey() {
    var p = window.location.pathname.split("/");
    return [p[1], p[3], p[5], $data.urlDate].join("::");
  }

  if (!$data.urlDate) {
    $data.urlDate = dates.length > 0 ? dates[0] : null;
    if ($data.urlDate) {
      showThis($data.urlDate);
    }
  }

  window.document.addEventListener("click", function (e) {
    if (e.target.id != "selected-date") {
      showDropDown = false;
    }
  });

  function showThis(date) {
    $data.urlDate = date;
    dates = [...dates];
    window.history.pushState(null, null, "?" + date);
    redisKey = toRedisKey().replace(/\d+$/, date);
    $data.loading = true;
    $data.data = {
      done: false,
    };
    __load(redisKey);
  }

  async function __load(redisKey) {
    var raw = await getData("/api/key/" + redisKey);

    setTimeout(() => {
      $data.data = JSON.parse(raw.value);
      if (typeof $data.data === "string") {
        $data.data = JSON.parse($data.data);
      }
      console.log($data);
      $data.loading = false;
    }, 1000);
  }

  poll.subscribe(() => {
    if ($poll) {
      __load(toRedisKey());
      $poll = false;
    }
  });
</script>

<div>
  <div
    class="selected {showDropDown ? 'with-shadow' : ''}"
    id="selected-date"
    on:click={() => (showDropDown = true)}
  >
    {#if $data.urlDate}
      {window.moment($data.urlDate).format(dateFormat)}
    {:else}No Date Found{/if}
  </div>
  <div class="drop-down {showDropDown ? '' : 'hide'}">
    {#each dates as date}
      {#if date != $data.urlDate}
        <div class="date" on:click={() => showThis(date)}>
          {window.moment(date).format(dateFormat)}
        </div>
      {/if}
    {/each}
  </div>
</div>

<style>
  .selected {
    color: #3c3c3c;
    background-color: #f7f6f6;
    padding: 0px 11px;
    border-radius: 2px;
    border: 1px solid #dadada;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 600;
    min-width: 197px;
    text-align: center;
  }

  .with-shadow {
    box-shadow: 0px 6px 12px 0px rgba(0, 0, 0, 0.4);
    border-bottom: none;
    border-bottom-right-radius: 0px;
    border-bottom-left-radius: 0px;
    margin-left: -1px;
    margin-right: -1px;
  }

  .selected::after {
    content: "❮";
    transform: rotate(-90deg);
    display: inline-block;
    text-align: center;
    margin-left: 8px;
    color: gray;
    position: absolute;
    right: 9px;
  }

  .date {
    padding: 0px 8px;
    font-size: 0.85rem;
    width: 100%;
    text-align: center;
    box-sizing: border-box;
    transition: all 0.3s ease;
  }

  .date:hover {
    background-color: #eeeeee;
    cursor: pointer;
  }

  .drop-down {
    position: absolute;
    background-color: #fff;
    width: 100%;
    box-shadow: 0px 9px 13px 0px rgba(0, 0, 0, 0.4);
    max-height: 250px;
    overflow: auto;
    border-bottom-left-radius: 3px;
    border-bottom-right-radius: 3px;
    z-index: 10;
  }
</style>
