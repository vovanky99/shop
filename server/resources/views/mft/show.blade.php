@extends('header')


@section('main_content')
<section id="main-content" class="col-10">
    <div class="content-wrapper d-flex">
        <div class="mb-3 col-6 fs-4 text-capitalize" >    
            <h3>
                <?php echo "manuf detail" ?>
            </h3>
            {!! Form::open(['method'=>'GET','route'=>['mft.index']]) !!}
            @csrf
                <button type="submit" class="btn lz-btn-outline-primary mb-3">Manuf All</button>
            {!! Form::close() !!}
            <div class="mb-3">
                {!! Form::label('profile_name','name :',['class'=>'form-label']) !!}
                {!! Form::text('name',$mft->name.'',['class'=>'form-control','disabled'] ) !!}
            </div>
            <div class="mb-3">
                {!! Form::label('profile_avatar','Avatar :',['class'=>'form-label']) !!}
                {!! Html::image(asset('upload/images/manuf').'/'.$mft->logo,'avatar',['class'=>'rounded avatar_users','disabled','alt'=>$mft->logo.'']) !!}
            </div>
            <div class="mb-3">
                {!! Form::label('profile_username','descriptions: ',['class'=>'form-label']) !!}
                {!! Form::textarea('descriptions',$mft->descriptions.'',['class'=>'form-control','disabled'] ) !!}
            </div>
            <div class="mb-3">
                {!! Form::open(['method'=>'GET','route'=>['mft.edit',$mft->id]]) !!}
                @csrf
                <button class="btn lz-btn-outline-primary text-capitalize fs-5" >Edit</button>
                {!! Form::close() !!}
            </div>
        </div>
    </div>
</section>
@endsection