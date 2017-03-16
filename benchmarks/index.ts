import * as assert from 'assert';
import * as Benchmark from 'benchmark';
import { githubApiListWithoutAny } from '../test/helper';
import { PathHandlerMap } from '..';
const TrekRouter = require('trek-router');
import * as pathToRegexp from 'path-to-regexp';
const RouteRecognizer = require('route-recognizer');
const wayfarer = require('wayfarer');

// path-handler-map
var pathHandlerMap = new PathHandlerMap();
githubApiListWithoutAny.forEach(api => {
    pathHandlerMap.add(api.method, api.pathExpression, api.handler);
});

// trek-router
var trekRouter = new TrekRouter();
githubApiListWithoutAny.forEach(api => {
    trekRouter.add(api.method, api.pathExpression, api.handler);
});

// path-to-regexp
var ptrListMap: { [method: string]: pathToRegexp.PathRegExp[]; } = {};
githubApiListWithoutAny.forEach(api => {
    var ptrList = ptrListMap[api.method];
    if (!ptrList) {
        ptrList = [];
        ptrListMap[api.method] = ptrList;
    }
    ptrList.push(pathToRegexp(api.pathExpression, []));
});

// route-recognizer
var rrMap: { [method: string]: any; } = {};
githubApiListWithoutAny.forEach(api => {
    var rr = rrMap[api.method];
    if (!rr) {
        rr = new RouteRecognizer();
        rrMap[api.method] = rr;
    }
    rr.add([{ path: api.pathExpression, handler: api.handler }]);
});

// wayfarer
var wayfarerMap: { [method: string]: any; } = {};
githubApiListWithoutAny.forEach(api => {
    var r = wayfarerMap[api.method];
    if (!r) {
        r = wayfarer();
        wayfarerMap[api.method] = r;
    }
    r.on(api.pathExpression, api.handler);
});

var suite = new Benchmark.Suite();

suite
    .add('path-handler-map', function () {
        githubApiListWithoutAny.forEach(function (api) {
            var r = pathHandlerMap.find(api.method, api.path);
            assert.equal(r.found, true);
        });
    })
    .add('trek-router', function () {
        githubApiListWithoutAny.forEach(function (api) {
            var r = trekRouter.find(api.method, api.path);
            var handler = r[0];
            assert.notEqual(handler, null);
        });
    })
    .add('path-to-regexp', function () {
        githubApiListWithoutAny.forEach(function (api) {
            var ptrList = ptrListMap[api.method];
            var r: RegExpExecArray;
            for (var i = 0; i < ptrList.length; i++) {
                r = ptrList[i].exec(api.path);
                if (r) {
                    break;
                }
            }
            assert.notEqual(r[0], null);
        });
    })
    .add('route-recognizer', function () {
        githubApiListWithoutAny.forEach(function (api) {
            var rr = rrMap[api.method];
            var r = rr.recognize(api.path);
            assert.notEqual(r, null);
        });
    })
    .add('wayfarer', function () {
        githubApiListWithoutAny.forEach(function (api) {
            var wayfarer = wayfarerMap[api.method];
            var r = wayfarer(api.path);
            assert.notEqual(r, null);
        });
    })
    // add listeners
    .on('cycle', function (event: Benchmark.Event) {
        console.log(String(event.target))
    })
    .on('complete', function () {
        console.log('Fastest is ' + this.filter('fastest').map((it: any) => it.name));
    })
    // run async
    .run({
        // async: true
    });
