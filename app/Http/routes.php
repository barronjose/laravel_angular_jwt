<?php

/*
|--------------------------------------------------------------------------
| Routes File
|--------------------------------------------------------------------------
|
| Here is where you will register all of the routes in an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the controller to call when that URI is requested.
|
*/

Route::get('/', function () {
    return view('index');
});

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| This route group applies the "web" middleware group to every route
| it contains. The "web" middleware group is defined in your HTTP
| kernel and includes session state, CSRF protection, and more.
|
*/

Route::group(['prefix' => 'api'], function () {
    // Route::resource('authenticate', 'AuthenticateController', ['only' => ['index']]);

    Route::post('authenticate', 'AuthenticateController@authenticate');
    Route::post('authenticate/register', 'Auth\AuthController@register');
    Route::put('authenticate/forgot', 'Auth\AuthController@forgotPassword');
    Route::put('authenticate/change', 'Auth\AuthController@changePassword');

    Route::get('authenticate/user', 'AuthenticateController@getAuthenticatedUser');
    Route::group(['middleware' => 'jwt.auth'], function () {
        Route::resource('purchases', 'PurchasesController');
        Route::resource('users', 'UsersController');
    });
});

// Route::group(['middleware' => ['web']], function () {
//     //
// });
//
// Route::auth();
//
// Route::get('/home', 'HomeController@index');
