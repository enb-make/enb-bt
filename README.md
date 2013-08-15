BT [![Build Status](https://travis-ci.org/enb-make/bt.png?branch=master)](https://travis-ci.org/enb-make/bt)
===

BT — это BT JSON-процессор. Его главная цель — превратить BT JSON в HTML.

Установка
---------

BT-процессор и ENB-технологии для его использования можно найти в npm-пакете `bt`.

```
npm install enb-bt
```

Использование
-------------

BT-файлы в проекте имеют суффикс `bt.js`. Например, `b-page.bt.js`. Файл формируется в формате CommonJS для NodeJS:

```javascript
module.exports = function(bt) {
    // ...
};
```

Преобразования
--------------

Функции для работы с BT JSON ( **матчеры** ) объявляются через метод `match`.
В теле функций описывается логика преобразования BT JSON.

Синтаксис:

```javascript
void bt.match({String} expression, function({Ctx} ctx) {
    //.. actions
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

Матчинг
-------

Рассмотрим синтаксис строки матчинга для функций преобразования:

```javascript
'blockName[_view][__elementName]'
```

По-русски:

```javascript
'блок[_имяОтображения][__имяЭлемента]'
```

(В квадратных скобках необязательные параметры)

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
