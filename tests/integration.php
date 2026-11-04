<?php
// Run with wp eval-file against a disposable/local WordPress, with both plugins active.
if (!defined('ABSPATH') || !function_exists('hs_stock_table') || !function_exists('hb_table')) { throw new RuntimeException('Activate both plugins first.'); }
global $wpdb;
global $checks;$prefix='TEST_'.strtoupper(bin2hex(random_bytes(4))).'_';$booking_id=0;$checks=0;
function check_case($condition,$message){global $checks;if(!$condition)throw new RuntimeException($message);$checks++;echo "PASS: $message\n";}
function api_call($method,$route,$data=null){$parts=wp_parse_url($route);$request=new WP_REST_Request($method,$parts['path']);if(!empty($parts['query'])){parse_str($parts['query'],$query);$request->set_query_params($query);}if($data!==null){$request->set_header('Content-Type','application/json');$request->set_body(wp_json_encode($data));}return rest_do_request($request);}
try {
 wp_set_current_user(0);
 $r=api_call('GET','/heskuchai-stock/v1/products');check_case(in_array($r->get_status(),array(401,403),true),'anonymous inventory denied');
 $admins=get_users(array('role'=>'administrator','number'=>1));if(!$admins)throw new RuntimeException('No local admin.');wp_set_current_user($admins[0]->ID);
 $product=array('sku'=>$prefix.'A','name'=>'Тестова лампа','category'=>'Тест','price_cents'=>1999,'qty'=>0,'min_qty'=>2);
 $r=api_call('POST','/heskuchai-stock/v1/products',$product);$data=$r->get_data();check_case($r->get_status()===200&&$data['price_cents']===1999&&$data['qty']===0,'create product with exact price and zero stock');$id=$data['id'];
 $r=api_call('POST','/heskuchai-stock/v1/products',$product);check_case($r->get_status()===409,'duplicate SKU rejected');
 $r=api_call('PUT','/heskuchai-stock/v1/products/'.$id,array_merge($product,array('qty'=>7)));check_case($r->get_status()===200&&$r->get_data()['qty']===7,'edit product persists quantity');
 $r=api_call('PUT','/heskuchai-stock/v1/products/'.$id,array_merge($product,array('qty'=>-1)));check_case($r->get_status()===400,'negative stock rejected by server');
 $r=api_call('POST','/heskuchai-stock/v1/products/'.$id.'/archive',array('archived'=>1));check_case($r->get_status()===200,'archive product');
 $r=api_call('POST','/heskuchai-stock/v1/products/'.$id.'/archive',array('archived'=>0));check_case($r->get_status()===200,'restore product');
 $fresh=array_merge($product,array('sku'=>$prefix.'B'));
 $r=api_call('POST','/heskuchai-stock/v1/products/import',array('items'=>array($fresh,$product)));check_case($r->get_status()===409,'import conflict rejects entire transaction');
 check_case(!$wpdb->get_var($wpdb->prepare('SELECT id FROM '.hs_stock_table().' WHERE sku=%s',$fresh['sku'])),'failed import leaves no partial row');
 $r=api_call('POST','/heskuchai-stock/v1/products/import',array('items'=>array($fresh)));check_case($r->get_status()===200,'valid import commits');
 wp_set_current_user(0);
 $date=new DateTimeImmutable('tomorrow',new DateTimeZone('Europe/Kyiv'));while($date->format('w')==='0')$date=$date->modify('+1 day');
 $date=$date->format('Y-m-d');$slots=api_call('GET','/brutal/v1/slots?date='.$date)->get_data();
 check_case(is_array($slots)&&count($slots)>0,'public availability contains time slots only');
 $booking=array('date'=>$date,'time'=>$slots[0],'service'=>'cut','name'=>'INTEGRATION TEST','phone'=>'+380000000000');
 $r=api_call('POST','/brutal/v1/bookings',$booking);$booking_id=(int)$wpdb->get_var($wpdb->prepare('SELECT id FROM '.hb_table().' WHERE slot_key=%s',$date.' '.$slots[0]));if($r->get_status()!==201)echo wp_json_encode(array('status'=>$r->get_status(),'error'=>$r->get_data()))."\n";check_case($r->get_status()===201,'booking is stored');
 $r=api_call('POST','/brutal/v1/bookings',$booking);check_case($r->get_status()===409,'double booking is rejected');
 $r=api_call('GET','/brutal/v1/slots?date='.$date);check_case(!in_array($slots[0],$r->get_data(),true),'occupied slot disappears from availability');
 $r=api_call('POST','/brutal/v1/bookings',array_merge($booking,array('date'=>'2020-01-01')));check_case($r->get_status()===400,'past booking rejected');
 $r=api_call('POST','/brutal/v1/bookings',array_merge($booking,array('phone'=>'bad')));check_case($r->get_status()===400,'invalid phone rejected');
 echo "All $checks integration checks passed.\n";
} finally {
 $wpdb->query($wpdb->prepare('DELETE FROM '.hs_stock_table().' WHERE sku LIKE %s',$wpdb->esc_like($prefix).'%'));
 if($booking_id)$wpdb->delete(hb_table(),array('id'=>$booking_id,'name'=>'INTEGRATION TEST'));
}
