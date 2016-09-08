<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Purchase extends Model
{
    /**
     * The database table used by the model.
     *
     * @var string
     */
    protected $table = 'purchases';

    /**
     * Tables fields that can be modified.
     *
     * @var string
     */
    protected $fillable = [
        'user_id',
        'folio',
        'ammount',
        'branch',
        'points',
        'photo'
    ];

    /**
     * Disable timestamps.
     *
     * @var bool
     */
    public $timestamps = false;

    /**
     * List of validators to apply
     *
     * @var array
     */
    // protected $validationRules = [
    //     'user_id'   => 'numeric',
    //     'folio'     => 'required|string|max:200',
    //     'ammount'   => 'string|url|max:2000',
    //     'branch'    => 'required|string|max:24',
    //     'photo'     => 'string'
    // ];

    public function user()
    {
        return $this->belongsTo('App\User', 'id');
    }
}
