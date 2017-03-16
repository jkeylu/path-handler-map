import * as assert from 'assert';
import { PathHandlerMap } from '../..';

describe('PathHandlerMap.find', () => {
    let map: PathHandlerMap;

    beforeEach(() => {
        map = new PathHandlerMap();
    });

    it('missing prefix /', () => {
        map.add('GET', 'user', function f1() { });

        let r = map.find('GET', '/user');
        assert.equal(r.found, true);
        assert.equal(r.handler.name, 'f1');
    })

    it('match static', () => {
        map.add('GET', '/:a/:b/:c', function f1() { });
        map.add('GET', '/:a/:b/c', function f2() { });

        let r = map.find('GET', '/a/b/c');
        assert.equal(r.found, true);
        assert.equal(r.handler.name, 'f2');
    });

    it('match param', () => {
        map.add('GET', '/a/b', function f1() { });
        map.add('GET', '/a/:b', function f2() { });
        map.add('GET', '/a/*', function f3() { });
        map.add('GET', '/*', function f4() { });

        let r = map.find('GET', '/a/c');
        assert.equal(r.found, true);
        assert.equal(r.handler.name, 'f2');
    });

    it('match unnamed param', () => {
        map.add('GET', '/a/:', function f1() { });

        let r = map.find('GET', '/a/b');
        assert.equal(r.found, true);
        assert.equal(r.pnames[0], ':0');
        assert.equal(r.pvalues[0], 'b');
    });

    it('match any', () => {
        map.add('GET', '/:a/:b/:c', function f1() { });
        map.add('GET', '/:a*', function f2() { });

        let r = map.find('GET', '/a/b/c/d');
        assert.equal(r.found, true);
        assert.equal(r.handler.name, 'f2');
        assert.equal(r.pnames[0], 'a');
        assert.equal(r.pvalues[0], 'a/b/c/d');
    });

    it('match unnamed any', () => {
        map.add('GET', '/a/*', function f1() { });

        let r = map.find('GET', '/a/b/c');
        assert.equal(r.found, true);
        assert.equal(r.pnames[0], '*');
        assert.equal(r.pvalues[0], 'b/c');
    });

    it('not match', () => {
        map.add('GET', '/user_info', function f1(){});

        let r = map.find('GET', '/user');
        assert.equal(r.found, false);
    });
});