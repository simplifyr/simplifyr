<script>
  import { auth } from "./store";
</script>

<span><i class="fab fa-keycdn" /> Auth</span>
<select bind:value={$auth}>
  <option value="0">No Auth</option>
  <option value="2">HTTP Auth</option>
  <option value="1">AWS4</option>
</select>

<style>
  select {
    border: none;
    border-bottom: 2px solid #e1e1e1;
    outline: none;
  }

  span {
    color: gray;
  }
</style>
