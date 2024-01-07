<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules() : array
    {
        return [
            'username'=>'bail|required',
            'password'=>'bail|required'
        ];
    }
    public function message(){
        return[
            'username.required'=>'Please enter username',
            'password.required'=>'Please enter password'
        ];
    }
}