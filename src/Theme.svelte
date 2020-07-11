<script>
    import { theme } from './store';

    let allThemes = ['default', 'purple', 'night', 'blue', 'green', 'yellow'];

    export let showRest = false;

    function selectTheme(thm) {
        $theme = thm;
        showRest = false;
        window.localStorage.theme = thm;
        document.getElementById('site-icon').href = '/' + thm + '.png';
    }
</script>

<div>
    <div class="rest {!showRest ? 'hide' : ''}">
    {#each allThemes as thm}
        <div class="{thm}-theme block" on:click={() => selectTheme(thm) }>
            <!--<div class="check"><i class="fas fa-check"></i></div>-->
        </div>
    {/each}
    </div>

</div>

<style>
    .block {
        width: 24px;
        height: 24px;
        border-radius: 50%; 
        cursor: pointer;
    }

    .current {
        width: 67px;
        height: 26px;
    }

    .check {
        position: absolute;
        color: #fff;
        font-size: .75rem;
        right: 13px;
        top: 14px;

    }
    
    .rest {
        width: 110px;
        background-color: #fff;
        box-shadow: 0px 2px 5px 0px rgba(0,0,0,.5);
        border-radius: 2px;
        text-align: center;
    }

    .rest .block {
        display: inline-block;
        margin: 0px 4px;
    }
</style>
