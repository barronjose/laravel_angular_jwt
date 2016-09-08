<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests;
use DB;
use Response;
use App\Purchase;
use Auth;
use Carbon\Carbon;

class PurchasesController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        try {
            $now = Carbon::now();
            $user = Auth::User();

            $purchase_config = [];
            $purchase_config['user_id'] = $user->id;
            $purchase_config['folio'] = trim($request->folio);
            $purchase_config['ammount'] = trim($request->ammount);
            $purchase_config['branch'] = trim($request->branch);
            $purchase_config['points'] = trim($request->points);
            $purchase_config['photo'] = 'random_string';
            $purchase_config['points'] = 0;

            if ($request->ammount >= 400) {
                $purchase_config['points'] = $request->ammount * .1;
            }

            // Double points for farmaceutical on September 25th
            if ($now->month == 9 && $now->day == 25 && $user->user_type == 2) {
                $purchase_config['points'] = $purchase_config['points'] * 2;
            }

            // Double points for MD on October 23rd
            if ($now->month == 10 && $now->day == 23 && $user->user_type == 1) {
                $purchase_config['points'] = $purchase_config['points'] * 2;
            }

            $purchase = Purchase::create($purchase_config);

            if (!$purchase->save()) {
                DB::rollback();
                return Response::json(['error' => $purchase->getMessages()], 400);
            }
            DB::commit();
        } catch (\Exception $e) {
            DB::rollback();
            return Response::json(['error' => $e->getMessage()], 400);
        }
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $user = Auth::User();

        if ($id != $user->id) {
            return Response::json(['error' => 'Info not allowed'], 400);
        }
        $purchases = Purchase::where('user_id', '=', $user->id)->get();
        return Response::json(['data' => $purchases]);
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }
}
