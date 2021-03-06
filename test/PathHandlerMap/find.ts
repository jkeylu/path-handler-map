import * as assert from 'assert';
import { PathHandlerMap } from '../..';

describe('PathHandlerMap.find', () => {
    let map: PathHandlerMap;

    beforeEach(() => {
        map = new PathHandlerMap();
    });

    it('missing prefix /', () => {
        map.add('user', 'GET', function f1() { });

        let r = map.find('GET', '/user');
        assert.equal(r.found, true);
        assert.equal(r.handler!.name, 'f1');
        assert.equal(r.pvalues.length, r.pnames!.length);
    })

    it('match static', () => {
        map.add('/:a/:b/:c', 'GET', function f1() { });
        map.add('/:a/:b/c', 'GET', function f2() { });

        let r = map.find('GET', '/a/b/c');
        assert.equal(r.found, true);
        assert.equal(r.handler!.name, 'f2');
        assert.equal(r.pvalues.length, r.pnames!.length);
    });

    it('match param', () => {
        map.add('/a/b', 'GET', function f1() { });
        map.add('/a/:b', 'GET', function f2() { });
        map.add('/a/*', 'GET', function f3() { });
        map.add('/*', 'GET', function f4() { });

        let r = map.find('GET', '/a/c');
        assert.equal(r.found, true);
        assert.equal(r.handler!.name, 'f2');
        assert.equal(r.pvalues.length, r.pnames!.length);
    });

    it('match unnamed param', () => {
        map.add('/a/:', 'GET', function f1() { });

        let r = map.find('GET', '/a/b');
        assert.equal(r.found, true);
        assert.equal(r.pnames![0], ':0');
        assert.equal(r.pvalues[0], 'b');
        assert.equal(r.pvalues.length, r.pnames!.length);
    });

    it('match any', () => {
        map.add('/:a/:b/:c', 'GET', function f1() { });
        map.add('/:a*', 'GET', function f2() { });
        map.add('/d/*f', 'GET', function f3() {});

        let r = map.find('GET', '/a/b/c/d');
        assert.equal(r.found, true);
        assert.equal(r.handler!.name, 'f2');
        assert.equal(r.pnames![0], 'a');
        assert.equal(r.pvalues[0], 'a/b/c/d');
        assert.equal(r.pvalues.length, r.pnames!.length);

        r= map.find('GET', '/d/f');
        assert.equal(r.found, true);
        assert.equal(r.handler!.name, 'f3');
        assert.deepEqual(r.pnames, ['f']);
        assert.deepEqual(r.pvalues, ['f']);
    });

    it('match unnamed any', () => {
        map.add('/a/*', 'GET', function f1() { });
        map.add('/a/c/:*', 'GET', function f2() { });

        let r = map.find('GET', '/a/b/c');
        assert.equal(r.found, true);
        assert.equal(r.pnames![0], '*');
        assert.equal(r.pvalues[0], 'b/c');
        assert.equal(r.pvalues.length, r.pnames!.length);

        r = map.find('GET', '/a/c/d/e');
        assert.equal(r.found, true);
        assert.equal(r.pnames![0], '*');
        assert.equal(r.pvalues[0], 'd/e');
        assert.equal(r.pvalues.length, r.pnames!.length);
    });

    it('not match static', () => {
        map.add('/user_info', 'GET', function f1() { });

        let r = map.find('GET', '/user');
        assert.equal(r.found, false);
    });

    it('not match param', () => {
        map.add('/user/:username', 'GET', function f1() { });

        let r = map.find('GET', '/user');
        assert.equal(r.found, false);
    });
});
