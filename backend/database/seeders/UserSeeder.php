<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Quản trị viên (Super Admin)
        User::updateOrCreate(
            ['email' => 'huydh6278@gmail.com'],
            [
                'name'     => 'Đỗ Gia Bảo',
                'password' => Hash::make('6278'),
                'role'     => 'admin',
                'status'   => 1,
            ]
        );

        // 2. Quản lý (Manager)
        User::updateOrCreate(
            ['email' => 'dogiabao6278@gmail.com'],
            [
                'name'     => 'Đoàn Nguyễn Thành Công',
                'password' => Hash::make('6278'),
                'role'     => 'manager',
                'status'   => 1,
            ]
        );

        // 3. Khách hàng mẫu (Customer)
        User::updateOrCreate(
            ['email' => 'user@gmail.com'],
            [
                'name'     => 'Khách Hàng Mẫu',
                'password' => Hash::make('123456'),
                'phone'    => '0901234567',
                'address'  => 'Số 123 Đường Lê Lợi, Quận 1, TP.HCM',
                'role'     => 'customer',
                'status'   => 1,
            ]
        );
    }
}
