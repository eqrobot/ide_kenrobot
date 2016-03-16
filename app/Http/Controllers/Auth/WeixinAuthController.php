<?php

namespace App\Http\Controllers\Auth;

use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Controllers\Controller;

use App\WebAuth\Factory as WebAuthFactory;
use Auth;

class WeixinAuthController extends Controller
{

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function weixinLogin(Request $request)
    {
        if (Auth::check()) {
            $user = Auth::user();
            return response()->json(['code' => 1, 'message' => '已经登录', 'data' => $user]);
        }


        $weixinauth = WebAuthFactory::create('weixin');
        $crendentials = $request->only('key');

        $loginResult = $weixinauth->validate($crendentials);

        if ($loginResult === false) {
            return response()->json(['code' => 2, 'message' => '登录失败']);
        }

        $user = $weixinauth->localUser();

        if (Auth::check()) {
            Auth::logout();
        }
        Auth::login($user,false);
        return response()->json(['code' => 0, 'message' => '登录成功','data' => $user]);
    }

}
