/**
 * bt-client-module
 * ================
 *
 * Склеивает *bt*-файлы по deps'ам в виде `?.bt.client.js`.
 * Предназначен для сборки клиентского BT-кода.
 * Использует модульную обертку.
 *
 * **Опции**
 *
 * * *String* **target** — Результирующий таргет. По умолчанию — `?.bt.client.js`.
 * * *String* **filesTarget** — files-таргет, на основе которого получается список
 *   исходных файлов (его предоставляет технология `files`). По умолчанию — `?.files`.
 *
 * **Пример**
 *
 * ```javascript
 * nodeConfig.addTech(require('bt/techs/bt-client-module'));
 * ```
 */
 var vow = require('vow'),
    vowFs = require('enb/lib/fs/async-fs'),
    btClientProcessor = require('../lib/bt-client-processor');

module.exports = require('enb/lib/build-flow').create()
    .name('bt-client-module')
    .target('target', '?.bt.client.js')
    .defineOption('btFile', '')
    .defineOption('dependencies', {})
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
        var dependencies = this._dependencies;
        var btFilePath = this._btFile;
        var targetPath = node.resolvePath(this._target);
        return vow.all([
            vowFs.read(btFilePath, 'utf8').then(function(content) {
                return {
                    filename: node.relativePath(btFilePath),
                    content: content
                };
            }),
            vow.all(btFiles.map(function(file) {
                return vowFs.read(file.fullname, 'utf8').then(function(content) {
                    return {
                        filename: node.relativePath(file.fullname),
                        content: btClientProcessor.process(content)
                    };
                });
            }))
        ]).spread(function(btEngine, inputSources) {
            return btClientProcessor.buildModule(targetPath, btEngine, inputSources, dependencies);
        });
    })
    .createTech();
