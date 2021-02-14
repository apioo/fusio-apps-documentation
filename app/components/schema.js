'use strict';

angular.module('evid.schema', [])

.service('schema', function (marked) {

    /**
     * Creates a schema generator from an schema definition which transforms an
     * json schema to an html representation
     */
    this.create = function (definition) {
        return new SchemaGenerator(definition);
    };

    function SchemaGenerator(definition) {
        this.definitions = definition.definitions;
        this.chunks = [];
        this.generated = [];

        this.getHtml = function (methodName, method) {
            this.chunks = [];
            this.generated = [];

            var html = '<div>';

            if (method.tags && angular.isArray(method.tags)) {
                html += '<div class="evid-method-tags">';
                html += '<ul>';
                for (var i = 0; i < method.tags.length; i++) {
                    html += '<li>' + method.tags[i] + '</li>';
                }
                html += '</ul>';
                html += '</div>';
            }

            if (method.description && angular.isString(method.description)) {
                html += '<div class="evid-method-description">' + marked(method.description) + '</div>';
            }

            html += '<div class="evid-schema-table">';
            html += '<table>';
            html += '<colgroup>';
            html += '<col width="30%">';
            html += '<col width="70%">';
            html += '</colgroup>';

            if (method.operationId && angular.isString(method.operationId)) {
                html += '<tr>';
                html += '<td><span class="evid-property">Operation-Id</span></td>';
                html += '<td><span class="evid-property-type">' + method.operationId + '</span></td>';
                html += '</tr>';
            }

            // parameters
            if (method.queryParameters && angular.isString(method.queryParameters)) {
                html += '<tr>';
                html += '<td><span class="evid-property">Parameters</span></td>';
                html += '<td><span class="evid-property-type">' + method.queryParameters + '</span></td>';
                html += '</tr>';

                this.generateDefinition(method.queryParameters);
            }

            // request
            if (method.request && angular.isString(method.request)) {
                html += '<tr>';
                html += '<td><span class="evid-property">Request</span></td>';
                html += '<td><span class="evid-property-type">' + method.request + '</span></td>';
                html += '</tr>';

                this.generateDefinition(method.request);
            }

            // responses
            if (method.responses && angular.isObject(method.responses)) {
                for (var statusCode in method.responses) {
                    html += '<tr>';
                    html += '<td><span class="evid-property">Response - ' + statusCode + '</span></td>';
                    html += '<td><span class="evid-property-type">' + method.responses[statusCode] + '</span></td>';
                    html += '</tr>';

                    this.generateDefinition(method.responses[statusCode]);
                }
            }

            html += '</table>';

            html += '<md-subheader class="md-primary">Schemas</md-subheader>';
            html += this.chunks.join("\n");
            html += '</div>';
            html += '</div>';

            return html;
        };

        this.generateDefinition = function(name) {
            if (this.generated.includes(name)) {
                return;
            }

            this.generated.push(name);

            var type = this.resolveType(name);
            if (type.type === 'object' && (type.properties || type.$extends)) {
                return this.generateStruct(name, type);
            } else if (type.type === 'object' && type.additionalProperties) {
                return this.generateMap(name, type);
            } else if (type.type === 'array' && type.items) {
                return this.generateArray(name, type);
            } else if (type.oneOf) {
                return this.generateUnion(name, type);
            } else if (type.allOf) {
                return this.generateIntersection(name, type);
            } else if (type.$ref) {
                return this.generateReference(name, type);
            }
        }

        this.generateStruct = function(name, type) {
            var parent = type.$extends;
            if (parent) {
                var parentType = this.resolveType(parent)
                type = Object.assign(parentType, type);
            }

            var required = type.required;

            var types = [];
            var generics = [];
            var props = {};
            for (var key in type.properties) {
                var property = type.properties[key]

                var generic = this.getGeneric(property)
                if (generic) {
                    generics.push(generic)
                }

                var isRequired = false;
                if (required && angular.isArray(required)) {
                    isRequired = required.includes(key);
                }

                props[key] = {
                    name: key,
                    type: this.getType(property, type),
                    required: isRequired,
                    comment: property.description,
                };

                types = types.concat(this.getInnerTypes(property, type))
            }

            this.chunks.push(this.writeStruct(name, props, parent, generics, type));

            for (var i = 0; i < types.length; i++) {
                this.generateDefinition(types[i]);
            }
        }

        this.generateMap = function(name, type) {
            var property = type.additionalProperties;
            var props = {};

            props['*'] = {
                name: '*',
                type: this.getType(property, type),
                required: false,
                comment: type.description,
            };

            this.chunks.push(this.writeStruct(name, props, null, null, type));

            var types = this.getInnerTypes(property, type);
            for (var i = 0; i < types.length; i++) {
                this.generateDefinition(types[i]);
            }
        }

        this.generateArray = function(name, type) {

        }

        this.generateUnion = function(name, type) {

        }

        this.generateIntersection = function(name, type) {

        }

        this.generateReference = function(name, type) {
            this.chunks.push(this.writeReference(name, this.getType(type), type));
        }

        this.writeStruct = function(name, props, parent, generics, origin) {
            var title = '<a id="' + name + '">' + name + '</a>';
            if (generics && angular.isArray(generics)) {
                var parts = [];
                for (var i = 0; i < generics.length; i++) {
                    if (origin.$template[generics[i]]) {
                        parts.push(origin.$template[generics[i]])
                    } else {
                        parts.push(generics[i])
                    }
                }

                if (parts.length > 0) {
                    title+= '&lt;' + parts.join(', ') + '&gt;'
                }
            }

            var resp = '';
            resp += '<div class="evid-object">';
            resp += '<md-subheader class="md-hue-2"><strong>' + title + '</strong></md-subheader>';

            if (origin.description && angular.isString(origin.description)) {
                resp += '<div class="evid-object-description">' + this.escapeHtml(origin.description) + '</div>';
            }

            var rows = [];
            for (var key in props) {
                var property = props[key];

                rows.push([
                    key,
                    property.type,
                    property.required,
                    property.comment,
                    origin
                ]);
            }

            resp += this.generateJson(rows);
            resp += this.generateTable(rows);
            resp += '</div>';

            return resp;
        }

        this.writeMap = function() {
            
        }

        this.writeArray = function() {

        }

        this.writeUnion = function() {

        }

        this.writeIntersection = function() {

        }

        this.writeReference = function(name, type, origin) {
            var html = '';
            html+= '<md-subheader class="md-hue-2"><strong>' + name + '</strong></md-subheader>';
            html+= '<div id="' + name + '" class="psx-object psx-reference">';
            html+= '</div>';
            
            this.generateDefinition(origin.$ref);

            return html;
        }

        this.writeConstraints = function() {

        }

        this.resolveType = function (ref) {
            if (!ref) {
                return null;
            }

            var type = this.definitions[ref];
            if (!type) {
                return null;
            }

            if (type.$ref) {
                var template;
                if (type.$template) {
                    template = type.$template;
                }
                type = this.resolveType(type.$ref);
                if (template) {
                    type.$template = template;
                }
            }
            
            return type;
        };

        this.generateTable = function(rows) {
            var html = '';
            html += '<table>';
            html += '<colgroup>';
            html += '<col width="30%">';
            html += '<col width="70%">';
            html += '</colgroup>';
            html += '<thead>';
            html += '<tr>';
            html += '<th>Field</th>';
            html += '<th>Description</th>';
            html += '</tr>';
            html += '</thead>';
            html += '<tbody>';

            for (var i = 0; i < rows.length; i++) {
                [name, type, required, description, origin] = rows[i];

                html += '<tr>';
                if (required) {
                    html += '<td><span class="evid-property evid-property-required" title="required">' + name + '</span></td>';
                } else {
                    html += '<td><span class="evid-property">' + name + '</span></td>';
                }

                html += '<td>';
                html += '<span class="evid-property-type">' + type + '</span>';
                html += '<div class="evid-property-description">' + this.escapeHtml(description) + '</div>';
                html += this.buildConstraints(origin);
                html += '</td>';
                html += '</tr>';
            }

            html += '</tbody>';
            html += '</table>';
            return html;
        }

        this.generateJson = function(rows) {
            var json = '';
            json += '<pre class="evid-object-json">';
            json += '<span class="evid-object-json-pun">{</span>' + "\n";

            for (var i = 0; i < rows.length; i++) {
                [name, type] = rows[i];

                json += '  ';
                json += '<span class="evid-object-json-key">"' + name + '"</span>';
                json += '<span class="evid-object-json-pun">: </span>';
                json += '<span class="evid-property-type">' + type + '</span>';
                json += '<span class="evid-object-json-pun">,</span>';
                json += "\n";
            }

            json += '<span class="evid-object-json-pun">}</span>';
            json += '</pre>';
            return json;
        }

        this.getType = function(property, origin) {
            var i = 0;
            var result = [];
            var typeName;
            if (property.properties) {
                return '<span class="evid-property-type evid-property-type-object">Struct</span>';
            } else if (property.additionalProperties) {
                return '<span class="evid-property-type evid-property-type-object">Map (string, ' + this.getType(property.additionalProperties, origin) + ')</span>';
            } else if (property.items) {
                return '<span class="evid-property-type evid-property-type-array">Array (' + this.getType(property.items, origin) + ')</span>';
            } else if (property.oneOf && angular.isArray(property.oneOf)) {
                for (i = 0; i < property.oneOf.length; i++) {
                    result.push(this.getType(property.oneOf[i]), origin);
                }
                return result.join(' | ');
            } else if (property.allOf && angular.isArray(property.allOf)) {
                for (i = 0; i < property.allOf.length; i++) {
                    result.push(this.getType(property.allOf[i]), origin);
                }
                return result.join(' & ');
            } else if (property.$generic && angular.isString(property.$generic)) {
                return origin.$template[property.$generic];
            } else if (property.$ref && angular.isString(property.$ref)) {
                return '<a>' + property.$ref + '</a>';
            } else if (property.type && angular.isString(property.type)) {
                typeName = this.ucfirst(property.type);
            } else {
                typeName = 'Mixed';
            }

            var format = property.format;
            if (format === 'date') {
                return '<a href="http://tools.ietf.org/html/rfc3339#section-5.6" title="RFC3339">Date</a>';
            } else if (format === 'date-time') {
                return '<a href="http://tools.ietf.org/html/rfc3339#section-5.6" title="RFC3339">DateTime</a>';
            } else if (format === 'time') {
                return '<a href="http://tools.ietf.org/html/rfc3339#section-5.6" title="RFC3339">Time</a>';
            } else if (format === 'duration') {
                return '<a href="https://en.wikipedia.org/wiki/ISO_8601#Durations" title="ISO8601">Duration</a>';
            } else if (format === 'uri') {
                return '<a href="http://tools.ietf.org/html/rfc3986" title="RFC3339">URI</a>';
            } else if (format === 'binary') {
                return '<a href="http://tools.ietf.org/html/rfc4648" title="RFC4648">Base64</a>';
            } else {
                return typeName;
            }
        }
        
        this.getGeneric = function(type) {
            var items;
            if (type.additionalProperties) {
                items = type.additionalProperties
            } else if (type.items) {
                items = type.items
            }

            if (items && items.$generic) {
                return items.$generic
            } else {
                return null
            }
        }

        this.buildConstraints = function (property) {
            var html = '<dl>';

            if (property.pattern) {
                html += '<dt>Pattern:</dt><dd>' + property.pattern + '</dd>';
            }

            if (property.enum && angular.isArray(property.enum)) {
                html += '<dt>Enum:</dt><dd>' + property.enum.join(', ') + '</dd>';
            }

            // string
            if (property.minLength) {
                html += '<dt>Min-Length:</dt><dd>' + property.minLength + '</dd>';
            }

            if (property.maxLength) {
                html += '<dt>Max-Length:</dt><dd>' + property.maxLength + '</dd>';
            }

            // number
            if (property.maximum) {
                html += '<dt>Maximum:</dt><dd>' + property.maximum + '</dd>';
            }

            if (property.minimum) {
                html += '<dt>Minimum:</dt><dd>' + property.minimum + '</dd>';
            }

            if (property.multipleOf) {
                html += '<dt>Multiple of:</dt><dd>' + property.multipleOf + '</dd>';
            }

            html += '</dl>';

            return html;
        };

        this.ucfirst = function (input) {
            if (angular.isString(input)) {
                return input.charAt(0).toUpperCase() + input.substring(1);
            }
            return '';
        };

        this.escapeHtml = function (html) {
            if (!angular.isString(html)) {
                return '';
            }

            return html
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        };

        this.getInnerTypes = function (type, origin) {
            var i;
            var result = [];
            if (type.additionalProperties) {
                result.push(this.getInnerRefType(type.additionalProperties, origin));
            } else if (type.items) {
                result.push(this.getInnerRefType(type.items, origin));
            } else if (type.oneOf && angular.isArray(type.oneOf)) {
                for (i = 0; i < type.oneOf.length; i++) {
                    result.push(this.getInnerRefType(type.oneOf[i], origin));
                }
            } else if (type.allOf && angular.isArray(type.allOf)) {
                for (i = 0; i < type.allOf.length; i++) {
                    result.push(this.getInnerRefType(type.allOf[i], origin));
                }
            } else {
                result.push(this.getInnerRefType(type, origin));
            }

            return result.filter(function(value) {
                return value !== null;
            });
        };

        this.getInnerRefType = function (type, origin) {
            if (type.$ref && angular.isString(type.$ref)) {
                return type.$ref;
            } else if (type.$generic && angular.isString(type.$generic)) {
                return origin.$template[type.$generic];
            } else {
                return null;
            }
        };
    }
});
