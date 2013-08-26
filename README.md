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

Состояния
---------

Частью методологии BEViS являются состояния. Состояния могут быть выставлены в шаблонах:

```javascript
bt.match('button_simple', function (ctx) { // регистрируем матчер для view=simple блока button
    ctx.setTag('button');
    ctx.setContent(ctx.getParam('title'));
});
```

Ниже в этом документе можно найти перечень методов класса Ctx. Дальше пойдем по примерам.

Например, зададим блоку `button` тег `button`, а блоку `input` тег `input`:

```javascript
module.exports = function(bt) {
    bt.match('button', function(ctx) {
        ctx.setTag('button');
    });
    bt.match('input', function(ctx) {
        ctx.setTag('input');
    });
};
```

Еще примеры
-----------

Например, мы хотим установить состояине `closed` для всех блоков `popup`:

```javascript
bt.match('popup', function(ctx) {
    ctx.setState('closed');
});
```

Преобразование BT JSON-дерева
-----------------------------

Кроме модификации элемента, функция-преобразователь может вернуть новый BT JSON.
Здесь мы воспользуемся методами `ctx.getJson()` (возвращает текущий элемент BT JSON "как есть")
и `ctx.setContent()` (возвращает или устанавливает контент).

Например, обернем блок `header` блоком `header-wrapper`:

```javascript
bt.match('header', function(ctx) {
    return {
        block: 'header-wrapper',
        content: ctx.getJson()
    };
});
bt.match('header-wrapper', function(ctx) {
    ctx.setContent(ctx.getParam('content'));
});
```

Метод `ctx.setContent` принимает BT JSON, который надо выставить для содержимого.
