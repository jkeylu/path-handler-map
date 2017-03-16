import * as assert from 'assert';
import { PathHandlerMap, skind, pkind, akind } from '../..';

describe('PathHandlerMap.lookup', () => {
    let m: PathHandlerMap;

    beforeEach(() => {
        m = new PathHandlerMap();
        m.add('GET', '/about', () => { });
        m.add('GET', '/user_info/:username', () => { });
        m.add('GET', '/post/:year/:month/:day', () => { });
        m.add('GET', '/page/*', () => { });
    });

    it('static node', () => {
        let node = m.lookup('/about');
        assert.notEqual(node, null);
        assert.equal(node.signature, '/about');
    });

    it('param node', () => {
        let node = m.lookup('/user_info/:username');
        assert.notEqual(node, null);
        assert.equal(node.signature, '/user_info/:');

        node = m.lookup('/post/:/:/:');
        assert.notEqual(node, null);
        assert.equal(node.signature, '/post/:/:/:');
    });

    it('any node', () => {
        let node = m.lookup('/page/*');
        assert.notEqual(node, null);
        assert.equal(node.signature, '/page/*');
    });

    it('not found', () => {
        let node = m.lookup('/user');
        assert.equal(node, null);

        node = m.lookup('/page/about');
        assert.equal(node, null);
    });
});