module = angular.module "AppBar"


module.directive "appBar", ->
    restrict: "E"
    templateUrl: "templates/components/app-bar.tpl.html"
    replace: true