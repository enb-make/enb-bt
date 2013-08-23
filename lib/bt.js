var BT = (function() {
/**
 * dirtyDev указывает на то, что прототип объекта не пустой.
 * @type {Boolean}
 */
var dirtyEnv = false;
for (var i in {}) {
    dirtyEnv = true;
    break;
}
/**
 * BT: BtJson -> HTML процессор.
 * @constructor
 */
function BT() {
    /**
     * Используется для идентификации матчеров.
     * Каждому матчеру дается уникальный id для того, чтобы избежать повторного применения
     * матчера к одному и тому же узлу BtJson-дерева.
     * @type {Number}
     * @private
     */
    this._lastMatchId = 0;
    /**
     * Плоский массив для хранения матчеров.
     * Каждый элемент — массив с двумя элементами: [{String} выражение, {Function} матчер}]
     * @type {Array}
     * @private
     */
    this._matchers = [];
    /**
     * Отображения по умолчанию для блоков.
     * @type {Object}
     * @private
     */
    this._defaultViews = {};
    /**
     * Флаг, включающий автоматическую систему поиска зацикливаний. Следует использовать в development-режиме,
     * чтобы определять причины зацикливания.
     * @type {Boolean}
     * @private
     */
    this._infiniteLoopDetection = false;

    /**
     * Неймспейс для библиотек. Сюда можно писать различный функционал для дальнейшего использования в матчерах.
     * ```javascript
     * bt.lib.objects = bt.lib.objects || {};
     * bt.lib.objects.inverse = bt.lib.objects.inverse || function(obj) { ... };
     * ```
     * @type {Object}
     */
    this.lib = {};
    /**
     * Опции BT. Задаются через setOptions.
     * @type {Object}
     */
    this._options = {};
    this.utils = {

        _lastGenId: 0,

        bt: this,

        /**
         * Возвращает позицию элемента в рамках родителя.
         * Отсчет производится с 1 (единицы).
         *
         * ```javascript
         * bt.match('list__item', function(ctx) {
         *     if (ctx.position() === 2) {
         *         ctx.setState('is-second');
         *     }
         * });
         * ```
         * @returns {Number}
         */
        getPosition: function () {
            var node = this.node;
            return node.index === 'content' ? 1 : node.index + 1;
        },

        /**
         * Возвращает true, если текущий bemjson-элемент первый в рамках родительского bemjson-элемента.
         *
         * ```javascript
         * bt.match('list__item', function(ctx) {
         *     if (ctx.isFirst()) {
         *         ctx.setState('is-first');
         *     }
         * });
         * ```
         * @returns {Boolean}
         */
        isFirst: function () {
            var node = this.node;
            return node.index === 'content' || node.index === 0;
        },

        /**
         * Возвращает true, если текущий bemjson-элемент последний в рамках родительского bemjson-элемента.
         *
         * ```javascript
         * bt.match('list__item', function(ctx) {
         *     if (ctx.isLast()) {
         *         ctx.setState('is-last');
         *     }
         * });
         * ```
         * @returns {Boolean}
         */
        isLast: function () {
            var node = this.node;
            return node.index === 'content' || node.index === node.arr.length - 1;
        },

        // --- HTML ---

        /**
         * Устанавливает тег.
         *
         * @param tagName
         * @returns {String|undefined}
         */
        setTag: function (tagName) {
            this.ctx._tag = tagName;
            return this;
        },

        /**
         * Возвращает тег.
         *
         * @returns {Ctx}
         */
        getTag: function () {
            return this.ctx._tag;
        },

        /**
         * Устанавливает значение атрибута.
         *
         * @param {String} attrName
         * @param {String} attrValue
         */
        setAttr: function (attrName, attrValue) {
            (this.ctx._attrs || (this.ctx._attrs = {}))[attrName] = attrValue;
            return this;
        },

        /**
         * Возвращает значение атрибута.
         *
         * @param {String} attrName
         * @returns {Ctx}
         */
        getAttr: function (attrName) {
            return this.ctx._attrs ? this.ctx._attrs[attrName] : undefined;
        },

        /**
         * Отключает генерацию атрибута `class`.
         *
         * @returns {Ctx}
         */
        disableCssClassGeneration: function () {
            this.ctx._disableCssGeneration = true;
            return this;
        },

        /**
         * Включает генерацию атрибута `class`. По умолчанию — включено.
         *
         * @returns {Ctx}
         */
        enableCssClassGeneration: function () {
            this.ctx._disableCssGeneration = false;
            return this;
        },

        /**
         * Возвращает `true` если генерация атрибута `class` включена.
         *
         * @returns {Boolean}
         */
        isCssClassGenerationEnabled: function () {
            return !Boolean(this.ctx._disableCssGeneration);
        },

        /**
         * Отключает генерацию дополнительных data-атрибутов.
         *
         * @returns {Ctx}
         */
        disableDataAttrGeneration: function () {
            this.ctx._disableDataAttrGeneration = true;
            return this;
        },

        /**
         * Включает генерацию дополнительных data-атрибутов.
         *
         * @returns {Ctx}
         */
        enableDataAttrGeneration: function () {
            this.ctx._disableDataAttrGeneration = false;
            return this;
        },

        /**
         * Возвращает `true` если генерация дополнительных data-атрибутов включена.
         *
         * @returns {Boolean}
         */
        isDataAttrGenerationEnabled: function () {
            return !Boolean(this.ctx._disableDataAttrGeneration);
        },

        // --- BEViS ---

        /**
         * Возвращает состояние по его имени.
         *
         * @param {String} stateName
         * @returns {String|Boolean|undefined}
         */
        getState: function (stateName) {
            return this.ctx._state ? this.ctx._state[stateName] : undefined;
        },

        /**
         * Устанавливает значение состояния.
         *
         * @param {String} stateName
         * @param {String|Boolean|null} stateValue
         * @returns {Ctx}
         */
        setState: function (stateName, stateValue) {
            (this.ctx._state || (this.ctx._state = {}))[stateName] =
                arguments.length === 1 ? true : stateValue;
            return this;
        },

        /**
         * Возвращает значение параметра (btjson).
         *
         * @param {String} paramName
         * @returns {*|undefined}
         */
        getParam: function (paramName) {
            return this.ctx[paramName];
        },

        /**
         * Устанавливает содержимое.
         *
         * @param {BtJson} content
         * @returns {Ctx}
         */
        setContent: function (content) {
            this.ctx._content = content;
            return this;
        },

        /**
         * Возвращает содержимое.
         *
         * @returns {BtJson|undefined}
         */
        getContent: function () {
            return this.ctx._content;
        },

        /**
         * Возвращает набор миксинов, либо `undefined`.
         *
         * @returns {BtJson[]|undefined}
         */
        getMixins: function () {
            return this.ctx.mixins;
        },

        /**
         * Добавляет миксин.
         *
         * @param {BtJson} mixin
         * @returns {Ctx}
         */
        addMixin: function (mixin) {
            (this.ctx.mixins || (this.ctx.mixins = [])).push(mixin);
            return this;
        },

        /**
         * Включает автоматическую инициализацию.
         *
         * @returns {Ctx}
         */
        enableAutoInit: function () {
            if (this.ctx.autoInit !== false) {
                this.ctx.autoInit = true;
            }
            return this;
        },

        /**
         * Возвращает `true`, если для данного элемента включена автоматическая инициализация.
         *
         * @returns {Boolean}
         */
        isAutoInitEnabled: function () {
            return Boolean(this.ctx.autoInit);
        },

        /**
         * Устанавливает опцию, которая передается в JS-блок при инициализации.
         *
         * @param {String} optName
         * @param {*} optValue
         * @returns {Ctx}
         */
        setInitOption: function (optName, optValue) {
            (this.ctx._initOptions || (this.ctx._initOptions = {}))[optName] = optValue;
            return this;
        },

        /**
         * Возвращает значение опции, которая передается в JS-блок при инициализации.
         *
         * @param {String} optName
         * @returns {*}
         */
        getInitOption: function (optName) {
            return this.ctx._initOptions ? this.ctx._initOptions[optName] : undefined;
        },

        /**
         * Возвращает уникальный идентификатор. Может использоваться, например,
         * чтобы задать соответствие между `label` и `input`.
         * @returns {String}
         */
        generateId: function () {
            return 'uniq' + (this._lastGenId++);
        },

        /**
         * Останавливает выполнение прочих матчеров для данного bemjson-элемента.
         *
         * Пример:
         * ```javascript
         * bt.match('button', function(ctx) {
         *     ctx.setTag('button');
         * });
         * bt.match('button', function(ctx) {
         *     ctx.setTag('span');
         *     ctx.stop();
         * });
         * ```
         * @returns {Ctx}
         */
        stop: function () {
            this.ctx._stop = true;
            return this;
        },

        /**
         * Выполняет преобразования данного bemjson-элемента остальными матчерами.
         * Может понадобиться, например, чтобы добавить элемент в самый конец содержимого,
         * если в базовых шаблонах в конец содержимого добавляются другие элементы.
         *
         * Предоставляет минимальный функционал доопределения в рамках библиотеки.
         *
         * @returns {Ctx}
         */
        applyTemplates: function () {
            var prevCtx = this.ctx,
                prevNode = this.node;
            var res = this.bt.processBtJson(this.ctx, this.ctx.block, true);
            if (res !== prevCtx) {
                this.newCtx = res;
            }
            this.ctx = prevCtx;
            this.node = prevNode;
            return this;
        },

        /**
         * Возвращает текущий фрагмент BtJson-дерева.
         * Может использоваться в связке с `return` для враппинга и подобных целей.
         * ```javascript
         *
         * bt.match('input', function(ctx) {
         *     return {
         *         elem: 'wrapper',
         *         content: ctx.getJson()
         *     };
         * });
         * ```
         * @returns {Object|Array}
         */
        getJson: function () {
            return this.newCtx || this.ctx;
        }
    };
}

BT.prototype = {
    /**
     * Включает/выключает механизм определения зацикливаний.
     *
     * @param {Boolean} enable
     * @returns {BT}
     */
    enableInfiniteLoopDetection: function(enable) {
        this._infiniteLoopDetection = enable;
        return this;
    },

    /**
     * Преобразует BtJson в HTML-код.
     * @param {Object|Array|String} btJson
     */
    apply: function (btJson) {
        return this.toHtml(this.processBtJson(btJson));
    },

    /**
     * Объявляет матчер.
     *
     * ```javascript
     * bt.match('b-page', function(ctx) {
     *     ctx.addMixin({ block: 'i-ua' });
     *     ctx.setAttr('class', 'i-ua_js_no i-ua_css_standard');
     * });
     * bt.match('block_mod_modVal', function(ctx) {
     *     ctx.setTag('span');
     * });
     * bt.match('block__elem', function(ctx) {
     *     ctx.setAttr('disabled', 'disabled');
     * });
     * bt.match('block__elem_elemMod_elemModVal', function(ctx) {
     *     ctx.setState('is-active');
     * });
     * bt.match('block_blockMod_blockModVal__elem', function(ctx) {
     *     ctx.setContent({
     *         elem: 'wrapper',
     *         content: ctx.getJson()
     *     };
     * });
     * ```
     * @param {String|Array} expr
     * @param {Function} matcher
     * @returns {Ctx}
     */
    match: function (expr, matcher) {
        matcher.__id = '__func' + (this._lastMatchId++);
        if (Array.isArray(expr)) {
            for (var i = 0, l = expr.length; i < l; i++) {
                (this._matchers[expr[i]] || (this._matchers[expr[i]] = [])).unshift(matcher);
            }
        } else {
            (this._matchers[expr] || (this._matchers[expr] = [])).unshift(matcher);
        }
        return this;
    },

    /**
     * Устанавливает отображение по умолчанию для блока.
     *
     * @param {String} blockName
     * @param {String} viewName
     * @returns {BT}
     */
    setDefaultView: function (blockName, viewName) {
        this._defaultViews[blockName] = viewName;
        return this;
    },

    /**
     * Раскрывает BtJson, превращая его из краткого в полный.
     * @param {Object|Array} btJson
     * @param {String} [blockName]
     * @param {Boolean} [ignoreContent]
     * @returns {Object|Array}
     */
    processBtJson: function (btJson, blockName, ignoreContent) {
        var resultArr = [btJson];
        var nodes = [{ json: btJson, arr: resultArr, index: 0, blockName: blockName }];
        var node, json, block, blockView, i, l, p, child, subRes;
        var matchers = this._matchers;
        var processContent = !ignoreContent;
        var infiniteLoopDetection = this._infiniteLoopDetection;

        /**
         * Враппер для json-узла.
         * @constructor
         */
        function Ctx() {
            this.ctx = null;
            this.newCtx = null;
        }
        Ctx.prototype = this.utils;
        var ctx = new Ctx();
        while (node = nodes.shift()) {
            json = node.json;
            block = node.blockName;
            blockView = node.blockView;
            if (Array.isArray(json)) {
                for (i = 0, l = json.length; i < l; i++) {
                    child = json[i];
                    if (child !== false && child != null && typeof child === 'object') {
                        nodes.push({ json: child, arr: json, index: i, blockName: block, blockView: blockView });
                    }
                }
            } else {
                var content, stopProcess = false;
                if (json.elem) {
                    block = json.block = json.block || block;
                    blockView = json.view = json.view || blockView || this._defaultViews[block];
                } else if (json.block) {
                    block = json.block;
                    blockView = json.view = json.view || this._defaultViews[block];
                }

                if (json.block) {

                    if (infiniteLoopDetection) {
                        json.__processCounter = (json.__processCounter || 0) + 1;
                        if (json.__processCounter > 100) {
                            throw new Error(
                                'Infinite loop detected at "' + json.block + (json.elem ? '__' + json.elem : '') + '".'
                            );
                        }
                    }

                    subRes = null;

                    if (!json._stop) {
                        ctx.node = node;
                        ctx.ctx = json;
                        var selectorPostfix = json.elem ? '__' + json.elem : '';

                        var matcherList = matchers[json.block + (json.view ? '_' + json.view : '') + selectorPostfix];
                        if (!matcherList && json.view) {
                            matcherList = matchers[json.block + '_' + json.view.split('-')[0] + '*' + selectorPostfix];
                        }
                        if (!matcherList) {
                            matcherList = matchers[json.block + '*' + selectorPostfix];
                        }

                        if (matcherList) {
                            for (i = 0, l = matcherList.length; i < l; i++) {
                                var matcher = matcherList[i], mid = matcher.__id;
                                if (!json[mid]) {
                                    json[mid] = true;
                                    subRes = matcher(ctx);
                                    if (subRes != null) {
                                        json = subRes;
                                        node.json = json;
                                        node.blockName = block;
                                        node.blockView = blockView;
                                        nodes.push(node);
                                        stopProcess = true;
                                        break;
                                    }
                                    if (json._stop) {
                                        break;
                                    }
                                }
                            }
                        }
                    }

                }

                if (!stopProcess) {
                    if (Array.isArray(json)) {
                        node.json = json;
                        node.blockName = block;
                        node.blockView = blockView;
                        nodes.push(node);
                    } else {
                        if (processContent && ((content = json._content) != null)) {
                            if (Array.isArray(content)) {
                                var flatten;
                                do {
                                    flatten = false;
                                    for (i = 0, l = content.length; i < l; i++) {
                                        if (Array.isArray(content[i])) {
                                            flatten = true;
                                            break;
                                        }
                                    }
                                    if (flatten) {
                                        json._content = content = content.concat.apply([], content);
                                    }
                                } while (flatten);
                                for (i = 0, l = content.length, p = l - 1; i < l; i++) {
                                    child = content[i];
                                    if (child !== false && child != null && typeof child === 'object') {
                                        nodes.push({
                                            json: child, arr: content, index: i, blockName: block, blockView: blockView
                                        });
                                    }
                                }
                            } else {
                                nodes.push({
                                    json: content, arr: json, index: 'content', blockName: block, blockView: blockView
                                });
                            }
                        }
                    }
                }
            }
            node.arr[node.index] = json;
        }
        return resultArr[0];
    },

    /**
     * Превращает раскрытый BtJson в HTML.
     * @param {Object|Array|String} json
     * @returns {String}
     */
    toHtml: function (json) {
        var res, i, l, item;
        if (json === false || json == null) return '';
        if (typeof json !== 'object') {
            return json;
        } else if (Array.isArray(json)) {
            res = '';
            for (i = 0, l = json.length; i < l; i++) {
                item = json[i];
                if (item !== false && item != null) {
                    res += this.toHtml(item);
                }
            }
            return res;
        } else {
            var jattr,
                attrs = json._disableDataAttrGeneration || json.elem || !json.block ?
                    '' :
                    ' data-block="' + json.block + '"', initOptions;

            if (jattr = json._attrs) {
                for (i in jattr) {
                    var attrVal = jattr[i];
                    if (attrVal === true) {
                        attrs += ' ' + i;
                    } else if (attrVal != null) {
                         attrs += ' ' + i + '="' + escapeAttr(jattr[i]) + '"';
                    }
                }
            }

            if (json._initOptions) {
                (initOptions = {}).options = json._initOptions;
            }

            var mixins = json.mixins;
            if (mixins && mixins.length) {
                (initOptions || (initOptions = {})).mixins = mixins;
            }

            if (initOptions) {
                attrs += ' data-options="' + escapeAttr(JSON.stringify(initOptions)) + '"';
            }

            var content, tag = (json._tag || 'div');
            res = '<' + tag;

            if (!json._disableCssGeneration) {
                res += ' class="';
                res += (json.block) +
                    (json.view ? '_' + json.view : '') +
                    (json.elem ? '__' + json.elem : '');

                var state = json._state;
                if (state) {
                    for (i in state) {
                        var stateVal = state[i];
                        if (stateVal != null && stateVal !== '' && stateVal !== false) {
                            if (stateVal === true) {
                                res += ' _' + i;
                            } else {
                                res += ' _' + i + '_' + stateVal;
                            }
                        }
                    }
                }

                if (json.autoInit || (mixins && mixins.length > 0)) {
                    res += ' _init';
                }

                res += '"';
            }

            res += attrs;

            if (selfCloseHtmlTags[tag]) {
                res += '/>';
            } else {
                res += '>';
                if ((content = json._content) != null) {
                    if (Array.isArray(content)) {
                        for (i = 0, l = content.length; i < l; i++) {
                            item = content[i];
                            if (item !== false && item != null) {
                                res += this.toHtml(item);
                            }
                        }
                    } else {
                        res += this.toHtml(content);
                    }
                }
                res += '</' + tag + '>';
            }
            return res;
        }
    }
};

var selfCloseHtmlTags = {
    area: 1,
    base: 1,
    br: 1,
    col: 1,
    command: 1,
    embed: 1,
    hr: 1,
    img: 1,
    input: 1,
    keygen: 1,
    link: 1,
    meta: 1,
    param: 1,
    source: 1,
    wbr: 1
};

var escapeAttr = function (attrVal) {
    attrVal += '';
    if (~attrVal.indexOf('&')) {
        attrVal = attrVal.replace(/&/g, '&amp;');
    }
    if (~attrVal.indexOf('"')) {
        attrVal = attrVal.replace(/"/g, '&quot;');
    }
    return attrVal;
};

return BT;
})();

if (typeof module !== 'undefined') {
    module.exports = BT;
}
