<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the controller to call when that URI is requested.
|
 */

Route::get('/home', 'HomeController@index');
Route::get('/v2', 'HomeController@index2');
Route::get('/', 'Auth\WeixinAuthController@homeIndex');
Route::get('/items', 'HomeController@items');

Route::post('/build', 'HomeController@build');
Route::get('/download', 'HomeController@download');
Route::post('/feedback', 'HomeController@feedback');

// 登录验证
Route::get('/auth/login', 'Auth\AuthController@getLogin');
Route::post('/auth/login', 'Auth\AuthController@postLogin');
Route::get('/auth/logout', 'Auth\AuthController@getLogout');

// 注册
Route::get('/auth/register', 'Auth\AuthController@getRegister');
Route::post('/auth/register', 'Auth\AuthController@postRegister');

Route::get('/auth/snslogin', 'Auth\SnsAuthController@snsLogin');
Route::any('/snspostlogin', 'Auth\SnsAuthController@snsPostLogin');
Route::any('/weixinlogin', 'Auth\WeixinAuthController@weixinlogin');
Route::get('/login', 'Auth\WeixinAuthController@index');