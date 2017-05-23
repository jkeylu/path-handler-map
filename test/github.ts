import * as assert from 'assert';
import { githubApiList } from './helper';
import { PathHandlerMap } from '..';

describe('Github API', () => {
    let m: PathHandlerMap;

    beforeEach(() => {
        m = new PathHandlerMap();
        githubApiList.forEach(api => {
            m.add(api.pathExpression, api.method, api.handler);
        });
    });

    describe('find', () => {
        githubApiList.forEach((api, i) => {
            it(`find ${api.method} ${api.pathExpression}`, () => {
                let r = m.find(api.method, api.path);
                assert.equal(r.found, true);
                assert.equal(r.handler, githubApiList[i].handler);
                assert.equal(r.pvalues.length, r.pnames.length);
            });
        });
    });

    describe('lookup', () => {
        githubApiList.forEach((api, i) => {
            it(`lookup ${api.pathExpression}`, () => {
                let signature = api.pathExpression.replace(/:[^\/]*/g, (match) => {
                    if (match[match.length - 1] == '*') {
                        return '*';
                    } else {
                        return ':';
                    }
                });

                let n = m.lookup(api.pathExpression);
                assert.notEqual(n, null);
                assert.equal(n.signature, signature);
            });
        });
    });
});