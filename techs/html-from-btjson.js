/**
 * html-from-btjson
 * ================
 *
 * Строит `html` на основе `btjson`.
 *
 * **Опции**
 *
 * * *String* **lang** — Язык. Обязательная опция.
 * * *String* **target** — Результирующий таргет. По умолчанию — `?.html`.
 * * *String* **btjsonFile** — Исходный `btjson`-файл. По умолчанию — `?.btjson.js`.
 * * *String* **btFile** — Исходный `bt`-файл. По умолчанию — `?.bt.js`.
 * * *String* **i18nFile** — Исходный `i18n`-файл. По умолчанию — `?.lang.{lang}.js`.
 *
 * **Пример**
 *
 * ```javascript
 * nodeConfig.addTech(require('bt/techs/bt-server'));
 * ```
 */

var dropRequireCache = require('enb/lib/fs/drop-require-cache');
var asyncRequire = require('enb/lib/fs/async-require');
var vow = require('vow');

module.exports = require('enb/lib/build-flow').create()
    .name('html-from-btjson')
    .target('target', '?.{lang}.html')
    .defineRequiredOption('lang')
    .useSourceFilename('btjsonFile', '?.btjson.js')
    .useSourceFilename('btFile', '?.bt.js')
    .useSourceFilename('i18nFile', '?.lang.{lang}.js')
    .builder(function (btjsonFilename, btFilename, i18nFilename) {
        dropRequireCache(require, btjsonFilename);
        dropRequireCache(require, btFilename);
        dropRequireCache(require, i18nFilename);
        return vow.all([
            asyncRequire(btjsonFilename),
            asyncRequire(btFilename),
            asyncRequire(i18nFilename)
        ]).spread(function (btjson, bt, i18n) {
            bt.lib.i18n = i18n();
            if (bt.lib.global) {
                bt.lib.global.lang = this.getOption('lang');
                if (bt.lib.global.setTld) {
                    bt.lib.global.setTld(this.getOption('lang'));
                }
            }
            return bt.apply(btjson);
        }.bind(this));
    })
    .createTech();
