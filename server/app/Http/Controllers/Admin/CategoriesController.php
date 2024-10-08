<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Models\Categories;
use App\Models\CategoriesTranslation;
use App\Models\Languages;
use Exception;
use Illuminate\Contracts\Database\Eloquent\Builder;
use Kalnoy\Nestedset\QueryBuilder;
use App\Http\Controllers\CloudinaryController;
use App\Repositories\GeneralRepository;

class CategoriesController extends Controller
{

    public $general ;

    public function __construct(GeneralRepository $general)
    {   
        $this->general = $general;
    }

    /* create category */
    public function store(Request $request){
        $name_vi = $request->name_vi;
        $name_en = $request->name_en;
        $parent_id = $request->parent_id;
        $images = $request->images;
        $industryCode = $request->industry_code;
        $slug_vi = Str::slug($name_vi);
        $slug_en = Str::slug($name_en);
        $type = $request->type;

        $checkTitle = CategoriesTranslation::where('name',$name_vi)->orWhere('name',$name_en)->first();
        if(!$checkTitle){
            if($parent_id){
                $parent = $this->Category($parent_id);

                //update _lft for cat
                $updateNode = Categories::where('_lft','>',$parent->_lft)->get();
                if(count($updateNode) >0){
                    foreach($updateNode as $up){
                        $this->Category($up->id)->update([
                            '_lft'=>$this->Category($up->id)->_lft + 2,
                        ]);
                    }
                }

                //update _rgt for cat
                $updateNode = Categories::where('_rgt','>',$parent->_lft)->get();
                if(count($updateNode)>0){
                    foreach($updateNode as $up){
                        $this->Category($up->id)->update([
                            '_rgt'=>$this->Category($up->id)->_rgt + 2,
                        ]);
                    }
                }
                
                $category = Categories::create([
                    '_lft'=> $parent->_lft +1,
                    '_rgt'=> $parent->_lft +2,
                    'type'=>$type,
                    'parent_id'=>$parent_id,
                    'industry_code'=>$industryCode,
                ]);
                $category->categories_translation()->createMany([[
                    'name'=>$name_vi,
                    'slug'=>$slug_vi,
                    'language_id'=>1,
                ],[
                    'name'=>$name_en,
                    'slug'=>$slug_en,
                    'language_id'=>2,
                ]]);
                $image = explode(',',$images);
                foreach($image as $key =>$value){
                    $category->images()->create([
                        'name'=>$value,
                    ]);
                }
                
            }
            else{
                $parent = Categories::orderBy('_rgt','DESC')->first();
                if($parent){
                    $_rgt =  $parent->_rgt;
                }
                else{
                    $_rgt = 0;
                }
                $category = Categories::create([
                    '_lft'=>$_rgt+1,
                    '_rgt'=>$_rgt+2,
                    'type'=>$type,
                    'industry_code'=>$industryCode,
                ]);
                $category->categories_translation()->createMany([[
                    'name'=>$name_vi,
                    'slug'=>$slug_vi,
                    'language_id'=>1,
                ],[
                    'name'=>$name_en,
                    'slug'=>$slug_en,
                    'language_id'=>2,
                ]]);
            }
            return response()->json(['success'=>'created success!']);
        } 
        else{
            return response()->json(['error'=>'category is exists!']);
        }
    }
    /* update category */
    public function update(Request $request,$id){
        $name_en = $request->name_en;
        $name_vi = $request->name_vi;
        $parent_id = $request->parent_id;
        $status = $request->status;
        $images = $request->images;
        $industryCode = $request->industry_code;
        $slug_en = Str::slug($name_en);
        $slug_vi = Str::slug($name_vi);
        $checkTitleEn = CategoriesTranslation::where('name',$name_en)->get();
        $checkTitleVi = CategoriesTranslation::where('name',$name_en)->get();
        $cat = $this->Category($id);
        try{
            foreach($checkTitleEn as $key => $value){
                if($value->category_id &&  $value->category_id != $cat->id){
                    return response()->json(['exist'=>"$name_en is exist in data"],200);
                }
            }

            foreach($checkTitleVi as $key => $value){
                if($value->category_id && $value->category_id != $cat->id){
                    return response()->json(['exist'=>"$name_vi is exist in data"],200);
                }
            }

            /**
             * handle save new images and delete old images for cat
             * 
             * */
            $newImages = [];
            $cat_images = $cat->images;
            foreach($images as $key =>$image){
                if(!in_array($image,(array)$cat_images)){
                    array_push($newImages,$image);
                }
            }
            foreach($cat_images as $key =>$value){
                if(!in_array($value->name,$images)){
                    $this->general->deleteImagesCloudinary($value->name);
                    $value->update([
                        'name'=>array_pop($newImages),
                    ]);
                }
                
            }
             
            /**
             * handle save name for cat
             */
            foreach($cat->categories_translation as $key =>$value){
                $lang = Languages::find($value->language_id);
                if($lang->acronym =='vi'){
                    $value->update([
                        'name'=>$name_vi,
                        'slug'=>$slug_vi,
                    ]);
                }
                else if($lang->acronym =='en'){
                    $value->update([
                        'name'=>$name_en,
                        'slug'=>$slug_en,
                    ]);
                }
            }
            $cat->update([
                'industry_code'=>$industryCode,
                'status'=>$status,
            ]);
        
            $nodeLeft = $cat->_lft;
            $nodeRight = $cat->_rgt;
            $parent = Categories::find($parent_id);
            $catParentOld = Categories::find($cat->parent_id);
            $width = $cat->_rgt - $cat->_lft + 1;

            
            if($catParentOld->_rgt < $parent->_lft){
                $this->Category($parent_id)->update([
                    '_lft'=>$parent->_lft - $width
                ]);
                
                // update cat
                $editCat = $this->Category($id)->update([
                    'parent_id'=>$parent_id,
                    '_lft'=>$parent->_lft + 1,
                    '_rgt'=>$parent->_lft + $width,
                ]);
                
                if(count($editCat->childrens()) !=0){
                    $space =  $parent->_lft - $catParentOld->_rgt + 1;
                    $child = Categories::where([['_lft','>',$nodeLeft],['_rgt','<',$nodeRight],['prent_id',$editCat->id]])->get();
                    foreach($child as $c){
                        $this->Category($c->id)->update([
                            '_lft'=>$this->Category($c->id)->_lft - $space,
                            '_rgt'=>$this->Category($c->id)->_rgt - $space,
                        ]);
                    }
                }

                $oldChild = Categories::where([['_lft','>',$nodeLeft],['_rgt','<',$catParentOld->_rgt]])->get();
                if(count($oldChild) !=0){
                    foreach($oldChild as $d){
                        $this->Category($d->id)->update([
                            '_rgt'=>$this->Category($d->id)->_rgt - $width,
                            '_lft'=>$this->Category($d->id)->_lft - $width
                        ]);
                    }
                }
                $this->Category($catParentOld->id)->update([
                    '_rgt'=>$catParentOld->_rgt - $width
                ]);
            }

            if($parent->_rgt < $catParentOld->_lft){
                $this->Category($parent_id)->update([
                    '_rgt'=>$parent->_rgt + $width
                ]);

               // update cat
               $editCat = $this->Category($id)->update([
                'parent_id'=>$parent_id,
                '_lft'=>$parent->_rgt - 1,
                '_rgt'=>$parent->_rgt - $width,
                ]);
                
                if(count($editCat->childrens()) !=0){
                    $space = $catParentOld->_lft - $parent->_rgt + 1;
                    $child = Categories::where([['_lft','>',$nodeLeft],['_rgt','<',$nodeRight],['parent_id',$editCat->id]])->get();
                    foreach($child as $c){
                        $this->Category($c->id)->update([
                            '_lft'=>$this->Category($c->id)->_lft - $space,
                            '_rgt'=>$this->Category($c->id)->_rgt - $space,
                        ]);
                    }
                }

                $updateNodeSmall = Categories::where([['_lft','>',$catParentOld->_lft],['_lft','<',$nodeLeft],['parent_id',$catParentOld->id]])->get();
                if(count($updateNodeSmall) !=0){
                    foreach($updateNodeSmall as $up){
                        $cat = $this->Category($up->id)->update([
                            '_rgt'=>Categories::find($up->id)->_rgt + $width,
                            '_lft'=>Categories::find($up->id)->_lft + $width,
                        ]);
                    }
                }

                $this->Category($catParentOld->id)->update([
                    '_lft'=>$catParentOld->_lft + $width
                ]);
            }
            if($parent->_lft < $catParentOld->_rgt && $parent->_lft > $catParentOld->_lft){
                if($parent->_lft > $cat->_rgt){
                    $this->Category($parent_id)->update([
                        '_lft'=>$parent->_lft - $width
                    ]);

                   // update cat
                   $editCat = $this->Category($id)->update([
                    'parent_id'=>$parent_id,
                    '_lft'=>$parent->_lft + 1,
                    '_rgt'=>$parent->_lft + $width,
                    ]);
                    
                    if(count($editCat->childrens()) !=0){
                        $space = $catParentOld->_lft - $parent->_rgt + 1;
                        $child = Categories::where([['_lft','>',$nodeLeft],['_rgt','<',$nodeRight],['parent_id',$editCat->id]])->get();
                        foreach($child as $c){
                            $this->Category($c->id)->update([
                                '_lft'=>$this->Category($c->id)->_lft + $space,
                                '_rgt'=>$this->Category($c->id)->_rgt + $space,
                            ]);
                        }
                    }
    
                    $updateNodeSmall = Categories::where([['_rgt','<',$parent->_lft + $width],['_lft','>',$nodeLeft],['parent_id',$catParentOld->id]])->get();
                    if($updateNodeSmall){
                        foreach($updateNodeSmall as $up){
                            $cat = $this->Category($up->id)->update([
                                '_rgt'=>Categories::find($up->id)->_rgt - $width,
                                '_lft'=>Categories::find($up->id)->_lft - $width,
                            ]);
                        }
                    }
                }
                else if($cat->_lft > $parent->_rgt){
                    $this->Category($parent_id)->update([
                        '_lft'=>$parent->_lft + $width
                    ]);

                   // update cat
                   $editCat = $this->Category($id)->update([
                    'parent_id'=>$parent_id,
                    '_lft'=>$parent->rgt - $width,
                    '_rgt'=>$parent->_rgt - 1,
                    ]);
                    
                    if(count($editCat->childrens()) !=0){
                        $space = $catParentOld->_lft - $parent->_rgt + 1;
                        $child = Categories::where([['_lft','>',$nodeLeft],['_rgt','<',$nodeRight],['parent_id',$editCat->id]])->get();
                        foreach($child as $c){
                            $this->Category($c->id)->update([
                                '_lft'=>$this->Category($c->id)->_lft - $space,
                                '_rgt'=>$this->Category($c->id)->_rgt - $space,
                            ]);
                        }
                    }
    
                    $updateNodeSmall = Categories::where([['_rgt','<',$nodeLeft],['_lft','>',$parent->_rgt - $width],['parent_id',$catParentOld->id]])->get();
                    if($updateNodeSmall){
                        foreach($updateNodeSmall as $up){
                            $cat = $this->Category($up->id)->update([
                                '_rgt'=>Categories::find($up->id)->_rgt + $width,
                                '_lft'=>Categories::find($up->id)->_lft + $width,
                            ]);
                        }
                    }
                }
            }
            if($parent->_rgt > $catParentOld->_rgt && $parent->_lft < $catParentOld->_lft){
                $this->Category($catParentOld->id)->update([
                    '_lft'=>$catParentOld->_lft + $width
                ]);

                // update cat
                $editCat = $this->Category($id)->update([
                'parent_id'=>$parent_id,
                '_lft'=>$catParentOld->_lft - $width,
                '_rgt'=>$catParentOld->_lft - 1,
                ]);
                
                if(count($editCat->childrens()) !=0){
                    $space = $catParentOld->_lft - $parent->_rgt + 1;
                    $child = Categories::where([['_lft','>',$nodeLeft],['_rgt','<',$nodeRight],['parent_id',$editCat->id]])->get();
                    foreach($child as $c){
                        $this->Category($c->id)->update([
                            '_lft'=>$this->Category($c->id)->_lft - $space,
                            '_rgt'=>$this->Category($c->id)->_rgt - $space,
                        ]);
                    }
                }

                $updateNodeSmall = Categories::where([['_rgt','>',$catParentOld->_lft - $width],['_lft','<',$nodeLeft],['parent_id',$catParentOld->id]])->get();
                if($updateNodeSmall){
                    foreach($updateNodeSmall as $up){
                        $cat = $this->Category($up->id)->update([
                            '_rgt'=>Categories::find($up->id)->_rgt + $width,
                            '_lft'=>Categories::find($up->id)->_lft + $width,
                        ]);
                    }
                }
            }
            return response()->json(['success'=>"created success!"]);
        }
        catch(Exception $e){
            return response()->json(['error'=>'category is exists!']);
        }
    }

