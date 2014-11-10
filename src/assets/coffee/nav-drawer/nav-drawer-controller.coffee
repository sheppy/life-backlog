module = angular.module "NavDrawer"


module.controller "NavDrawerController",
    class NavDrawerController
        @$inject: ["$scope", "$document"]

        constructor: (@$scope, @$document) ->
            @$scope.isNavOpen = false

            # TODO: Fix this! Breaks the back button when you navigate away
            # Maybe use a method to change page instead of the ui-sref

            # Close menu when we navigate away
#            @$scope.$on "$locationChangeSuccess", =>
#                # TODO: Check we dont need to use $apply etc
#                @$scope.close()

        open: ->
            @$scope.isNavOpen = true
            @$document[0].addEventListener "backbutton", @onBack, false

        close: ->
            @$scope.isNavOpen = false
            @$document[0].removeEventListener "backbutton", @onBack, false

        toggle: ->
            if @$scope.isNavOpen then @close() else @open()

        # Prevent the back button and close the menu
        onBack: ->
            @$scope.$apply => @$scope.close()