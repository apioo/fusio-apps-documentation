
# Evid

Web API documentation viewer for the PSX framework. Connects to an PSX API 
documentation endpoint and offers a clean presentation of the API. An example
API is available at http://example.phpsx.org

## Architecture

It is also possible to use the viewer without using the PSX framework you have
to only provide a specific JSON API. In the following we will explain the 
format.

On the first request evid will make an AJAX call to the provided "url" path. 
The response must contain all available routes of the API.

    {
        "routings": [
            {
                "path": "\/news",
                "methods": [
                    "GET",
                    "POST",
                    "PUT",
                    "DELETE"
                ],
                "version": "*"
            },
            {
                "path": "\/news\/:news_id",
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
                "href": "http:\/\/demo.fusio-project.org\/doc"
            },
            {
                "rel": "detail",
                "href": "http:\/\/demo.fusio-project.org\/doc\/{version}\/{path}"
            },
            {
                "rel": "api",
                "href": "http:\/\/demo.fusio-project.org\/"
            }
        ]
    }

If a user clicks on a detail link evid tries to get the detail link from the 
index response. The response of the detail link should include the complete
schema definition. The request and response keys contain a JSON pointer to the
fitting schema definition.

    {
        "path": "\/news",
        "version": 1,
        "status": 4,
        "schema": {
            "$schema": "http:\/\/json-schema.org\/draft-04\/schema#",
            "id": "urn:schema.phpsx.org#",
            "type": "object",
            "definitions": {
                "ref34fde23012e9bc064a121ab5922e7ff0": {
                    "type": "object",
                    "properties": {
                        "id": {
                            "type": "integer"
                        },
                        "name": {
                            "type": "string"
                        },
                        "email": {
                            "type": "string"
                        }
                    },
                    "title": "author",
                    "additionalProperties": false
                },
                "ref59cd64a04c1d00257e687035486a0f86": {
                    "type": "object",
                    "title": "news",
                    "properties": {
                        "id": {
                            "type": "integer"
                        },
                        "title": {
                            "type": "string"
                        },
                        "author": {
                            "$ref": "#\/definitions\/ref34fde23012e9bc064a121ab5922e7ff0"
                        },
                        "content": {
                            "type": "string"
                        },
                        "createDate": {
                            "type": "string"
                        }
                    },
                    "additionalProperties": false
                },
                "refa3dee3d3ec8f051d270fa1856b9a1919": {
                    "type": "object",
                    "title": "collection",
                    "properties": {
                        "entry": {
                            "type": "array",
                            "items": {
                                "$ref": "#\/definitions\/ref59cd64a04c1d00257e687035486a0f86"
                            },
                            "title": "entry"
                        }
                    },
                    "additionalProperties": false
                },
                "GET-200-response": {
                    "$ref": "#\/definitions\/refa3dee3d3ec8f051d270fa1856b9a1919"
                },
                "POST-request": {
                    "$ref": "#\/definitions\/ref59cd64a04c1d00257e687035486a0f86"
                }
            }
        },
        "versions": [
            {
                "version": 1,
                "status": 4
            }
        ],
        "methods": {
            "GET": {
                "responses": {
                    "200": "#\/definitions\/GET-200-response"
                }
            },
            "POST": {
                "request": "#\/definitions\/POST-request",
                "responses": {
                    "200": "#\/definitions\/POST-200-response"
                }
            }
        },
        "links": [
            {
                "rel": "wsdl",
                "href": "\/export\/wsdl\/1\/news"
            },
            {
                "rel": "swagger",
                "href": "\/export\/swagger\/1\/news"
            },
            {
                "rel": "raml",
                "href": "\/export\/raml\/1\/news"
            }
        ]
    }