    /* get category */
    public function index(Request $request,$language = 'en'){
        $name = $request->get('name');
        $parent_id = $request->get('parent_id');
        $status = $request->get('status');
        $type = $request->get('type');

        /* check language in db and return lang */
        if(count(Languages::where('acronym',$language)->get()) ==0){
           $language = 'en';
           $lang = Languages::where('acronym',$language)->first();
        }
        else{
            $lang = Languages::where('acronym',$language)->first();
        }

        try{
            $cat = DB::table('categories')->join('categories_translation as cat_trans','cat_trans.category_id','=','categories.id')->join('languages','cat_trans.language_id','=','languages.id')->leftJoin('categories as cat_parent','cat_parent.id','=','categories.parent_id')->where('cat_trans.name','like',$name.'%')->select('categories.*','cat_parent.id as parent_id',DB::raw("(select categories_translation.name from categories_translation where cat_parent.id = categories_translation.category_id and language_id = $lang->id ) as parent_name"),'cat_trans.name as name')->where('cat_trans.language_id',$lang->id);

            if($type){
                $cat->where('categories.type',$type);
            }
            
            if($parent_id){
                $cat->where('categories.parent_id',$parent_id);
            }
            if($status=='1'||$status=='0'){
                $cat->where('categories.status',$status);
            }
            $cats = $cat->get();
            return response()->json(['cats'=>$cats]);
        }
        catch(Exception $e){
            return response()->json(['error'=>'have issue in process data!']);
        }
        
    }

