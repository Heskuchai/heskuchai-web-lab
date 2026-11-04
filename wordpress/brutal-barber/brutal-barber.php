<?php
/**
 * Plugin Name: BRUTAL Barber by Heskuchai
 * Description: Демолендинг барбершопа з реальним збереженням заявок. Шорткод [brutal_barber].
 * Version: 1.0.0
 * Author: Heskuchai
 * Requires PHP: 8.0
 * License: GPL-2.0-or-later
 */
if (!defined('ABSPATH')) { exit; }
function hb_table(){ global $wpdb; return $wpdb->prefix.'hs_barber_bookings'; }
register_activation_hook(__FILE__,function(){
 global $wpdb;require_once ABSPATH.'wp-admin/includes/upgrade.php';$table=hb_table();$charset=$wpdb->get_charset_collate();
 dbDelta("CREATE TABLE $table (
  id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  slot_key varchar(32) DEFAULT NULL,
  service varchar(15) NOT NULL,
  name varchar(60) NOT NULL,
  phone varchar(20) NOT NULL,
  status varchar(15) NOT NULL DEFAULT 'pending',
  created_at datetime NOT NULL,
  PRIMARY KEY  (id),
  UNIQUE KEY slot_key (slot_key)
 ) ENGINE=InnoDB $charset;");
});
function hb_error($message,$status=400){return new WP_Error('brutal_error',$message,array('status'=>$status));}
function hb_date_valid($date){
 if(!is_string($date)||!preg_match('/^\d{4}-\d{2}-\d{2}$/D',$date))return false;
 $tz=new DateTimeZone('Europe/Kyiv');$d=DateTimeImmutable::createFromFormat('!Y-m-d',$date,$tz);
 if(!$d||$d->format('Y-m-d')!==$date)return false;
 $today=new DateTimeImmutable('today',$tz);
 return $d>$today&&$d<=$today->modify('+30 days')&&$d->format('w')!=='0';
}
add_action('rest_api_init',function(){
 register_rest_route('brutal/v1','/slots',array('methods'=>'GET','permission_callback'=>'__return_true','callback'=>function($r){
  $date=$r->get_param('date');if(!hb_date_valid($date))return array();global $wpdb;$table=hb_table();
  $used=$wpdb->get_col($wpdb->prepare("SELECT slot_key FROM $table WHERE slot_key LIKE %s",$wpdb->esc_like($date).' %'));
  $slots=array();for($h=10;$h<=18;$h++){$time=$h.':00';if(!in_array($date.' '.$time,$used,true))$slots[]=$time;}return $slots;
 }));
 register_rest_route('brutal/v1','/bookings',array('methods'=>'POST','permission_callback'=>'__return_true','callback'=>'hb_booking'));
});
function hb_booking($r){
 $data=$r->get_json_params();if(!is_array($data))return hb_error('Очікується заявка.');
 foreach(array('date','time','name','phone','service') as $key){if(!isset($data[$key])||!is_string($data[$key]))return hb_error('Заповніть усі поля.');}
 if(!hb_date_valid($data['date'])||!preg_match('/^1[0-8]:00$/D',$data['time'])||!in_array($data['service'],array('cut','beard','combo'),true))return hb_error('Перевірте дату, час та послугу.');
 $name=trim(sanitize_text_field($data['name']));$phone=trim($data['phone']);
 if(mb_strlen($name)<2||mb_strlen($name)>60||!preg_match('/^\+380[0-9]{9}$/D',$phone))return hb_error('Вкажіть ім’я та телефон у форматі +380XXXXXXXXX.');
 $rate_key='hb_rate_'.hash_hmac('sha256',$_SERVER['REMOTE_ADDR']??'local',wp_salt('nonce'));$count=(int)get_transient($rate_key);
 if($count>=5)return hb_error('Забагато заявок. Спробуйте через 15 хвилин.',429);
 global $wpdb;$table=hb_table();$previous=$wpdb->suppress_errors(true);
 $ok=$wpdb->insert($table,array('slot_key'=>$data['date'].' '.$data['time'],'service'=>$data['service'],'name'=>$name,'phone'=>$phone,'created_at'=>current_time('mysql',true)));
 $wpdb->suppress_errors($previous);
 if($ok===false)return hb_error('Цей час уже зайнятий або запис недоступний. Оберіть інший час.',409);
 set_transient($rate_key,$count+1,15*MINUTE_IN_SECONDS);
 return new WP_REST_Response(array('saved'=>true,'date'=>$data['date'],'time'=>$data['time']),201);
}
function hb_assets(){
 wp_enqueue_style('heskuchai-brutal',plugins_url('assets/style.css',__FILE__),array(),'1.0.0');
 wp_enqueue_script('heskuchai-brutal',plugins_url('assets/app.js',__FILE__),array(),'1.0.0',true);
 wp_localize_script('heskuchai-brutal','BrutalConfig',array('assets'=>plugins_url('assets/',__FILE__),'api'=>esc_url_raw(rest_url('brutal/v1')),'nonce'=>wp_create_nonce('wp_rest')));
}
add_shortcode('brutal_barber',function(){hb_assets();return file_get_contents(__DIR__.'/view.html');});
add_filter('template_include',function($template){if(is_singular()&&has_shortcode(get_post()->post_content,'brutal_barber'))return __DIR__.'/canvas.php';return $template;});
add_action('admin_menu',function(){add_menu_page('Записи BRUTAL','BRUTAL · записи','manage_options','hb-bookings','hb_admin','dashicons-calendar-alt',27);});
function hb_admin(){
 if(!current_user_can('manage_options'))return;
 global $wpdb;$rows=$wpdb->get_results('SELECT * FROM '.hb_table().' ORDER BY id DESC LIMIT 200',ARRAY_A);
 echo '<div class="wrap"><h1>BRUTAL · демонстраційні записи</h1><p>Останні 200 заявок. Демопроєкт: SMS та email не надсилаються. Доступ лише для адміністратора.</p><table class="widefat striped"><thead><tr><th>ID</th><th>Час · Київ</th><th>Послуга</th><th>Ім’я</th><th>Телефон</th><th>Стан</th></tr></thead><tbody>';
 foreach($rows as $row){echo '<tr>';foreach(array('id','slot_key','service','name','phone','status') as $key)echo '<td>'.esc_html($row[$key]).'</td>';echo '</tr>';}
 if(!$rows)echo '<tr><td colspan="6">Заявок ще немає.</td></tr>';echo '</tbody></table></div>';
}
