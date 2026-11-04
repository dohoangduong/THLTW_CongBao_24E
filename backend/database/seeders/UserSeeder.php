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
        // 1. Quản trị viên chính (Super Admin)
        User::updateOrCreate(
            ['email' => 'admin@baocong.vn'],
            [
                'name'     => 'Quản Trị Viên Bảo Công',
                'password' => Hash::make('password123'),
                'phone'    => '0988888888',
                'address'  => '123 Đường Ba Tháng Hai, Phường 11, Quận 10, TP.HCM',
                'role'     => 'admin',
                'status'   => 1,
            ]
        );

        // 1.1 Quản trị viên dự phòng (.com & example.com)
        User::updateOrCreate(
            ['email' => 'admin@baocong.com'],
            [
                'name'     => 'Quản Trị Viên Bảo Công (Backup)',
                'password' => Hash::make('password123'),
                'phone'    => '0988888888',
                'address'  => '123 Đường Ba Tháng Hai, Phường 11, Quận 10, TP.HCM',
                'role'     => 'admin',
                'status'   => 1,
            ]
        );

        User::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name'     => 'Quản Trị Viên Hệ Thống',
                'password' => Hash::make('password123'),
                'phone'    => '0977777777',
                'address'  => '456 Đường Cách Mạng Tháng Tám, Quận 3, TP.HCM',
                'role'     => 'admin',
                'status'   => 1,
            ]
        );

        // 2. Tác giả đồ án (Admin)
        User::updateOrCreate(
            ['email' => 'huydh6278@gmail.com'],
            [
                'name'     => 'Đỗ Gia Bảo',
                'password' => Hash::make('password123'),
                'phone'    => '0966666666',
                'address'  => 'TP. Hồ Chí Minh',
                'role'     => 'admin',
                'status'   => 1,
            ]
        );

        // 3. Khách hàng mẫu chính (Customer)
        User::updateOrCreate(
            ['email' => 'khachhang@baocong.vn'],
            [
                'name'     => 'Khách Hàng Thân Thiết',
                'password' => Hash::make('password123'),
                'phone'    => '0901234567',
                'address'  => 'Số 789 Đường Nguyễn Thị Minh Khai, Phường Bến Nghé, Quận 1, TP.HCM',
                'role'     => 'customer',
                'status'   => 1,
            ]
        );

        // 4. Khách hàng mẫu dự phòng
        User::updateOrCreate(
            ['email' => 'user@gmail.com'],
            [
                'name'     => 'Khách Hàng Mẫu',
                'password' => Hash::make('password123'),
                'phone'    => '0901234567',
                'address'  => 'Số 123 Đường Lê Lợi, Quận 1, TP.HCM',
                'role'     => 'customer',
                'status'   => 1,
            ]
        );
    }
}
