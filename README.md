BT [![Build Status](https://travis-ci.org/enb-make/bt.png?branch=master)](https://travis-ci.org/enb-make/bt)
===

BT = BEViS Templater.

BT — это BT JSON-процессор. Его главная цель — превратить BT JSON в HTML.

Установка
---------

BT-процессор и ENB-технологии для его использования можно найти в npm-пакете `enb-bt`.

```
npm install enb-bt
```

Использование
-------------

BT-файлы в проекте имеют суффикс `bt.js`. Например, `b-page.bt.js`. Файл формируется в формате `CommonJS` для NodeJS:

```javascript
module.exports = function(bt) {
    // ...
};
```

Введение
--------

BT — это шаблонизатор. Он позволяет превратить json-описание блоков в HTML.
Полученный HTML потом можно вернуть в качестве ответа на HTTP-запрос,
либо использовать для вставки в интерактивной JS-логике на клиенте.

Для преобразования в HTML используются **матчеры**, это функции,
обрабатывающие ветви BT JSON дерева. В матчерах мы пишем, в какой HTML
следует превратить тот или иной фрагмент BT JSON.

Например, выставим тег `button` для блока `button`:

```javascript
bt.match('button', function (ctx) { // регистрируем матчер для блока button
    ctx.setTag('button'); // устанавливаем HTML тег
});
```

Рассмотрим полное содержимое файла `button.bt.js`:

```javascript
module.exports = function(bt) { // CommonJS-обертка, получаем инстанцию bt

    bt.match('button', function (ctx) { // регистрируем матчер для блока button
        ctx.setTag('button'); // устанавливаем HTML тег
    });

};
```

В результате наш шаблон генерирует следующий HTML:

```html
<button class="button" data-block="button"></button>
```

На основе BT JSON:

```javascript
{
    block: 'button'
}
```

Матчеры
-------

Синтаксис матчеров:

```javascript
void bt.match({String} expression, function({Ctx} ctx) {
    //.. actions
});
```

Существует возможность описать матчер сразу для нескольких селекторов:

```javascript
void bt.match({String[]} expressions, function({Ctx} ctx) {
    //.. actions
});
```

Рассмотрим синтаксис селектора:

```javascript
'blockName[_view][__elementName]'
```

По-русски:

```javascript
'блок[_имяОтображения][__имяЭлемента]'
```

(В квадратных скобках необязательные параметры)

Помимо блоков, можно писать селекторы на элементы блоков. Например, зададим тег `span` элементу `text` кнопки:

```javascript
bt.match('button', function (ctx) { // регистрируем матчер для блока button
    ctx.setTag('button'); // устанавливаем HTML тег для самой кнопки
    ctx.setContent({ // задаем содержимое блока
        elem: 'text', // указываем элемент text в качестве содержимого
        title: ctx.getParam('title') // передаем параметр title элементу text
    });
});
bt.match('button__text', function (ctx) { // регистрируем матчер для элемента text блока button
    ctx.setTag('span'); // выставляем тег span для элемента text
    ctx.setContent(ctx.getParam('title')); // выставляем содержимое из опции title
});
```

Результат:

```html
<!-- {block: 'button', title: 'Hello'} -->
<button class="button" data-block="button"><span class="button__text">Hello</span></button>
```

Для разделения стилей и шаблонов для различных вариантов одного блока были введены отображения — **view**. **view** участвует в селекторах.

Например:

```javascript
bt.match('button_simple', function (ctx) { // регистрируем матчер для view=simple блока button
    ctx.setTag('button');
    ctx.setContent(ctx.getParam('title'));
});
bt.match('button_input', function (ctx) { // регистрируем матчер для view=input блока button
    ctx.setTag('input');
    ctx.setAttr('type', 'submit'); // устанавливаем атрибут type в значение submit
    ctx.setAttr('value', ctx.getParam('title'));
});
```

Результат:

```html
<!-- {block: 'button', view: 'simple', title: 'Hello'} -->
<button class="button_simple" data-block="button">Hello</button>

<!-- {block: 'button', view: 'input', title: 'Hello'} -->
<input class="button_input" data-block="button" value="Hello" />

<!-- {block: 'button', title: 'Hello'} // нет матчера для отсутствующего view -->
<div class="button" data-block="button"></div>
```

На основе **view** изменяется и `CSS`-класс элементов. Для `{block: 'button', view: 'simple'}` элемент `text` получает класс `button_simple__text`.

Селекторы можно писать на **view** по определенному префиксу. Например:

```javascript
bt.match('button_simple*', function (ctx) {
    ctx.setTag('button');
});
```

Результат:

```html
<!-- {block: 'button', view: 'simple-red'} -->
<button class="button_simple-red" data-block="button"></button>
```

Для тех или иных блоков можно установить `view` по умолчанию:

```javascript
module.exports = function(bt) {
    bt.setDefaultView('button', 'simple');
    // ...
};
```

Надо заметить, что в `BEViS` отображение отделяется от поведения. Атрибут `data-block` 
указывает на имя блока для привязки к JS, а CSS-классы участвуют в отображении.

Состояния
---------

Неотъемлемой частью `BEViS` являются состояния. Они используются для визуального отображения (с помощью CSS)
тех или иных ситуаций для блоков, элементов.

Состояния могут быть выставлены в шаблонах:

```javascript
bt.match('button', function (ctx) {
    ctx.setTag('button');
    if (ctx.getParam('disabled') === true) {
        ctx.setState('disabled'); // добавляем CSS-класс _disabled
        ctx.setAttr('disabled', true); // добавляем атрибут disabled
    }
});
```

Результат:

```html
<!-- {block: 'button', disabled: true} -->
<button class="button _disabled" data-block="button" disabled></button>
```

Состояния могут принимать значения:

```javascript
bt.match('popup', function (ctx) {
    ctx.setState('orientation', 'top');
});
```

Результат:

```html
<!-- {block: 'popup'} -->
<div class="popup _orientation_top" data-block="popup"></div>
```

Миксины
-------

Миксины — классы, имеющие дополнительное поведение для тех или иных блоков.
Миксины могут подмешиваться только к блокам, но не к элементам.

Например, BT JSON:

```javascript
{block: 'input', mixins: [{name: 'auto-focus'}]}
```

С матчером:

```javascript
bt.match('input', function (ctx) {
    ctx.setTag('input');
});
```

Превращается в HTML:

```html
<input class="input _init" data-block="input" data-options="{mixins:[{name: 'auto-focus'}]}"/>
```

В дальшнейшем, при инициализации страницы, миксин будет инстанцирован для данного блока.

Автоматическая инициализация
----------------------------

Автоматическая инициализация — это инициализация блоков при загрузке страницы.
Она может требоваться самим блоком в шаблоне:

```javascript
bt.match('button', function (ctx) {
    ctx.enableAutoInit();
});
```

А может быть указана в BT JSON:

```javascript
{block: 'button', autoInit: true}
```

В обоих случаях HTML-элемент кнопки получает класс `_init`, который сообщает `YBlock` о том,
что данный блок следует инициализировать автоматически.

Данные
------

Исходными данными (BT JSON) являются:

* Имя блока: `block` — `ctx.getBlockName()`.
* Имя элемента: `elem` — `ctx.getElementName()`.
* Имя отображения: `view` — `ctx.getView()`
* Миксины блока: `mixins` — `ctx.getMixins()`
* Флаг автоматической инициализации: `autoInit` — `ctx.isAutoInitEnabled()`
* Прочие параметры, которые можно достать в шаблоне с помощью `ctx.getParam('paramName')`.

Результирующие данные:

* Имя тега: `ctx.setTag('button')`.
* Атрибуты: `ctx.setAttr('href', '/')`.
* Состояния: `ctx.setState('disabled')`.
* Миксины блока: `mixins` — `ctx.addMixin({name: 'auto-focus', opt: 1})`
* Флаг автоматической инициализации: `ctx.enableAutoInit()`.
* Опции инициализации блока: `ctx.setInitOption('optName', 'optValue')`.
* Содержимое: `ctx.setContent({ elem: 'sub' })`.
