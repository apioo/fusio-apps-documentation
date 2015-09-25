'use strict';

angular.module('evid.schema', [])

.service('schema', function(){
    var definition;
    var schema;

    this.create = function(definition){
        this.definition = definition;
        this.schema = definition.schema;

        var self = this;
        
        return {
            getHtml: function(methodName, method){
                return self.getHtml(methodName, method);
            }
        };
    }

    this.getHtml = function(methodName, method){
        var html = '<div>';

        // request
        var request = this.getRequest(method);
        if (request) {
            html+= '<section>';
            html+= '<md-subheader class="md-primary">' + methodName + ' Request</md-subheader>';
            html+= '<md-list layout-padding>';
            html+= '<md-list-item>';
            html+= request;
            html+= '</md-list-item>';
            html+= '</md-list>';
            html+= '</section>';
        }

        // responses
        var statusCodes = this.getAvailableResponseCodes(method);
        for (var i = 0; i < statusCodes.length; i++) {
            var response = this.getResponse(method, statusCodes[i]);
            if (response) {
                html+= '<section>';
                html+= '<md-subheader class="md-primary">' + methodName + ' Response - ' + statusCodes[i] + '</md-subheader>';
                html+= '<md-list layout-padding>';
                html+= '<md-list-item>';
                html+= response;
                html+= '</md-list-item>';
                html+= '</md-list>';
                html+= '</section>';
            }
        }

        html+= '</div>';

        return html;
    }

    this.getRequest = function(method){
        if (method && method.request) {
            var data = this.getPointer(method.request);
            if (data) {
                return this.transformSchema(data);
            }
        }
        return null;
    };

    this.getResponse = function(method, statusCode){
        if (method && method.responses && method.responses[statusCode]) {
            var data = this.getPointer(method.responses[statusCode]);
            if (data) {
                return this.transformSchema(data);
            }
        }
        return null;
    };

    this.getAvailableResponseCodes = function(method){
        var codes = [];
        if (method && method.responses) {
            for (var statusCode in method.responses) {
                codes.push(statusCode);
            }
        }
        return codes;
    };

    this.getPointer = function(path){
        if (!path) {
            return null;
        }

        if (path.substring(0, 2) == '#/') {
            path = path.substring(2);
        }

        var parts = path.split("/");
        var el = this.schema;

        for (var i = 0; i < parts.length; i++) {
            if (el[parts[i]]) {
                el = el[parts[i]];
            } else {
                break;
            }
        }

        return el;
    };

    this.resolveRef = function(schema){
        if (schema.$ref) {
            schema = this.resolveRef(this.getPointer(schema.$ref));
        }
        return schema;
    };

    this.transformSchema = function(schema){
        return this.buildObject(this.resolveRef(schema));
    };

    this.buildObject = function(schema){
        var html = '';
        if (schema.properties) {
            var references = [];
            var title = 'Object';

            if (schema.title) {
                title = schema.title;
            }

            html+= '<md-subheader class="md-hue-1"><strong>' + title + '</strong></md-subheader>';
            html+= '<table class="evid-schema-table">';
            html+= '<colgroup>';
            html+= '    <col width="20%">';
            html+= '    <col width="20%">';
            html+= '    <col width="40%">';
            html+= '    <col width="20%">';
            html+= '</colgroup>';
            html+= '<thead>';
            html+= '<tr>';
            html+= '    <th>Property</th>';
            html+= '    <th>Type</th>';
            html+= '    <th>Description</th>';
            html+= '    <th>Constraints</th>';
            html+= '</tr>';
            html+= '</thead>';
            html+= '<tbody>';
            for (var propertyName in schema.properties) {
                var property = schema.properties[propertyName];

                if (property.$ref) {
                    property = this.resolveRef(property);
                }

                var type = property.type ? property.type : 'string';

                if (type == 'object') {
                    var object = this.resolveRef(property);
                    if (object.title) {
                        type = object.title;
                    }
                    references.push(object);
                } else if (type == 'array') {
                    if (property.items) {
                        var object = this.resolveRef(property.items);
                        if (object.type == 'object') {
                            if (object.title) {
                                type = 'array&lt;' + object.title + '&gt;';
                            } else {
                                type = 'array&lt;object&gt;';
                            }
                            references.push(object);
                        } else if(object.type) {
                            type = 'array&lt;' + object.type + '&gt;';
                        }
                    }
                }

                html+= '<tr>';
                html+= '<td><b>' + propertyName + '</b></td>';
                html+= '<td>' + type + '</td>';
                html+= '<td>' + (property.description ? property.description : '') + '</td>';
                html+= '<td>' + this.buildConstraints(property) + '</td>';
                html+= '</tr>';
            }
            html+= '</tbody>';
            html+= '</table>';

            for (var i = 0; i < references.length; i++) {
                html+= this.buildObject(references[i]);
            }
        }

        return html;

    };

    this.buildConstraints = function(property){
        var html = '<dl>';

        if (property.pattern) {
            html+= '<dt>Pattern:</dt><dd>' + property.pattern + '</dd>';
        }

        if (property.enum && angular.isArray(property.enum)) {
            html+= '<dt>Enumeration:</dt><dd>' + property.enum.join(', ') + '</dd>';
        }

        if (property.minLength) {
            html+= '<dt>Min-Length:</dt><dd>' + property.minLength + '</dd>';
        }

        if (property.maxLength) {
            html+= '<dt>Max-Length:</dt><dd>' + property.maxLength + '</dd>';
        }

        if (property.minimum) {
            html+= '<dt>Minimum:</dt><dd>' + property.minimum + '</dd>';
        }

        if (property.maximum) {
            html+= '<dt>Maximum:</dt><dd>' + property.maximum + '</dd>';
        }

        html+= '</dl>';

        return html;
    };

});
