
# Documentation

Web API documentation viewer for Fusio. Connects to a Fusio API 
documentation endpoint and offers a clean presentation of the API. An example
API is available at https://demo.fusio-project.org/apps/internal/#!/page/about

## Architecture

It is also possible to use the viewer without Fusio. The first request to the
API root must return a JSON response containing a link to the documentation endpoint
i.e.:

```json
{
    "apiVersion": "5.0.1.0",
    "title": "Fusio",
    "categories": [
        "authorization",
        "system",
        "consumer",
        "backend",
        "default"
    ],
    "scopes": [
        "default",
        "todo"
    ],
    "apps": {
        "fusio": "http:\/\/127.0.0.1\/projects\/fusio\/public\/apps\/fusio"
    },
    "links": [
        {
            "rel": "root",
            "href": "http:\/\/127.0.0.1\/projects\/fusio\/public\/index.php\/"
        },
        {
            "rel": "openapi",
            "href": "http:\/\/127.0.0.1\/projects\/fusio\/public\/index.php\/system\/export\/openapi\/*\/*"
        },
        {
            "rel": "documentation",
            "href": "http:\/\/127.0.0.1\/projects\/fusio\/public\/index.php\/system\/doc"
        },
        {
            "rel": "route",
            "href": "http:\/\/127.0.0.1\/projects\/fusio\/public\/index.php\/system\/route"
        },
        {
            "rel": "health",
            "href": "http:\/\/127.0.0.1\/projects\/fusio\/public\/index.php\/system\/health"
        },
        {
            "rel": "jsonrpc",
            "href": "http:\/\/127.0.0.1\/projects\/fusio\/public\/index.php\/system\/jsonrpc"
        },
        {
            "rel": "oauth2",
            "href": "http:\/\/127.0.0.1\/projects\/fusio\/public\/index.php\/authorization\/token"
        },
        {
            "rel": "whoami",
            "href": "http:\/\/127.0.0.1\/projects\/fusio\/public\/index.php\/authorization\/whoami"
        },
        {
            "rel": "about",
            "href": "https:\/\/www.fusio-project.org"
        }
    ]
}
```

The documentation endpoint must return a list of all available endpoints:

```json
{
    "routings": [
        {
            "path": "\/",
            "methods": [
                "ANY"
            ],
            "version": "*"
        },
        {
            "path": "\/todo",
            "methods": [
                "ANY"
            ],
            "version": "*"
        },
        {
            "path": "\/todo\/:todo_id",
            "methods": [
                "ANY"
            ],
            "version": "*"
        }
    ],
    "links": [
        {
            "rel": "self",
            "href": "http:\/\/127.0.0.1\/projects\/fusio\/public\/index.php\/system\/doc"
        },
        {
            "rel": "detail",
            "href": "http:\/\/127.0.0.1\/projects\/fusio\/public\/index.php\/system\/doc\/{version}\/{path}"
        },
        {
            "rel": "api",
            "href": "http:\/\/127.0.0.1\/projects\/fusio\/public\/index.php\/"
        }
    ]
}
```

The detail endpoint must return the following format:

```json
{
    "status": 4,
    "path": "\/todo",
    "methods": {
        "GET": {
            "operationId": "get.todo",
            "description": "Returns all todo entries",
            "tags": [
                "todo"
            ],
            "responses": {
                "200": "App_Model_Todo_Collection",
                "500": "App_Model_Message"
            }
        },
        "POST": {
            "operationId": "post.todo",
            "description": "Creates a new todo entry",
            "security": {
                "app": [
                    "todo"
                ]
            },
            "tags": [
                "todo"
            ],
            "request": "App_Model_Todo_Create",
            "responses": {
                "201": "App_Model_Message",
                "500": "App_Model_Message"
            }
        }
    },
    "definitions": {
        "App_Model_Message": {
            "$ref": "Message"
        },
        "App_Model_Todo_Collection": {
            "$ref": "Todo_Collection"
        },
        "App_Model_Todo_Create": {
            "$ref": "Todo_Create"
        },
        "Collection": {
            "type": "object",
            "properties": {
                "totalResults": {
                    "type": "integer"
                },
                "entry": {
                    "type": "array",
                    "items": {
                        "$generic": "T"
                    }
                }
            }
        },
        "Message": {
            "type": "object",
            "properties": {
                "success": {
                    "type": "boolean"
                },
                "message": {
                    "type": "string"
                }
            }
        },
        "Todo": {
            "type": "object",
            "properties": {
                "title": {
                    "type": "string"
                }
            }
        },
        "Todo_Collection": {
            "$ref": "Collection",
            "$template": {
                "T": "Todo"
            }
        },
        "Todo_Create": {
            "$extends": "Todo",
            "type": "object",
            "required": [
                "title"
            ]
        }
    },
    "links": [
        {
            "rel": "client-go",
            "href": "http:\/\/127.0.0.1\/projects\/fusio\/public\/index.php\/system\/export\/client-go\/*\/todo"
        },
        {
            "rel": "client-java",
            "href": "http:\/\/127.0.0.1\/projects\/fusio\/public\/index.php\/system\/export\/client-java\/*\/todo"
        },
        {
            "rel": "client-php",
            "href": "http:\/\/127.0.0.1\/projects\/fusio\/public\/index.php\/system\/export\/client-php\/*\/todo"
        },
        {
            "rel": "client-typescript",
            "href": "http:\/\/127.0.0.1\/projects\/fusio\/public\/index.php\/system\/export\/client-typescript\/*\/todo"
        },
        {
            "rel": "markup-html",
            "href": "http:\/\/127.0.0.1\/projects\/fusio\/public\/index.php\/system\/export\/markup-html\/*\/todo"
        },
        {
            "rel": "markup-markdown",
            "href": "http:\/\/127.0.0.1\/projects\/fusio\/public\/index.php\/system\/export\/markup-markdown\/*\/todo"
        },
        {
            "rel": "spec-typeschema",
            "href": "http:\/\/127.0.0.1\/projects\/fusio\/public\/index.php\/system\/export\/spec-typeschema\/*\/todo"
        },
        {
            "rel": "spec-openapi",
            "href": "http:\/\/127.0.0.1\/projects\/fusio\/public\/index.php\/system\/export\/spec-openapi\/*\/todo"
        },
        {
            "rel": "spec-raml",
            "href": "http:\/\/127.0.0.1\/projects\/fusio\/public\/index.php\/system\/export\/spec-raml\/*\/todo"
        }
    ]
}
```