    /**
     * show category
     */
    public function show($id,$language){
        try{
            if(count(Languages::where('acronym',$language)->get()) ==0){
                $lang = Languages::where('acronym','=','en')->first();
             }
             else{
                 $lang = Languages::where('acronym',$language)->first();
             }
                $cat = Categories::where('id',$id)->with(['parent'=>function($query)use($lang){
                    $query->with(['categories_translation'=>function($query) use ($lang){
                        $query->where('language_id',$lang->id);
                    }]);
            },'categories_translation','images'])->first();
            return response()->json(['cat'=>$cat]);
        }
        catch(Exception $e){
            return response()->json(['error'=>'have issue in process data!']);
        }
        
    }
    /**
     * category for search category bar
     * **/
    public function catBar(Request $request,$language){
        $name = $request->get('name');
        $parent_id = $request->get('parent_id');
        /* check language in db and return lang */
        if(count(Languages::where('acronym',$language)->get()) ==0){
            $language = 'en';
            $lang = Languages::where('acronym',$language)->first();
         }
         else{
             $lang = Languages::where('acronym',$language)->first();
         }

         try{
            $cat = DB::table('categories')->join('categories_translation as cat_trans','cat_trans.category_id','=','categories.id')->join('languages','cat_trans.language_id','=','languages.id')->leftJoin('categories as cat_parent','cat_parent.id','=','categories.parent_id')->where('cat_trans.name','like',$name.'%')->select('categories.*','cat_parent.id as parent_id',DB::raw("(select categories_translation.name from categories_translation where cat_parent.id = categories_translation.category_id and language_id = $lang->id ) as parent_name"),'cat_trans.name as name')->where('cat_trans.language_id',$lang->id)->where('categories.type',1);
        
            if($parent_id){
                $cat->where('categories.id',$parent_id);
            }
            
            $cats = $cat->get();
            return response()->json($cats); 
         }
         catch(Exception $e){
            return response()->json(['error'=>'have issue in process data!']);
         }
       
    }

