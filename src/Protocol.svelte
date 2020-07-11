<script>
    import { protocol } from './store';


</script>

<span><i class="fas fa-wrench"></i> Protocol</span>
<select bind:value={$protocol}>
    <option value="http">HTTP</option>
    <option value="https">HTTPS</option>
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
