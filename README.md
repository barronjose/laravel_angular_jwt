#Laravel / Angular / JWT!

## The what?
This is a boilerplate to create apps using Laravel to create the backend services and Angular.js for the cliente interface.
It uses jwt to create a token based auth instead of using cookies.

##Tech

* **Laravel v5.2** as the app bootstrap and services provider
* **Angular v1.5.3** for the client side development language
* **JWT** for token based AUTH
* **Sass** to add some styling
* **Twitter Bootstrap & Angular-UI** to make the app work in all devices
* **Gulp / Elixir** As the task manager

** This projet assumes that you already have Laravel, Composer, Node and NPM installed

##How to

First let's run composer to get all the laravel dependencies  

    $ composer install

Once it's done

    $ npm install

And finally

    $ bower install

To get all the app dependencies for both laravel and angular

Once all has been succesfully installed  we are goint to need two terminals

    $ gulp && gulp watch

and into the other one

    $ php artisan serve

This will run the app and start serving our services.
