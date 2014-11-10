module = angular.module "NavDrawer"

module.directive "navDrawer", ->
    restrict: "E"
    templateUrl: "templates/components/nav-drawer.tpl.html"
    controller: "NavDrawerController"
    controllerAs: "NavDrawerCtrl"