import { Node, skind, pkind, SLASH } from '..';
import * as assert from 'assert';

describe('Node', () => {
    let root: Node;

    beforeEach(() => {
        root = new Node();
    });

    it('root', () => {
        assert.equal(root.kind, skind);
        assert.equal(root.label, SLASH);
        assert.equal(root.prefix, '/');
        assert.equal(root.parent, null);
    });

    it('reset', () => {
        let node = new Node(skind, 'user');
        assert.equal(node.kind, skind);
        assert.equal(node.prefix, 'user');

        node.reset(pkind, ':');
        assert.equal(node.kind, pkind);
        assert.equal(node.prefix, ':');
    });

    it('addChild', () => {
        let c = new Node(skind, 'user');
        root.addChild(c);

        let node = root.children['u'.charCodeAt(0)];
        assert.strictEqual(node, c);
        assert.equal(node.parent, root);
    });

    it('signature', () => {
        let n1 = new Node(pkind, ':');
        root.addChild(n1);

        let n2 = new Node(skind, '/');
        n1.addChild(n2);

        let n3 = new Node(skind, 'user');
        n2.addChild(n3);

        assert.equal(n3.signature, '/:/user');
    });

    it('JSON.stringify', () => {
        let c = new Node(skind, 'user');
        c.addHandler('GET', () => { }, []);
        root.addChild(c);

        let str = '{"prefix":"/","children":{"117":{"prefix":"user","maps":{"GET":{"pnames":[]}},"signature":"/user"}}}';
        assert.equal(JSON.stringify(root), str);
    });
});