import * as assert from 'assert';
import { githubApiList, bitbucketApiList } from './helper';
import { PathHandlerMap, Node, skind } from '..';

describe('merge', () => {
    describe('Github and Bitbucket Apis', () => {
        let m = new PathHandlerMap();

        let gh = new PathHandlerMap();
        githubApiList.forEach(api => {
            gh.add(api.pathExpression, api.method, api.handler);
        });

        let bb = new PathHandlerMap();
        bitbucketApiList.forEach(api => {
            bb.add(api.pathExpression, api.method, api.handler);
        });

        m.tree = PathHandlerMap.merge(m.tree, gh.tree);
        m.tree = PathHandlerMap.merge(m.tree, bb.tree);

        let overridden = [
            'GET /teams/:id',
            'GET /teams/:id/members',
            'GET /repositories',
            'GET /users/:username',
            'GET /user',
            'GET /user/emails',
            'GET /users/:username/followers',
            'GET /users/:username/following'
        ];

        githubApiList.forEach((api, i) => {
            if (~overridden.indexOf(`${api.method} ${api.pathExpression}`)) {
                it(`[github] find ${api.method} ${api.pathExpression}, but handler has been overridden`, () => {
                    let r = m.find(api.method, api.path);
                    assert.equal(r.found, true);
                    assert.equal(r.pvalues.length, r.pnames.length);
                    assert.notEqual(r.handler, githubApiList[i].handler);
                });
            } else {
                it(`[github] find ${api.method} ${api.pathExpression}`, () => {
                    let r = m.find(api.method, api.path);
                    assert.equal(r.found, true);
                    assert.equal(r.pvalues.length, r.pnames.length);
                    assert.equal(r.handler, githubApiList[i].handler);
                });
            }
        });

        bitbucketApiList.forEach((api, i) => {
            it(`[bitbucket] find ${api.method} ${api.pathExpression}`, () => {
                let r = m.find(api.method, api.path);
                assert.equal(r.found, true);
                assert.equal(r.handler, bitbucketApiList[i].handler);
                assert.equal(r.pvalues.length, r.pnames.length);
            });
        });
    });

    it('Source node must to start with "/"', () => {
        let n1 = new Node();
        let n2 = new Node(skind, 'hello');
        assert.throws(() => PathHandlerMap.merge(n1, n2));
    });

    it('merge two node', () => {
        let m1 = new PathHandlerMap();
        let m2 = new PathHandlerMap();

        m1.add('/a/:b/c/:d');
        m1.add('/a/:b/d');
        m1.add('/a/:b/c/d');

        m2.add('/e', 'GET', () => 1);

        let n = m1.lookup('/a/:b/c/');
        PathHandlerMap.merge(n, m2.tree, ['b']);

        let r = m1.find('GET', '/a/b1/c/e');
        assert.equal(r.found, true);
        assert.deepEqual(r.pnames, ['b']);
        assert.deepEqual(r.pvalues, ['b1']);
    });
});
