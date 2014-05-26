var File = require('enb-source-map/lib/file');

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
     * @param {String} targetPath
     * @param {Object} btEngine
     * @param {Object[]} inputSources
     * @param {Object} dependencies example: {libName: "dependencyName"}
     * @returns {string}
     */
    buildModule: function (targetPath, btEngine, inputSources, dependencies) {
        var file = new File(targetPath, true);
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
        file.writeLine(
            'modules.define(\'bt\'' +
            (depNames ? ', ' + JSON.stringify(depNames) : '') +
            ', function(provide' + (libNames && libNames.length ? ', ' + libNames.join(', ') : '') + ') {'
        );
        file.writeFileContent(btEngine.filename, btEngine.content);
        file.writeLine('var bt = new BT();');
        if (libPrepares) {
            libPrepares.forEach(function (libPrepare) {
                file.writeLine(libPrepare);
            });
        }
        inputSources.forEach(function (inputSource) {
            file.writeFileContent(inputSource.filename, inputSource.content);
        });
        file.writeLine('provide(bt);');
        file.writeLine('});');
        return file.render();
    }
};
