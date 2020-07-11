<script>
  import { recent, form } from "./store";

  var recents = [];

  recent.subscribe(() => {
    recents = $recent;
  });

  function _use(_recent) {
    $form["ed1"].getSession().setValue(_recent.rawReq);
  }
</script>

<style>
  table {
    width: 100%;
    border-collapse: collapse;
  }

  table tr:hover {
    font-weight: 600;
    cursor: pointer;
  }

  table tr td {
    font-size: 0.8rem;
    padding: 5px;
    color: gray;
  }

  table tr td.method {
    font-weight: 600;
    text-align: left;
    padding-left: 0px;
  }

  table tr td.path {
    text-align: left;
  }

  table tr td.host {
    text-align: left;
  }

  table tr td.when {
    text-align: right;
    padding-right: 0px;
  }

  table tfoot td {
    color: #b0b0b0;
    padding-top: 10px;
    font-size: 0.7rem;
    text-transform: uppercase;
  }

  .heading {
    text-align: left;
    margin: 20px 0px 10px 0px;
    font-weight: 600;
    font-size: 1.2rem;
    color: gray;
  }

  .empty-recent {
    text-align: left;
    color: #9d9d9d;
  }
</style>

<div class="containe">
  <div class="heading">Recent</div>
  {#if recents.length > 0}
    <table>
      <thead />
      <tbody>
        {#each recents as _recent, i}
          <tr on:click={() => _use(_recent)}>
            <td class="method">{_recent.method}</td>
            <td class="path">{_recent.url}</td>
            <td class="host">{_recent.host}</td>
            <td class="when">
              {window.moment(_recent.when).format("ddd MMM Do'YY, h:mmA")}
            </td>
          </tr>
        {/each}

      </tbody>
    </table>
  {:else}
    <div class="empty-recent">No recent requests.</div>
  {/if}
</div>
