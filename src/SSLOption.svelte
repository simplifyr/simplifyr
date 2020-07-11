<script>
    import { ssl, protocol } from './store';
    
    let show = false;

    protocol.subscribe(() => {
        show = $protocol === 'https';
    });
</script>

<div class={show ? '' : 'hide'}>
<span><i class="fas fa-key" style="transform: rotate(-45deg);"></i> SSL</span>
<select bind:value={$ssl}>
    <option value="0">OFF</option>
    <option value="1">ON</option>
</select>
</div>

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
