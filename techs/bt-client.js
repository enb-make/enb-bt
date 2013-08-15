/**
 * bt-client
 * =========
 * 
 * Склеивает *bt*-файлы по deps'ам с помощью набора `require` в виде `?.bemhtml.client.js`.
 * Предназначен для сборки клиентского BH-кода.
 * 
 * **Опции**
 * 
 * * *String* **target** — Результирующий таргет. По умолчанию — `?.bemhtml.client.js`.
 * * *String* **filesTarget** — files-таргет, на основе которого получается список исходных файлов (его предоставляет технология `files`). По умолчанию — `?.files`.
 * 
 * **Пример**
 * 
 * ```javascript
 * nodeConfig.addTech(require('bt/techs/bt-client'));
 * ```
 */
 var Vow = require('vow'),
    vowFs = require('vow-fs'),
    btClientProcessor = require('../lib/bt-client-processor');

module.exports = require('enb/lib/build-flow').create()
    .name('bt-client')
    .target('target', '?.bt.client.js')
    .defineOption('btFile', '')
    .defineOption('dependencies', {})
    .useFileList(['bt.js'])
    /**
     * Отдельно кэшируем BH-библиотеку.
     */
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
        return Vow.all([
            vowFs.read(this._btFile, 'utf8').then(function(data) {
                return data;
            }),
            Vow.all(btFiles.map(function(file) {
                return vowFs.read(file.fullname, 'utf8').then(function(data) {
                    var relPath = node.relativePath(file.fullname);
                    /**
                     * Выставляем комментарии о склеенных файлах.
                     */
                    return '// begin: ' + relPath + '\n' +
                        btClientProcessor.process(data) + '\n' +
                        '// end: ' + relPath + '\n';
                });
            })).then(function(sr) {
                return sr.join('\n');
            })
        ]).spread(function(btEngineSource, inputSources) {
            return btClientProcessor.build(btEngineSource, inputSources, dependencies);
        });
    })
    .createTech();
