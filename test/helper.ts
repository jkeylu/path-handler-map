import * as fs from 'fs';

const githubReplacement = {
    ":id": "1234",
    ":client_id": "2345",
    ":fingerprint": "SD34SGGHY343SDFW958RGFRE",
    ":access_token": "wre22h3kj4h2khwwer",
    ":owner": "jkeylu",
    ":repo": "path-handler-map",
    ":org": "kot",
    ":username": "jkeylu",
    ":sha": "968eacf48402b85b33c8cd592fa2559ec4f558de",
    ":gist_id": "3456",
    ":ref*": "heads/featureA",
    ":installation_id": "4567",
    ":repository_id": "5678",
    ":number": "6789",
    ":assignee": "jkeylu",
    ":issue_number": "6789",
    ":name": "jkeylu",
    ":repo_name": "path-handler-map",
    ":author_id": "7890",
    ":template_name": "nodejs",
    ":license": "MIT",
    ":column_id": "4",
    ":project_id": "5",
    ":branch": "develop",
    ":ref": "9",
    ":repo_id": "8901",
    // ":base...:head",
    ":path*": "test/api.ts",
    ":archive_format": "tarball",
    ":deployment_id": "7",
    ":status_id": "6",
    ":invitation_id": "9012",
    ":tag": "v1.0.1",
    ":repository": "path-handler-map",
    ":state": "open",
    ":keyword": "path-handler-map",
    ":email": "hello@world.com",
    ":target_user": "jkeylu"
};

function replaceParams(pathExpression: string, replacement: { [key: string]: string; }) {
    return pathExpression.replace(/(:[^\/]+)/g, (_, pname: string) => {
        return replacement[pname];
    });
}

const githubApis = fs.readFileSync(__dirname + '/fixtures/github-api.txt', { encoding: 'utf8' })
    .split('\n')
    .filter(l => l && l[0] != '#');

export const githubApiList
    = githubApis.map(l => l.split(' '))
        .map(l => ({
            method: l[0],
            pathExpression: l[1],
            path: replaceParams(l[1], githubReplacement),
            handler: () => 1
        }));

export const githubApiListWithoutAny
    = githubApis.filter(l => l[l.length - 1] != '*')
        .map(l => l.split(' '))
        .map(l => ({
            method: l[0],
            pathExpression: l[1],
            path: replaceParams(l[1], githubReplacement),
            handler: () => { return true; }
        }));


const bitbucketReplacement = {
    ":linker_key": "hello",
    ":subject_type": "hello",
    ":username": "jkeylu",
    ":repo_slug": "path-handler-map",
    ":id": "1234",
    ":node": "1234",
    ":key": "hello",
    ":revision": "1234",
    ":sha": "1d52661cf14de07c7a13f49c17dad2d842f99aa5",
    ":comment_id": "1234",
    ":component_id": "1234",
    ":target_username": "jkeylu",
    ":spec": "1234",
    ":filename": "hello.md",
    ":uid": "1234",
    ":issue_id": "1234",
    ":path": "hello",
    ":milestone_id": "1234",
    ":pipeline_uuid": "1234",
    ":step_uuid": "1234",
    ":known_host_uuid": "1234",
    ":variable_uuid": "1234",
    ":pull_request_id": "1234",
    ":name": "jkeylu",
    ":version_id": "1234",
    ":encoded_id": "1234",
    ":node_id": "1234",
    ":owner": "jkeylu",
    ":project_key": "hello",
    ":email": "hello@world.com"
};

const bitbucketApis = fs.readFileSync(__dirname + '/fixtures/bitbucket-api.txt', { encoding: 'utf8' })
    .split('\n')
    .reduce((memo: string[][], it) => { if (it) { memo.push(it.match(/([^ ]+?)\s+(GET)?(POST)?(PUT)?(DELETE)?/)!.slice(1, 6)); } return memo; }, [])
    .reduce((memo: string[][], it) => { for (var i = 1; i < 5; i++) { if (it[i]) { memo.push([it[i], it[0]]) } } return memo; }, [])
    .map(it => { it[1] = it[1].replace(/\{.+?\}/g, function (v) { return ':' + v.substring(1, v.length - 1); }); return it; })
    .map(it => it.join(' '));

export const bitbucketApiList
    = bitbucketApis.map(l => l.split(' '))
        .map(l => ({
            method: l[0],
            pathExpression: l[1],
            path: replaceParams(l[1], bitbucketReplacement),
            handler: () => 1
        }));