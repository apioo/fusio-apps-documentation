'use strict';

angular.module('evid.schema', [])

.service('schema', function(marked) {

  /**
   * Creates a schema generator from an schema definition which transforms an
   * json schema to an html representation
   */
  this.create = function(definition) {
    return new SchemaGenerator(definition);
  };

  function SchemaGenerator(definition) {
    this.definition = definition;
    this.schema = definition.schema;
    this.refs = {};

    this.getHtml = function(methodName, method) {
      var html = '<div>';

      if (method.description) {
        html += '<div class="evid-method-description">' + marked(method.description) + '</div>';
      }

      // parameters
      var parameters = this.getQueryParameters(method);
      if (parameters) {
        html += '<md-subheader class="md-primary">' + methodName + ' Parameters</md-subheader>';
        html += '<div class="evid-schema-table">' + parameters + '</div>';
      }

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

    this.getQueryParameters = function(method, format) {
      if (method && method.queryParameters) {
        var data = this.getPointer(method.queryParameters);
        if (data) {
          return this.transformSchema(data, format);
        }
      }
      return null;
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
          if (method.responses.hasOwnProperty(statusCode)) {
            codes.push(statusCode);
          }
        }
      }
      return codes;
    };

    this.getPointer = function(path) {
      if (!path) {
        return null;
      }

      if (path.substring(0, 2) === '#/') {
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
      if (schema.$ref && angular.isString(schema.$ref)) {
        if (this.refs.hasOwnProperty(schema.$ref)) {
          return this.refs[schema.$ref];
        } else {
          schema = this.resolveRef(this.getPointer(schema.$ref));
          this.refs[schema.$ref] = schema;
        }
      }
      return schema;
    };

    this.transformSchema = function(schema, format) {
      if (format === 'json') {
        return this.buildJsonObject(this.resolveRef(schema));
      } else {
        return this.buildHtmlObject(this.resolveRef(schema));
      }
    };

    this.buildHtmlObject = function(schema) {
      var resp = '';
      var references = [];
      var propertyName, property, result, i;
      var title = this.getTitleForObject(schema);

      resp += '<div class="evid-object">';
      resp += '<md-subheader class="md-hue-2"><strong>' + title + '</strong></md-subheader>';

      if (schema.description) {
        resp += '<div class="evid-object-description">' + this.escapeHtml(schema.description) + '</div>';
      }

      var html = '';
      var json = '';

      if (schema.properties || schema.patternProperties || schema.additionalProperties) {
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

        json += '<span class="evid-object-json-pun">{</span>' + "\n";

        if (schema.properties) {
          for (propertyName in schema.properties) {
            if (schema.properties.hasOwnProperty(propertyName)) {
              property = schema.properties[propertyName];
              result = this.buildProperty(propertyName, property, schema);

              for (i = 0; i < result.refs.length; i++) {
                references.push(result.refs[i]);
              }

              html += result.html;
              json += result.json;
            }
          }
        }

        if (schema.patternProperties) {
          for (propertyName in schema.patternProperties) {
            if (schema.patternProperties.hasOwnProperty(propertyName)) {
              property = schema.patternProperties[propertyName];
              result = this.buildProperty(propertyName, property, schema);

              for (i = 0; i < result.refs.length; i++) {
                references.push(result.refs[i]);
              }

              html += result.html;
              json += result.json;
            }
          }
        }

        if (schema.additionalProperties) {
          if (schema.additionalProperties === true) {
            html += '<tr>';
            html += '<td><span class="evid-property-name evid-property-optional">*</span></td>';
            html += '<td><span class="evid-property-description">Additional properties are allowed</span></td>';
            html += '</tr>';

            json += '  ';
            json += '<span class="evid-object-json-key">"*"</span>';
            json += '<span class="evid-object-json-pun">: </span>';
            json += '<span class="evid-property-type">Mixed</span>';
            json += '<span class="evid-object-json-pun">,</span>';
            json += "\n";
          } else if (angular.isObject(schema.additionalProperties)) {
            property = schema.additionalProperties;
            result = this.buildProperty('*', property, schema);

            for (i = 0; i < result.refs.length; i++) {
              references.push(result.refs[i]);
            }

            html += result.html;
            json += result.json;
          }
        }

        json += '<span class="evid-object-json-pun">}</span>';

        html += '</tbody>';
        html += '</table>';
      }

      if (json !== '') {
        resp += '<pre class="evid-object-json">' + json + '</pre>';
      }

      resp += html;
      resp += '</div>';

      for (i = 0; i < references.length; i++) {
        resp += this.buildHtmlObject(references[i]);
      }

      return resp;
    };

    this.buildConstraints = function(property) {
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

      if (angular.isArray(property.oneOf) && property.oneOf.length > 0) {
        html += '<dt>One of:</dt><dd>' + this.buildCombinations(property.oneOf) + '</dd>';
      }

      if (angular.isArray(property.anyOf) && property.anyOf.length > 0) {
        html += '<dt>Any of:</dt><dd>' + this.buildCombinations(property.anyOf) + '</dd>';
      }

      if (angular.isArray(property.allOf) && property.allOf.length > 0) {
        html += '<dt>All of:</dt><dd>' + this.buildCombinations(property.allOf) + '</dd>';
      }

      html += '</dl>';

      return html;
    };

    this.buildJsonObject = function(schema) {
      var data = {};

      if (schema.properties) {
        for (var propertyName in schema.properties) {
          if (schema.properties.hasOwnProperty(propertyName)) {
            var property = schema.properties[propertyName];
            var object;

            if (property.$ref) {
              property = this.resolveRef(property);
            }

            var type = property.type ? property.type : 'string';

            if (type === 'object') {
              object = this.resolveRef(property);
              data[propertyName] = this.buildJsonObject(object);
            } else if (type === 'array') {
              var result = [];
              if (property.items) {
                object = this.resolveRef(property.items);
                if (object.type === 'object') {
                  result.push(this.buildJsonObject(object));
                } else {
                  result.push('');
                }
              }
              data[propertyName] = result;
            } else if (type === 'integer') {
              data[propertyName] = 0;
            } else if (type === 'number') {
              data[propertyName] = 0.0;
            } else if (type === 'null') {
              data[propertyName] = null;
            } else if (type === 'boolean') {
              data[propertyName] = false;
            } else {
              data[propertyName] = '';
            }
          }
        }
      }

      return data;
    };

    this.getTypeName = function(property) {
      if (property.$ref) {
        property = this.resolveRef(property);
      }

      var typeName;
      var type = property.type;

      // guess type
      if (!type) {
        if (property.items || property.additionalItems) {
          type = 'array';
        } else if (property.properties || property.patternProperties || property.additionalProperties) {
          type = 'object';
        }
      }

      if (type === 'object') {
        if (property.title) {
          return '<span class="evid-property-type evid-property-type-object">Object (' + this.ucfirst(this.escapeHtml(property.title)) + ')</span>';
        } else {
          return '<span class="evid-property-type evid-property-type-object">Object</span>';
        }
      } else if (type === 'array') {
        if (property.items) {
          return '<span class="evid-property-type evid-property-type-array">Array (' + this.getTypeName(property.items) + ')</span>';
        } else {
          return '<span class="evid-property-type evid-property-type-array">Array</span>';
        }
      } else if (angular.isString(type)) {
        typeName = this.ucfirst(type);
      } else if (angular.isArray(type)) {
        var result = [];
        for (var i = 0; i < type.length; i++) {
          if (angular.isString(type[i])) {
            result.push(this.ucfirst(type[i]));
          }
        }
        if (result.length > 0) {
          typeName = result.join(', ');
        } else {
          typeName = 'Mixed';
        }
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
    };

    this.ucfirst = function(input) {
      if (angular.isString(input)) {
        return input.charAt(0).toUpperCase() + input.substring(1);
      }
      return '';
    };

    this.getTitleForObject = function(schema) {
      var title = 'Object';
      if (schema.title) {
        title = this.ucfirst(this.escapeHtml(schema.title));
      }

      return title;
    };

    /**
     * Returns all sub schemas of a property
     *
     * @param {Object} property
     * @returns {Array}
     */
    this.findReferences = function(property) {
      var refs = [];
      var i, j, result;
      if (property.$ref) {
        return this.findReferences(this.resolveRef(property));
      } else if (property.type === 'object' || property.properties || property.patternProperty || property.additionalProperties) {
        return [property];
      } else if (property.items) {
        result = this.findReferences(property.items);
        for (j = 0; j < result.length; j++) {
          refs.push(result[j]);
        }
      } else if (angular.isArray(property.oneOf)) {
        for (i = 0; i < property.oneOf.length; i++) {
          result = this.findReferences(property.oneOf[i]);
          for (j = 0; j < result.length; j++) {
            refs.push(result[j]);
          }
        }
      } else if (angular.isArray(property.anyOf)) {
        for (i = 0; i < property.anyOf.length; i++) {
          result = this.findReferences(property.anyOf[i]);
          for (j = 0; j < result.length; j++) {
            refs.push(result[j]);
          }
        }
      } else if (angular.isArray(property.allOf)) {
        for (i = 0; i < property.allOf.length; i++) {
          result = this.findReferences(property.allOf[i]);
          for (j = 0; j < result.length; j++) {
            refs.push(result[j]);
          }
        }
      }
      return refs;
    };

    this.buildProperty = function(propertyName, property, schema) {
      var html = '';
      var json = '';
      var refs = this.findReferences(property);

      if (property.$ref) {
        property = this.resolveRef(property);
      }

      var type = this.getTypeName(property);

      var required = false;
      if (angular.isArray(schema.required)) {
        for (var j = 0; j < schema.required.length; j++) {
          if (schema.required[j] === propertyName) {
            required = true;
            break;
          }
        }
      }

      var constraints = this.buildConstraints(property);

      html += '<tr>';

      if (required) {
        html += '<td><span class="evid-property evid-property-required" title="required">' + propertyName + '</span></td>';
      } else {
        html += '<td><span class="evid-property">' + propertyName + '</span></td>';
      }

      html += '<td>';
      html += '<span class="evid-property-type">' + type + '</span>';
      if (property.description) {
        html += '<div class="evid-property-description">' + this.escapeHtml(property.description) + '</div>';
      }

      if (constraints) {
        html += constraints;
      }

      html += '</td>';
      html += '</tr>';

      json += '  ';
      json += '<span class="evid-object-json-key">"' + propertyName + '"</span>';
      json += '<span class="evid-object-json-pun">: </span>';
      json += type;
      json += '<span class="evid-object-json-pun">,</span>';
      json += "\n";

      return {
        html: html,
        json: json,
        refs: refs
      };
    };

    this.buildCombinations = function(types) {
      var type = '<ul>';
      for (var i = 0; i < types.length; i++) {
        type += '<li>' + this.getTypeName(types[i]) + '</li>';
      }
      type += '</ul>';
      return type;
    };

    this.escapeHtml = function(html) {
      return html
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };
  }
});
