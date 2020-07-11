<script>
    import TestCaseDetails from '../modal-content/test-case-details.svelte';
    import { beforeUpdate } from 'svelte';
    import { data } from '../result-store';
    
    export let testcase;
    export let index;

    beforeUpdate(() => {
        if(!testcase.test) {
            testcase.test = {};
            testcase.test.index = index;
            testcase.test.query = testcase.query;
            testcase.test.validator = testcase.validator;
            testcase.test.title = testcase.title;
        } else {
            testcase.query = testcase.test.query;
            testcase.validator = testcase.test.validator;
            testcase.title = testcase.test.title;
            delete testcase.test.ip;
        }

        testcase.desc = testcase.title;
        testcase.status = testcase.result.passed ? 'passed' : 'failed'; 
        testcase.tsuite = $data.keys[0].replace('result::', '').replace(/::\d+$/, '');

    });
    


    


</script>

<div class="testcase"> 
    <TestCaseDetails data={testcase} delay={50}  view="automation"/>
</div>

<style>
    .testcase {
        margin: 20px 0px 20px 0px;
        padding: 10px;
        background-color: #fff;
        border: 1px solid #dddfe2;
        padding-bottom: 0px;
        border-radius: 3px;
    }
</style>