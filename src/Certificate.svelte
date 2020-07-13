<script>
    import { certificate, form, showModal } from './store';
    import { getData } from './util';
    import { onMount } from 'svelte';

    function showCertForm() {
        $form.modal.type = 3;
        $form.modal.data = {};
        $form.modal.width = '40';
        $form.modal.topCloseBtn = true;
        $showModal = true;
    }

    onMount(async function() {
        let certs = await getData('/api/certs/' + sessionStorage.team);
        $form.certificates = certs.map((cert) => cert.substr(cert.lastIndexOf('::') + 2));
    });
</script>

<span><i class="fas fa-unlock-alt"></i> Cert</span>
<select bind:value={$certificate}>
    <option value="none">None</option>
    {#each $form.certificates as cert}
        <option value="{$form._TEAM}/{cert}">{cert}</option>
    {/each}
</select>
<span class="add-new-cert" title="Add New Certificate" on:click={showCertForm}><i class="fas fa-plus"></i></span>

<style>
    select {
        border: none;
        border-bottom: 2px solid #e1e1e1;
        outline: none;
    }

    span {
        color: gray;
    }

    span.add-new-cert {
        color: #333;
        font-size: .7rem;
        cursor: pointer;
        background-color: #e1e1e1;
        padding: 6px 10px 7px 10px;
        border-radius: 2px;
    }
</style>
