'use strict';

angular.module('evid.schema', [])

.service('schema', function() {

  /**
   * Creates a schema generator from an schema definition which transforms an
   * json schema to an html representation
   */
  this.create = function(definition) {
    return new schemaGenerator(definition);
  }

  function schemaGenerator(definition) {
    this.definition = definition;
    this.schema = definition.schema;

    this.getHtml = function(methodName, method) {
      var html = '<div>';

      // request
      var request = this.getRequest(method);
      if (request) {
        html += '<md-subheader class="md-primary">' + methodName + ' Request</md-subheader>';
        html += '<div class="evid-schema-table">' + request + '</div>';
      }

      // responses
      var statusCodes = this.getAvailableResponseCodes(method);
      for (var i = 0; i < statusCodes.length; i++) {
        var response = this.getResponse(method, statusCodes[i]);
        if (response) {
          html += '<md-subheader class="md-primary">' + methodName + ' Response - ' + statusCodes[i] + '</md-subheader>';
          html += '<div class="evid-schema-table">' + response + '</div>';
        }
      }

      html += '</div>';

      return html;
    };

    this.getJsonSampleRequest = function(method) {
      return this.getRequest(method, 'json');
    };

    this.getRequest = function(method, format) {
      if (method && method.request) {
        var data = this.getPointer(method.request);
        if (data) {
          return this.transformSchema(data, format);
        }
      }
      return null;
    };

    this.getResponse = function(method, statusCode, format) {
      if (method && method.responses && method.responses[statusCode]) {
        var data = this.getPointer(method.responses[statusCode]);
        if (data) {
          return this.transformSchema(data, format);
        }
      }
      return null;
    };

    this.getAvailableResponseCodes = function(method) {
      var codes = [];
      if (method && method.responses) {
        for (var statusCode in method.responses) {
          codes.push(statusCode);
        }
      }
      return codes;
    };

    this.getPointer = function(path) {
      if (!path) {
        return null;
      }

      if (path.substring(0, 2) == '#/') {
        path = path.substring(2);
      }

      var parts = path.split('/');
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

    this.resolveRef = function(schema) {
      if (schema.$ref) {
        schema = this.resolveRef(this.getPointer(schema.$ref));
      }
      return schema;
    };

    this.transformSchema = function(schema, format) {
      if (format == 'json') {
        return this.buildJsonObject(this.resolveRef(schema));
      } else {
        return this.buildHtmlObject(this.resolveRef(schema));
      }
    };

    this.buildHtmlObject = function(schema) {
      var html = '';
      if (schema.properties) {
        var references = [];
        var title = 'Object';

        if (schema.title) {
          title = schema.title;
        }

        html += '<md-subheader class="md-hue-1"><strong>' + title + '</strong></md-subheader>';
        html += '<table>';
        html += '<colgroup>';
        html += '    <col width="20%">';
        html += '    <col width="20%">';
        html += '    <col width="40%">';
        html += '    <col width="20%">';
        html += '</colgroup>';
        html += '<thead>';
        html += '<tr>';
        html += '    <th>Property</th>';
        html += '    <th>Type</th>';
        html += '    <th>Description</th>';
        html += '    <th>Constraints</th>';
        html += '</tr>';
        html += '</thead>';
        html += '<tbody>';
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
              } else if (object.type) {
                type = 'array&lt;' + object.type + '&gt;';
              }
            }
          }

          html += '<tr>';
          html += '<td><b>' + propertyName + '</b></td>';
          html += '<td>' + type + '</td>';
          html += '<td>' + (property.description ? property.description : '') + '</td>';
          html += '<td>' + this.buildConstraints(property) + '</td>';
          html += '</tr>';
        }
        html += '</tbody>';
        html += '</table>';

        for (var i = 0; i < references.length; i++) {
          html += this.buildHtmlObject(references[i]);
        }
      }

      return html;

    };

    this.buildConstraints = function(property) {
      var html = '<dl>';

      if (property.pattern) {
        html += '<dt>Pattern:</dt><dd>' + property.pattern + '</dd>';
      }

      if (property.enum && angular.isArray(property.enum)) {
        html += '<dt>Enumeration:</dt><dd>' + property.enum.join(', ') + '</dd>';
      }

      if (property.minLength) {
        html += '<dt>Min-Length:</dt><dd>' + property.minLength + '</dd>';
      }

      if (property.maxLength) {
        html += '<dt>Max-Length:</dt><dd>' + property.maxLength + '</dd>';
      }

      if (property.minimum) {
        html += '<dt>Minimum:</dt><dd>' + property.minimum + '</dd>';
      }

      if (property.maximum) {
        html += '<dt>Maximum:</dt><dd>' + property.maximum + '</dd>';
      }

      html += '</dl>';

      return html;
    };

    this.buildJsonObject = function(schema) {
      var data = {};

      if (schema.properties) {
        for (var propertyName in schema.properties) {
          var property = schema.properties[propertyName];

          if (property.$ref) {
            property = this.resolveRef(property);
          }

          var type = property.type ? property.type : 'string';

          if (type == 'object') {
            var object = this.resolveRef(property);
            data[propertyName] = this.buildJsonObject(object);
          } else if (type == 'array') {
            var result = [];
            if (property.items) {
              var object = this.resolveRef(property.items);
              if (object.type == 'object') {
                result.push(this.buildJsonObject(object));
              } else {
                result.push('');
              }
            }
            data[propertyName] = result;
          } else if (type == 'integer') {
            data[propertyName] = 0;
          } else if (type == 'number') {
            data[propertyName] = 0.0;
          } else if (type == 'null') {
            data[propertyName] = null;
          } else if (type == 'boolean') {
            data[propertyName] = false;
          } else {
            data[propertyName] = '';
          }
        }
      }

      return data;
    };

  }

});
