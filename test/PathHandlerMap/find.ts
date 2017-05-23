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
        assert.equal(r.handler.name, 'f1');
    })

    it('match static', () => {
        map.add('/:a/:b/:c', 'GET', function f1() { });
        map.add('/:a/:b/c', 'GET', function f2() { });

        let r = map.find('GET', '/a/b/c');
        assert.equal(r.found, true);
        assert.equal(r.handler.name, 'f2');
    });

    it('match param', () => {
        map.add('/a/b', 'GET', function f1() { });
        map.add('/a/:b', 'GET', function f2() { });
        map.add('/a/*', 'GET', function f3() { });
        map.add('/*', 'GET', function f4() { });

        let r = map.find('GET', '/a/c');
        assert.equal(r.found, true);
        assert.equal(r.handler.name, 'f2');
    });

    it('match unnamed param', () => {
        map.add('/a/:', 'GET', function f1() { });

        let r = map.find('GET', '/a/b');
        assert.equal(r.found, true);
        assert.equal(r.pnames[0], ':0');
        assert.equal(r.pvalues[0], 'b');
    });

    it('match any', () => {
        map.add('/:a/:b/:c', 'GET', function f1() { });
        map.add('/:a*', 'GET', function f2() { });

        let r = map.find('GET', '/a/b/c/d');
        assert.equal(r.found, true);
        assert.equal(r.handler.name, 'f2');
        assert.equal(r.pnames[0], 'a');
        assert.equal(r.pvalues[0], 'a/b/c/d');
    });

    it('match unnamed any', () => {
        map.add('/a/*', 'GET', function f1() { });

        let r = map.find('GET', '/a/b/c');
        assert.equal(r.found, true);
        assert.equal(r.pnames[0], '*');
        assert.equal(r.pvalues[0], 'b/c');
    });

    it('not match', () => {
        map.add('/user_info', 'GET', function f1(){});

        let r = map.find('GET', '/user');
        assert.equal(r.found, false);
    });
});
