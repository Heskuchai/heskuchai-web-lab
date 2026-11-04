<?php
if(!defined('ABSPATH')){exit;}
foreach(array('brutal-barber'=>array('BRUTAL Barber — демопроєкт','[brutal_barber]'),'stockroom'=>array('Stockroom — облік товарів','[heskuchai_stockroom]')) as $slug=>$page){
 $existing=get_page_by_path($slug);if(!$existing){$id=wp_insert_post(array('post_title'=>$page[0],'post_name'=>$slug,'post_content'=>$page[1],'post_type'=>'page','post_status'=>'publish'),true);if(is_wp_error($id))throw new RuntimeException($id->get_error_message());}else{$id=$existing->ID;}
 echo $slug.': '.get_permalink($id)."\n";
}
