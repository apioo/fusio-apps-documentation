
# Evid

Web API documentation viewer for the PSX framework. Connects to a PSX API 
documentation endpoint and offers a clean presentation of the API. An example
API is available at http://example.phpsx.org/documentation/

## Architecture

It is also possible to use the viewer without using the PSX framework. You only
have to provide a specific JSON API. In the following we will explain the 
format. On the first request evid will make an AJAX call to the provided "url" 
path. The response must contain all available routes of the API.

    {
      "routings": [
        {
          "path": "/todo/:todo_id",
          "methods": [
            "GET",
            "POST",
            "PUT",
            "DELETE"
          ],
          "version": "*"
        },
        {
          "path": "/todo",
          "methods": [
            "GET",
            "POST",
            "PUT",
            "DELETE"
          ],
          "version": "*"
        }
      ],
      "links": [
        {
          "rel": "self",
          "href": "http://127.0.0.1/projects/fusio/public/index.php/doc"
        },
        {
          "rel": "detail",
          "href": "http://127.0.0.1/projects/fusio/public/index.php/doc/{version}/{path}"
        },
        {
          "rel": "api",
          "href": "http://127.0.0.1/projects/fusio/public/index.php/"
        }
      ]
    }

If a user clicks on a detail link evid tries to get the detail link from the 
index response. The response of the detail link should include the complete
schema definition. The request and response keys contain a JSON pointer to the
fitting schema definition.

    {
      "path": "/todo",
      "version": "*",
      "status": 4,
      "description": "",
      "schema": {
        "$schema": "http://json-schema.org/draft-04/schema#",
        "id": "urn:schema.phpsx.org#",
        "definitions": {
          "Todo": {
            "type": "object",
            "title": "todo",
            "properties": {
              "id": {
                "type": "integer"
              },
              "status": {
                "type": "integer"
              },
              "title": {
                "type": "string"
              },
              "insertDate": {
                "type": "string",
                "format": "date-time"
              }
            },
            "required": [
              "title"
            ]
          },
          "Collection": {
            "type": "object",
            "title": "collection",
            "properties": {
              "totalCount": {
                "type": "integer"
              },
              "entry": {
                "type": "array",
                "items": {
                  "$ref": "#/definitions/Todo"
                }
              }
            }
          },
          "Message": {
            "type": "object",
            "title": "message",
            "properties": {
              "success": {
                "type": "boolean"
              },
              "message": {
                "type": "string"
              }
            }
          },
          "GET-200-response": {
            "$ref": "#/definitions/Collection"
          },
          "POST-request": {
            "$ref": "#/definitions/Todo"
          },
          "POST-200-response": {
            "$ref": "#/definitions/Message"
          }
        }
      },
      "methods": {
        "GET": {
          "responses": {
            "200": "#/definitions/GET-200-response"
          }
        },
        "POST": {
          "request": "#/definitions/POST-request",
          "responses": {
            "200": "#/definitions/POST-200-response"
          }
        }
      },
      "links": [
        {
          "rel": "swagger",
          "href": "/projects/fusio/public/index.php/export/swagger/*/todo"
        },
        {
          "rel": "raml",
          "href": "/projects/fusio/public/index.php/export/raml/*/todo"
        }
      ]
    }

