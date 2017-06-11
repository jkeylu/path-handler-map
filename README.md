# path-handler-map

> A path to handler map, base on [radix tree](http://en.wikipedia.org/wiki/Radix_tree).

## Installation

```
npm install path-handler-map
```

## Usage

```
import { PathHandlerMap } from 'path-handler-map';

let m = new PathHandlerMap();
m.add('/user', 'GET', () => { });
m.add('/post/:post_id', 'GET', () => { });

let r = m.find('GET', '/post/234');
```

## Pattern Rule

| Syntax | Description |
|--------|-------------|
| `:name` | named param |
| `:` | unnamed param |
| `:name*` | named catch-all param |
| `:*` or `*` | unnamed catch-all param |

- Named parameters and unnamed parameters match anything until the next '/' or the path end.
- Named catch-all param and unnamed catch-all param match anything until the path end.

## Path matching order

- Static
- Param
- Match any

## Examples

```
/api/*
/api/users/:user_name
/api/users/popular
```

Above routes would resolve in the following order:

- `/api/users/popular`
- `/api/users/:user_name`
- `/api/*`

## Inspired by

- [Echo](https://github.com/labstack/echo)
- [trek-router](https://github.com/trekjs/router)

## License

MIT