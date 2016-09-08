<?php

use Illuminate\Database\Seeder;
use Illuminate\Database\Eloquent\Model;
use App\User;

class DatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Model::unguard();
        DB::table('users')->delete();
        $users = array(
                ['name' => 'Super Admin', 'email' => 'admin@mail.com', 'password' => Hash::make('secret'), 'user_type' => 0, 'user_number' => 'ADMIN'],
                ['name' => 'Ryan Chenkie', 'email' => 'ryanchenkie@gmail.com', 'password' => Hash::make('secret'), 'user_type' => 1, 'user_number' => 'QWERT'],
                ['name' => 'Chris Sevilleja', 'email' => 'chris@scotch.io', 'password' => Hash::make('secret'), 'user_type' => 2, 'user_number' => 'ASDFG'],
                ['name' => 'Holly Lloyd', 'email' => 'holly@scotch.io', 'password' => Hash::make('secret'), 'user_type' => 3, 'user_number' => 'ZXCVB'],
                ['name' => 'Adnan Kukic', 'email' => 'adnan@scotch.io', 'password' => Hash::make('secret'), 'user_type' => 4, 'user_number' => 'SWERT'],
        );

        // Loop through each user above and create the record for them in the database
        foreach ($users as $user)
        {
            User::create($user);
        }
        Model::reguard();
    }
}
