// ORIGIN OF THIS METHODS IN http://stackoverflow.com/questions/19098797/fastest-way-to-flatten-un-flatten-nested-json-objects
if (!JSON.flatten) {
    JSON.flatten = function(data) {
        var result = {};
        function recurse (cur, prop) {
            if (Object(cur) !== cur) {
                result[prop] = cur;
            } else if (Array.isArray(cur)) {
                 for(var i=0, l=cur.length; i<l; i++)
                     recurse(cur[i], prop + "[" + i + "]");
                if (l == 0)
                    result[prop] = [];
            } else {
                var isEmpty = true;
                for (var p in cur) {
                    isEmpty = false;
                    recurse(cur[p], prop ? prop+"."+p : p);
                }
                if (isEmpty && prop)
                    result[prop] = {};
            }
        }
        recurse(data, "");
        return result;
    };
}

if (!JSON.unflatten) {
    JSON.unflatten = function(data) {
        "use strict";
        if (Object(data) !== data || Array.isArray(data))
            return data;
        var regex = /\.?([^.\[\]]+)|\[(\d+)\]/g,
            resultholder = {};
        for (var p in data) {
            var cur = resultholder,
                prop = "",
                m;
            while (m = regex.exec(p)) {
                cur = cur[prop] || (cur[prop] = (m[2] ? [] : {}));
                prop = m[2] || m[1];
            }
            cur[prop] = data[p];
        }
        return resultholder[""] || resultholder;
    };
}

// FROM https://raw.githubusercontent.com/onyxcorp/impallets/master/src/globals.js?token=AA-KcImfK5EBe6GJBeq5bS8GO5rThExvks5WNuekwA%3D%3D
if (typeof String.prototype.startsWith != 'function') {
    String.prototype.startsWith = function (str) {
        return this.slice(0, str.length) == str;
    };
}

if (typeof String.prototype.capitalize != 'function') {
    String.prototype.capitalize = function () {
        return this.toLowerCase().charAt(0).toUpperCase() + this.slice(1);
    };
}

if (typeof String.prototype.contains != 'function') {
    String.prototype.contains = function (it, exactMatch) {
        var response;
        if (exactMatch) {
            response = this === it;
        } else {
            response = this.indexOf(it) !== -1;
        }
        return response;
    };
}

if (typeof String.prototype.containsOr != 'function') {
    String.prototype.containsOr = function () {
        var stringList = [].splice.call(arguments, 0);
        return stringList.some( function (value) {
            return this.contains(value);
        }.bind(this));
    };
}
