function BHController($scope) {

    $scope.compiledHtml = function() {
        $scope.error = '';
        var bt = new BT(), json;
        try {
            json = eval('(' + $scope.data.inputBemjson + ')');
        } catch (e) {
            return 'BT JSON parse error:\n' + e.stack;
        }
        try {
            eval($scope.data.inputMatchers);
        } catch (e) {
            return 'Matchers parse error:\n' + e.stack;
        }
        bt.enableInfiniteLoopDetection(true);
        var res = '';
        try {
            res = bt.apply(json).replace(/>/g, '>\n').replace(/([^>\n])</g, '$1\n<');
        } catch (e) {
            return 'Execution error:\n' + e.stack;
        }
        return res;
    };

    $scope.loadSettings = function(settings) {
        $scope.data = angular.fromJson(settings);
        $scope.data.inputBemjson = $scope.data.inputBemjson || '{ block: \'button\', text: \'Кнопка\' }';
        $scope.data.inputMatchers = $scope.data.inputMatchers ||
            'bt.match(\'button\', function(ctx) {\n' +
            '    ctx.setTag(\'button\');\n' +
            '    ctx.setAttr(\'role\', \'button\');\n' +
            '    ctx.setContent(ctx.getParam(\'text\'));\n' +
            '});\n';
    };
    $scope.loadSettings(localStorage['bt-config-settings'] || '{}');
    window.setInterval(function() {
        localStorage['bt-config-settings'] = angular.toJson($scope.data);
    }, 1000);
}
