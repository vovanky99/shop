<?php 

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attributes;
use App\Models\AttributesTranslation;
use App\Models\Languages;
use App\Repositories\GeneralRepository;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AttributesController extends Controller{

    public $general;
    public function __construct(GeneralRepository $general)
    {
        $this->general = $general;
    }
    public function index(Request $request,$language){
        $name = $request->get('name');
        $cat = $request->get('category_id');
        try{
            if($language){
                $lang = $this->general->languages($language);
            }
            else{
                $lang = $this->general->languages('en');
            }
            $attr = DB::table('attributes')->select('attributes.*','attr_tran.name',DB::raw("(select categories_translation.name from categories_translation where categories_translation.category_id = attributes.cat_id and categories_translation.language_id = $lang->id ) as cat_name"))->join('attributes_translation as attr_tran',function($join) use ($name,$lang){
                $join->on('attr_tran.attribute_id','=','attributes.id');
                $join->on('attr_tran.name','like',DB::raw("'$name%'"));
                $join->on('attr_tran.language_id','=',DB::raw("$lang->id"));
            });
            if($cat){
                $attr->where('cat_id',$cat);
            }
            $attrs = $attr->get();
            return response()->json(['attrs'=>$attrs]);
        }
        catch(Exception $e){
            return response()->json($e);
        }
    }
    public function store (Request $request){
        $name_vi = $request->name_vi;
        $name_en = $request->name_en;
        $category = $request->category_id;
        $en = $this->general->languages('en');
        $vi = $this->general->languages('vi');
        try{
            if(count(DB::table('attributes_translation')->where('name',$name_en)->orWhere('name',$name_vi)->join('attributes',function($join)use($category){
                $join->on('attributes_translation.attribute_id','=','attributes.id');
                $join->on('attributes.cat_id','=',DB::raw("$category"));
            })->get()) > 0){
                return response()->json(['error'=>'attr is exist!']);
            }
            $attr = Attributes::create([
                'cat_id'=>$category,
            ]);
            $attr->attributes_translation()->createMany([[
                'name'=>$name_vi,
                'language_id'=>$vi->id
            ],[
                'name'=>$name_en,
                'language_id'=>$en->id,
            ]]);
            return response()->json(['success'=>'create success!']);
        }
        catch(Exception $e){
            return response()->json($e);
        }
    }
    public function show($id,$language){
        try{
            if($language){
                $langId = $this->general->languages($language)->id;
            }
            else{
                $langId = $this->general->languages('en')->id;
            }
            $attr = Attributes::where('id',$id)->with(['category'=>function($query)use($langId) {
                $query->with(['categories_translation'=>function($query)use($langId){
                    $query->where('language_id',$langId);
                }]);    
            },'attributes_translation'])->first();
            return response()->json(['attr'=>$attr]);
         }   
        catch(Exception$e){
            return response()->json($e);
        }
    }
    public function update(Request $request,$id){
        $name_vi = $request->name_vi;
        $name_en = $request->name_en;
        $cat = $request->category_id;
        $en = $this->general->languages('en');
        $vi = $this->general->languages('vi');
        try{
            $attr = $this->Attribute($id)->update([
                'cat_id'=>$cat,
            ]);

            $attr_tran = AttributesTranslation::where('attribute_id',$attr->id)->get();
            foreach($attr_tran as $a){
                if($a->language_id == $en->id){
                    AttributesTranslation::where('id',$a->id)->first()->update([
                        'name'=>$name_en
                    ]);
                }
                if($a->language_id == $vi->id){
                    AttributesTranslation::where('id',$a->id)->first()->update([
                        'name'=>$name_vi
                    ]);
                }
            }
            return response()->json(['success'=>'update success!']);
        }
        catch(Exception $e){
            return response()->json($e);
        }
    }
    public function delete($id){
        try{
            Attributes::find($id)->delete();
            return response()->json(['success'=>'delete success!']);
        }
        catch(Exception $e){
            return response()->json($e);
        }
    }
    public function getAttrsBar(Request $request,$language){
        $name = $request->get('name');
        $attr_id = $request->get('attr_id');
        $cat_id = $request->get('cat_id');
        try{
            if($language){
                $lang_id = $this->general->languages($language)->id;
            }
            else{
                $lang_id = $this->general->languages('en')->id;
            }
            $attr =  DB::table('attributes')->select('attributes.id','attributes_translation.name as name')->join('attributes_translation',function($join)use($name,$lang_id){
                $join->on('attributes_translation.attribute_id','=','attributes.id');
                $join->on('attributes_translation.name','like',DB::raw("'$name%'"));
                $join->on('attributes_translation.language_id','=',DB::raw("$lang_id"));
            });
            if($attr_id){
                $attr->where('id',$attr_id);
            }
            if($cat_id){
                $attr->where('attributes.cat_id',$cat_id);
            }
            $attrs = $attr->get();
            return response()->json(['attrs'=>$attrs]);
        }
        catch(Exception $e){
            return response()->json($e);
        }
    }
    private function Attribute($id){
        return Attributes::where('id',$id)->first();
    }
}