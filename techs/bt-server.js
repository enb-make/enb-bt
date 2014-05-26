/**
 * bt-server
 * =========
 *
 * Склеивает *bt*-файлы по deps'ам с помощью набора `require` в виде `?.bemhtml.js`.
 *
 * **Опции**
 *
 * * *String* **target** — Результирующий таргет. По умолчанию — `?.bemhtml.js`.
 * * *String* **filesTarget** — files-таргет, на основе которого получается список исходных файлов (его предоставляет технология `files`). По умолчанию — `?.files`.
 *
 * **Пример**
 *
 * ```javascript
 * nodeConfig.addTech(require('bt/techs/bt-server'));
 * ```
 */
module.exports = require('enb/lib/build-flow').create()
    .name('bt-server')
    .target('target', '?.bt.js')
    .defineOption('btFile', '')
    .useFileList(['bt.js'])
    .needRebuild(function(cache) {
        this._btFile = this._btFile || 'node_modules/enb-bt/lib/bt.js';
        this._btFile = this.node._root + '/' + this._btFile;
        return cache.needRebuildFile('bt-file', this._btFile);
    })
    .saveCache(function(cache) {
        cache.cacheFileInfo('bt-file', this._btFile);
    })
    .builder(function(btFiles) {
        var node = this.node;
        /**
         * Генерирует `require`-строку для подключения исходных bt-файлов.
         *
         * @param {String} absPath
         * @param {String} pre
         * @param {String} post
         */
        function buildRequire(absPath, pre, post) {
            var relPath = node.relativePath(absPath);
            return [
                'dropRequireCache(require, require.resolve("' + relPath + '"));',
                (pre || '') + 'require("' + relPath + '")' + (post || '') + ';'
            ].join('\n');
        }

        var dropRequireCacheFunc = [
            'function dropRequireCache(requireFunc, filename) {',
            '    var module = requireFunc.cache[filename];',
            '    if (module) {',
            '        if (module.parent) {',
            '            if (module.parent.children) {',
            '                var moduleIndex = module.parent.children.indexOf(module);',
            '                if (moduleIndex !== -1) {',
            '                    module.parent.children.splice(moduleIndex, 1);',
            '                }',
            '            }',
            '            delete module.parent;',
            '        }',
            '        delete module.children;',
            '        delete requireFunc.cache[filename];',
            '    }',
            '};'
        ].join('\n');

        return [
            dropRequireCacheFunc,
            buildRequire(this._btFile, 'var BT = '),
            'var bt = new BT();',
            btFiles.map(function(file) {
                return buildRequire(file.fullname, '', '(bt)');
            }).join('\n'),
            'module.exports = bt;'
        ].join('\n');
    })
    .createTech();
