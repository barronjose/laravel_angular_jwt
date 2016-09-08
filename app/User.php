<?php

namespace App;

use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name', 'email', 'password', 'user_type', 'user_number'
    ];


    /**
     * The attributes excluded from the model's JSON form.
     *
     * @var array
     */
    protected $hidden = [
        'password', 'remember_token', 'password_token'
    ];

    const PASSWORDREGEXP = '/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d$@$!%*?&,.-_+#~|°{}()\/\ ]{8,}$/';

    public function purchases()
    {
        return $this->hasMany('App\Purchase', 'user_id');
    }

    public function generatePasswordToken($length = 20)
    {
        $token = $this->generateRandomString($length);
        $existent = User::where('password_token', '=', $token)->first();
        if ($existent != null) {
            $token = $this->generatePasswordToken($length);
        }

        return $token;
    }

    public static function generateRandomString($length = 10)
    {
        $length = (!is_int($length)) ? 10 : $length;
        $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $charactersLength = strlen($characters);
        $randomString = '';
        for ($i = 0; $i < $length; $i++) {
            $randomString .= $characters[rand(0, $charactersLength - 1)];
        }
        return $randomString;
    }

    public static function verifyPasswordStrength($password)
    {
        return (preg_match(self::PASSWORDREGEXP, $password) === 1);
    }

    // /**
    //  * encrypt the password when it's set
    //  *
    //  * @var $password String unencrypted password
    //  * @return null
    //  */
    // public function setPasswordAttribute($password)
    // {
    //     if (preg_match(self::PASSWORDREGEXP, $password)) {
    //         $this->attributes['password'] = \Hash::make($password);
    //         $this->attributes['password_token'] = null;
    //     }
    // }

    /**
     * set the password token and have a consequence on the password field.
     * This was done by using bycript, however there's no real reason for this, and its causing an issue with some
     * tokens, as it is no URL friendly, so it will be set randomly with a validation to avoid repeated tokens.
     *
     *
     * @var $password_token String
     * @return null
     */
    public function setPasswordTokenAttribute($password_token)
    {
        if (!empty($password_token)) {
            $this->attributes['password_token'] = $this->generatePasswordToken($password_token);
        } else {
            $this->attributes['password_token'] = null;
        }
    }
}
