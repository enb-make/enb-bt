module.exports = {
    /**
     * Adapts single BT file content to client-side.
     * @param {String} input
     * @returns {String}
     */
    process: function (input) {
        return input
            .replace(/module\.exports\s*=\s*function\s*\([^\)]*\)\s*{/, '')
            .replace(/}\s*(?:;)?\s*$/, '');
    },

    /**
     * Builds module (see npm package "ym").
     * @param {String} btEngineSource
     * @param {String} inputSources
     * @param {Object} dependencies example: {libName: "dependencyName"}
     * @returns {string}
     */
    buildModule: function (btEngineSource, inputSources, dependencies) {
        var libNames;
        var depNames;
        var libPrepares;
        if (dependencies) {
            libNames = Object.keys(dependencies);
            libPrepares = libNames.map(function (libName) {
                return 'bt.lib.' + libName + ' = ' + libName + ';';
            });
            depNames = libNames.map(function (libName) {
                return dependencies[libName];
            });
        }
        return 'modules.define(\'bt\'' +
            (depNames ? ', ' + JSON.stringify(depNames) : '') +
            ', function(provide' + (libNames && libNames.length ? ', ' + libNames.join(', ') : '') + ') {\n' +
            btEngineSource + '\n' +
            'var bt = new BT();\n' +
            (libPrepares ? libPrepares.join('\n') + '\n' : '') +
            inputSources + '\n' +
            'provide(bt);\n' +
            '});\n';
    },

    /**
     * Builds client js.
     * @param {String} btEngineSource
     * @param {String} inputSources
     * @param {Object} dependencies example: {libName: "dependencyName"}
     * @returns {string}
     */
    build: function (btEngineSource, inputSources, dependencies) {
        var libNames;
        var libPrepares;
        if (dependencies) {
            libNames = Object.keys(dependencies);
            libPrepares = libNames.map(function (libName) {
                return 'bt.lib.' + libName + ' = ' + dependencies[libName] + ';';
            });
        }
        return btEngineSource + '\n' +
            'var bt = new BT();\n' +
            (libPrepares ? libPrepares.join('\n') + '\n' : '') +
            inputSources;
    }
};
