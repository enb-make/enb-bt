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
 * * *Object* **dependencies** — Зависимости. По умолчанию — `{i18n: 'y-i18n'}`.
 * * *String* **filesTarget** — files-таргет, на основе которого получается список
 *   исходных файлов (его предоставляет технология `files`). По умолчанию — `?.files`.
 * * *Boolean* **freezeLinks** — Нужно ли замораживать ссылки внтри файлов. По умолчанию — `false`.
 *
 * **Пример**
 *
 * ```javascript
 * nodeConfig.addTech(require('enb-bt/techs/bt-client-module'));
 * ```
 */

var vow = require('vow');
var vowFs = require('enb/lib/fs/async-fs');
var btClientProcessor = require('../lib/bt-client-processor');
var BorschikPreprocessor = require('enb-borschik/lib/borschik-preprocessor');

module.exports = require('enb/lib/build-flow').create()
    .name('bt-client-module')
    .target('target', '?.bt.client.js')
    .defineOption('useSourceMap', true)
    .defineOption('btFile', '')
    .defineOption('dependencies', {i18n: 'y-i18n'})
    .defineOption('freezeLinks', false)
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

        var btFilePath = this._btFile;
        var freezeLinks = this._freezeLinks;
        return vow.all([
            vowFs.read(btFilePath, 'utf8').then(function(content) {
                return {
                    filename: node.relativePath(btFilePath),
                    content: content
                };
            }),
            vow.all(btFiles.map(function(file, index) {
                if (!freezeLinks) {
                    return vowFs.read(file.fullname, 'utf8').then(function (content) {
                        return {
                            filename: node.relativePath(file.fullname),
                            content: btClientProcessor.process(content)
                        };
                    });
                }

                return node.createTmpFileForTarget('#' + index).then(function (tmpFile) {
                    return new BorschikPreprocessor()
                        .preprocessFile(file.fullname, tmpFile, true, false, false)
                        .then(function () {
                            return vowFs.read(tmpFile, 'utf8');
                        })
                        .then(function (content) {
                            return vowFs.remove(tmpFile).then(function () {
                                return {
                                    filename: node.relativePath(file.fullname),
                                    content: btClientProcessor.process(content)
                                };
                            });
                        });
                });
            }))
        ]).spread(function(btEngine, inputSources) {
            return btClientProcessor.buildModule(
                node.resolvePath(this._target),
                btEngine,
                inputSources,
                this._dependencies,
                this._useSourceMap
            );
        }.bind(this));
    })
    .createTech();
