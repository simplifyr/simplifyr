<script>
    import { form, showModal } from './store';
    import TestCaseDetails from './modal-content/test-case-details.svelte';
    import RJQLDoc from './modal-content/rjql-doc.svelte';
    import NewTeamAdder from './modal-content/new-team-adder.svelte';
    import CertAdderForm from './modal-content/cert-adder-form.svelte';
    import PasswordValidator from './modal-content/password-validator-form.svelte';

    var type, data, width, topCloseBtn;

    showModal.subscribe(() => {
      type = $form.modal.type;
      data = $form.modal.data;
      width = ($form.modal.width || '80') + '%';
      topCloseBtn = $form.modal.topCloseBtn || false;
    });

    function closeModal () {
      $showModal = false;
      type = -1;
    }


</script>


<div id="modal" class="modal {$showModal ? '' : 'hide'}">
  <div class="modal-content" style="width: {width}">
    {#if type == 0}
      <TestCaseDetails {data} delay={800} />
    {:else if type == 1}
       <RJQLDoc />
    {:else if type == 2}
      <NewTeamAdder />
    {:else if type == 3}
      <CertAdderForm />
    {:else if type == 4}
      <PasswordValidator {data}/>
    {/if}

    <div class="close-btn {topCloseBtn ? 'close-btn-top' : ''}">
      <span on:click={closeModal} >{ topCloseBtn ? '✕' : 'Close'}</span>
    </div>
  </div>
</div>

<style>
/* The Modal (background) */
.modal {
  display: block; 
  position: fixed; 
  z-index: 1111; 
  padding-top: 70px; 
  left: 0;
  top: 0;
  width: 100%; 
  height: 100%; 
  overflow: auto;
  background-color: rgba(0,0,0, .4); 
}

.modal-content {
  background-color: #fefefe;
  margin: auto;
  padding: 15px;
  border: 1px solid #888;
  min-width: 300px;
  z-index: 1112;
  word-break: break-all;
  overflow: hidden;
  color: #fff;
  box-sizing: border-box;
  border-radius: 2px;
  box-shadow: 0px 4px 19px 0px rgba(0,0,0,.6);
  position: relative;
}

.close-btn {
  text-align: right;
  color: rgb(204, 204, 204);
  margin-top: 21px;
  position: relative;
}

.close-btn span {
  text-transform: uppercase;
  padding: 6px 15px;
  cursor: pointer;
}

.close-btn span:hover {
  background-color: #f5f5f5;
}


.close-btn-top {
	position: absolute !important;
  top: -14px !important;
  right: 0 !important;
}

</style>