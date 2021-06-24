<script>
  import { onMount } from "svelte";

  import { getData } from "./util";

  import { authRequestList, form, showModal } from "./store";

  onMount(async () => {
    $authRequestList = await getData(
      "/api/teams/" + sessionStorage.team + "/auths"
    );
  });

  function addOrUpdateAuth() {
    $form.modal.type = 6;
    $form.modal.data = {};
    $form.modal.width = "60";
    $form.modal.topCloseBtn = true;
    $form.modal.callback = () => {};
    $showModal = true;
  }
</script>

<div>
  <div
    on:click={addOrUpdateAuth}
    style="margin-top: 20px;
    margin-bottom: 20px; cursor: pointer;"
  >
    <i class="fa fa-plus" /> Add Auth
  </div>
</div>

<style>
</style>
