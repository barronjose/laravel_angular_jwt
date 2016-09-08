<?php

namespace App\Http\Controllers\Auth;

use App\User;
use Validator;
use App\Http\Controllers\Controller;
use Illuminate\Foundation\Auth\ThrottlesLogins;
use Illuminate\Foundation\Auth\AuthenticatesAndRegistersUsers;
use Response;

use Illuminate\Http\Request;

class AuthController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Registration & Login Controller
    |--------------------------------------------------------------------------
    |
    | This controller handles the registration of new users, as well as the
    | authentication of existing users. By default, this controller uses
    | a simple trait to add these behaviors. Why don't you explore it?
    |
    */

    use AuthenticatesAndRegistersUsers, ThrottlesLogins;

    /**
     * Where to redirect users after login / registration.
     *
     * @var string
     */
    protected $redirectTo = '/home';

    /**
     * Create a new authentication controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('guest', ['except' => 'logout']);
    }

    /**
     * Get a validator for an incoming registration request.
     *
     * @param  array  $data
     * @return \Illuminate\Contracts\Validation\Validator
     */
    protected function validator(array $data)
    {
        return Validator::make($data, [
            'name' => 'required|max:255',
            'email' => 'required|email|max:255|unique:users',
            'password' => 'required|confirmed|min:6',
        ]);
    }

    /**
     * Create a new user instance after a valid registration.
     *
     * @param  array  $data
     * @return User
     */
    protected function create(array $data)
    {
        return User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'user_type' => $data['user_type'],
            'user_number' => $data['user_number'],
        ]);
    }

    public function register(Request $request)
    {
        // $this->validate($request, [
        //     'name'       => 'required|min:3',
        //     'email'      => 'required|email|unique:users',
        //     'password'   => 'required|min:8',
        // ]);

        $user = new User;
        $user->name = trim($request->name);
        $user->email = trim(strtolower($request->email));
        $user->password = \Hash::make($request->password);
        $user->user_type = trim($request->userType);
        $user->user_number = trim($request->userNumber);

        $user->save();
        // $token = JWTAuth::fromUser($user);
        // return response()->success(compact('user', 'token'));
    }

    public function forgotPassword(Request $request)
    {
        $user = User::where('email', '=', $request->email)->firstOrFail();
        $user->password_token = 60;
        if (!$user->save()) {
            return Response::json("An error occured during the process. Please retry later.", 400);
        }
    }

    /**
     * Change user password.
     * @api {put} /v1/users/changePassword UpdateUserPassword
     * @apiGroup Users
     * @apiDescription
     * set the password of a user
     *
     * @apiParam (form) {string} password_token
     * @apiParam (form) {string} password
     * @apiParam (form) {string} password_confirmation
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function changePassword(Request $request)
    {
        $token = $request->passwordToken;
        if (empty($token)) {
            return Response::json("Not Found", 404);
        }

        $user = User::where('password_token', '=', $request->passwordToken)->firstOrFail();
        if (!$user) {
            return Response::json("Not Found", 404);
        }

        if ($request->password == $request->passwordConfirmation) {
            if (User::verifyPasswordStrength($request->password)) {
                $user->password = $request->password;
                $user->password_token = false;
                if (!$user->save()) {
                    return Response::json(['errors'=> $user->getMessages()], 400);
                }
                return Response::json($user);
            } else {
                return Response::json("Missing password requirements", 400);
            }
        } else {
            return Response::json("Passwords didn't match", 400);
        }
    }
}
