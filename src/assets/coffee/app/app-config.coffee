module = angular.module "LifeBacklogApp"


module.config ($urlRouterProvider, $stateProvider) ->
    # Default route
    $urlRouterProvider.when "", "/home"
    $urlRouterProvider.when "/", "/home"
    $urlRouterProvider.otherwise "/404"


    # Page not found
    $stateProvider.state "404",
        url: "/404",
        views:
            "master":
                templateUrl: "templates/page.tpl.html"
            "app-bar@404":
                templateUrl: "templates/page/404/app-bar.tpl.html"
            "content@404":
                templateUrl: "templates/page/404/content.tpl.html"

    # Home
    $stateProvider.state "home",
        url: "/home",
        views:
            "master":
                templateUrl: "templates/page.tpl.html"
            "app-bar@home":
                templateUrl: "templates/page/home/app-bar.tpl.html"
            "content@home":
                templateUrl: "templates/page/home/content.tpl.html"
