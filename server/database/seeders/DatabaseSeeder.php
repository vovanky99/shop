<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;

use App\Models\AddressUsers;
use Illuminate\Database\Seeder;
use \App\Models\Role;
use \App\Models\User;
use \App\Models\Categories;
use \App\Models\Shop;
use \App\Models\ProductsType;
use \App\Models\Manufacturer;
use \App\Models\Slide;
use \App\Models\Voucher;
use \App\Models\Payment;
use \App\Models\Blogs;
use App\Models\City;
use App\Models\Images;
use \App\Models\Products;
use App\Models\ProductsTypeDetail;
use \App\Models\Reviews;
use \App\Models\Cod;
use App\Models\District;
use App\Models\Momo;
use App\Models\National;
use App\Models\Order;
use App\Models\OrderProducts;
use App\Models\StreetAddress;
use App\Models\Ward;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;


class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        
        /*cat seeder data*/
    
        $data =  array(
            array('id' => 1, 'title' => 'store','slug'=>'store','status'=>1, '_lft' => 1, '_rgt' => 20, 'parent_id' => null),
                array('id' => 2, 'title' => 'notebooks','slug'=>'notebooks','status'=>1, '_lft' => 2, '_rgt' => 7, 'parent_id' => 1),
                    array('id' => 3, 'title' => 'lenovo','slug'=>'lenovo','status'=>1, '_lft' => 5, '_rgt' => 6, 'parent_id' => 2),
                array('id' => 4, 'title' => 'mobile','slug'=>'mobile','status'=>1, '_lft' => 8, '_rgt' => 19, 'parent_id' => 1),
                    array('id' => 5, 'title' => 'nokia','slug'=>'nokia','status'=>1, '_lft' => 9, '_rgt' => 10, 'parent_id' => 2),
                    array('id' => 6, 'title' => 'samsung','slug'=>'samsung','status'=>1, '_lft' => 11, '_rgt' => 14, 'parent_id' => 2),
                        array('id' => 7, 'title' => 'galaxy','slug'=>'galaxy','status'=>1, '_lft' => 12, '_rgt' => 13, 'parent_id' => 2),
                    array('id' => 8, 'title' => 'sony','slug'=>'sony','status'=>1, '_lft' => 15, '_rgt' => 16, 'parent_id' => 2),
                    array('id' => 9, 'title' => 'lenovo1','slug'=>'lenovo1','status'=>1, '_lft' => 17, '_rgt' => 18, 'parent_id' => 2),
            array('id' => 10, 'title' => 'store_3','slug'=>'store_3','status'=>1, '_lft' => 21, '_rgt' => 22, 'parent_id' => null),
            array('id' => 11, 'title' => 'store_4','slug'=>'store_4','status'=>1, '_lft' => 23, '_rgt' => 24, 'parent_id' => null),
             array('id' => 12, 'title' => 'store_5','slug'=>'store_5','status'=>1, '_lft' => 25, '_rgt' => 26, 'parent_id' => null), 
             array('id' => 13, 'title' => 'store_6','slug'=>'store_6','status'=>1, '_lft' => 27, '_rgt' => 28, 'parent_id' => null),
              array('id' => 14, 'title' => 'store_7','slug'=>'store_7','status'=>1, '_lft' => 29, '_rgt' => 30, 'parent_id' => null),
              array('id' => 15, 'title' => 'store_8','slug'=>'store_8','status'=>1, '_lft' => 31, '_rgt' => 32, 'parent_id' => null),
        );
        DB::table('categories')->insert($data);
        Role::factory()->count(100)->create();
        $users = array(
            array('name'=>'maihoangha','username'=>'maihoangha','email'=>'maihoangha@gmail.com','password'=>Hash::make('123456789'),'phone_number'=>'0123456789','avatar'=>'dasde','level'=>1,'status'=>'1','gender'=>1,'birthday'=>'','address'=>'','role_id'=>1),
            array('name'=>'maihoanghanh','username'=>'maihoanghanh','email'=>'maihoangha','password'=>Hash::make('123456789'),'phone_number'=>'3','avatar'=>'dasde','level'=>1,'status'=>'1','gender'=>1,'birthday'=>'','address'=>'','role_id'=>2),
        );
        DB::table('users')->insert($users);
        
        /*seeder factory */
       
        // Categories::factory()->count(100)->create();
        User::factory()->count(100)->create();
        National::factory()->count(50)->create();
        City::factory()->count(100)->create();
        District::factory()->count(200)->create();
        Ward::factory()->count(400)->create();
        StreetAddress::factory()->count(50)->create();
        Shop::factory()->count(100)->create();
        ProductsType::factory()->count(100)->create();
        Manufacturer::factory()->count(100)->create();
        Voucher::factory()->count(100)->create();
        Blogs::factory()->count(1000)->create();
        Slide::factory()->count(100)->create();
        Cod::factory()->count(1000)->create();
        Momo::factory()->count(1000)->create();
        Payment::factory()->count(100)->create();
        Products::factory()->count(5000)->create();
        Reviews::factory()->count(1000)->create();
        ProductsTypeDetail::factory()->count(100)->create();
        Images::factory()->count(1000)->create();
        Order::factory()->count(1000)->create();
        OrderProducts::factory()->count(1000)->create();
        AddressUsers::factory()->count(100)->create();
    }
}