    /**
     * delete category
     */
    public function delete($id){
        try{
            $cat = Categories::find($id);
            if($cat){
                $update = Categories::where('_rgt','>',$cat->_rgt)->where('_lft','>',$cat->_lft)->get();
                $updateParent = Categories::where('_rgt','>',$cat->_rgt)->where('_lft','<',$cat->_lft)->get();
                $TotalNode = $cat->_rgt - $cat->_lft + 1 ;
                // update for same level and lower level
                foreach($update as $up){
                    $c = Categories::find($up->id);
                    $c->_lft -= $TotalNode;
                    $c->_rgt -= $TotalNode;
                    $c->save();
                }
                //update for parent
                foreach($updateParent as $up){
                    $c = Categories::find($up->id);
                    $c->_rgt-=$TotalNode;
                    $c->save();
                }
                $cat->delete();
            }
            return response()->json(['success'=>'deleted success!']);
        }
        catch(Exception $e){
            return response()->json(['error'=>'have issue in process data!']);
        }
    }

    /**
     * use todolist for select 
     */
    public function TodoListCat(){
        $name = request()->get('name');
        $id = request()->get('id');
        try{
            if($id){
                $cat = Categories::whereNotIn('id',$id)->where('name','like','%'.$name.'%')->get();
            }
            else{
                $cat = Categories::where('name','like','%'.$name.'%')->get();
            }
            return response()->json($cat);
        }
        catch(Exception $e){
            return response()->json(['error'=>'have issue in process data!']);
        }
        
    }

    /**
     * get single category 
     */
    private function Category($id){
        return Categories::where('id',$id)->first();
    }
}