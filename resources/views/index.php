<!doctype html>
<html>
    <head>
        <meta charset="utf-8">
        <title>Medi Puntos</title>
        <link rel="stylesheet" href="css/app.css">
    </head>
    <body ng-app="mediPuntos">
        <div id="MainContainer">
            <nav class="navbar navbar-default" ng-controller="NavBarCtrl">
                <div class="container">
                    <div class="navbar-header">
                        <button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#bs-example-navbar-collapse-3" ng-click="isCollapsed = !isCollapsed">
                            <span class="sr-only">Toggle navigation</span>
                            <span class="icon-bar"></span>
                            <span class="icon-bar"></span>
                            <span class="icon-bar"></span>
                        </button>
                        <a class="navbar-brand visible-xs" href="#">Medi <Puntos></Puntos></a>
                    </div>
                    <ul class="nav navbar-nav">
                        <a href="/" role="button" class="navbar-brand">
                            Medi Puntos
                        </a>
                        <ul class="nav navbar-nav pull-right" ng-if="isLogged">
                            <li><a href="#/logout">Logout</a></li>
                        </ul>
                    </ul>
                </div>
            </nav>

            <div class="container">
                <div ui-view></div>
            </div>

            <!-- <footer class="footer">
                <div class="container">
                    <p class="text-muted">&copy; Medi Puntos</p>
                </div>
            </footer> -->

        </div>
        <script src="js/vendor.js"></script>
        <script src="js/app.js"></script>
    </body>
</html>
