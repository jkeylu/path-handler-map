import * as fs from 'fs';

const replacement = {
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
    return pathExpression.replace(/(:[^\/]+)/g, (m: string, pname: string) => {
        return replacement[pname];
    });
}

let apis = fs.readFileSync(__dirname + '/fixtures/github-api.txt', { encoding: 'utf8' })
    .split('\n')
    .filter(l => l && l[0] != '#');

export const githubApiList
    = apis.map(l => l.split(' '))
        .map(l => ({
            method: l[0],
            pathExpression: l[1],
            path: replaceParams(l[1], replacement),
            handler: () => 1
        }));

export const githubApiListWithoutAny
    = apis.filter(l => l[l.length - 1] != '*')
        .map(l => l.split(' '))
        .map(l => ({
            method: l[0],
            pathExpression: l[1],
            path: replaceParams(l[1], replacement),
            handler: () => { return true; }
        }));