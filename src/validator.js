import { matchText } from './validator/text';
import { validateRegex } from './validator/regex';


export function validator(o) {

    var validate = getAlgo(o);
    o.result = {
        overAll: {
            total: 1,
            passed: 0
        }
    };
    if (!o.apiErr) {
        try {
            if (!o._response.body) {
                o.result.verb = 'Response is empty';
                if (o.test.query != '__NA__') {
                    o.result.passed = false;
                } else {
                    o.result.passed = true;
                    o.result.overAll.passed++;
                }

            } else {
                o.result = validate(o._response.body, o.test.query);
            }
        } catch (e) {
            o.result = {
                passed: false,
                verb: e,
                overAll: {
                    total: 1,
                    passed: 0
                }
            }
        }
    } else {
        o.result.verb = 'There was an API error.';
        o.result.passed = false;
    }
    var status = o.result.passed ? 'passed' : 'failed';
    var ico = o.result.passed ? 'check' : 'times';
    o.validation = `<span class="${status}"><i class="fas fa-${ico}"></i> ${status.toUpperCase()}</span>`;
    o.status = status;
    o._et = new Date().getTime();
    o.timeTaken = toTimeDiff(o);
}

function getAlgo(o) {
    switch (parseInt(o.test.validator)) {
        case 0:
            return rjql.consolidated;
        case 1:
            return matchText;
        case 2:
            return validateRegex;
    }
}

function toTimeDiff(o) {
    return ((o._et - o._st) / 1000).toFixed(2) + 's';

}