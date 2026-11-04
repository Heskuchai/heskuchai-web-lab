<?php
/**
 * Plugin Name: Stockroom by Heskuchai
 * Description: Облік товарів із REST API, архівом та імпортом CSV. Шорткод [heskuchai_stockroom].
 * Version: 1.0.0
 * Author: Heskuchai
 * Requires PHP: 8.0
 * License: GPL-2.0-or-later
 */
if (!defined('ABSPATH')) { exit; }
function hs_stock_table() { global $wpdb; return $wpdb->prefix . 'hs_stockroom'; }
register_activation_hook(__FILE__, function () {
    global $wpdb;
    require_once ABSPATH . 'wp-admin/includes/upgrade.php';
    $table = hs_stock_table(); $charset = $wpdb->get_charset_collate();
    dbDelta("CREATE TABLE $table (
        id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
        sku varchar(40) NOT NULL,
        name varchar(100) NOT NULL,
        category varchar(50) NOT NULL,
        price_cents bigint(20) unsigned NOT NULL DEFAULT 0,
        qty int(10) unsigned NOT NULL DEFAULT 0,
        min_qty int(10) unsigned NOT NULL DEFAULT 5,
        archived tinyint(1) unsigned NOT NULL DEFAULT 0,
        PRIMARY KEY  (id),
        UNIQUE KEY sku (sku)
    ) ENGINE=InnoDB $charset;");
});
function hs_stock_error($message, $status = 400) { return new WP_Error('stockroom_error', $message, array('status' => $status)); }
function hs_stock_validate($raw) {
    if (!is_array($raw)) { return hs_stock_error('Очікується об’єкт товару.'); }
    $item = array();
    foreach (array('sku', 'name', 'category') as $key) {
        if (!isset($raw[$key]) || !is_string($raw[$key])) { return hs_stock_error('Відсутнє текстове поле: ' . $key); }
        $item[$key] = trim(sanitize_text_field($raw[$key]));
    }
    $item['sku'] = strtoupper($item['sku']);
    if (!preg_match('/^[A-Z0-9_-]{1,40}$/D', $item['sku'])) { return hs_stock_error('Неправильний артикул.'); }
    if (!$item['name'] || mb_strlen($item['name']) > 100 || !$item['category'] || mb_strlen($item['category']) > 50) { return hs_stock_error('Перевірте довжину назви та категорії.'); }
    foreach (array('price_cents' => 999999999, 'qty' => 1000000, 'min_qty' => 1000000) as $key => $max) {
        if (!isset($raw[$key]) || !is_int($raw[$key]) || $raw[$key] < 0 || $raw[$key] > $max) { return hs_stock_error('Неправильне числове поле: ' . $key); }
        $item[$key] = $raw[$key];
    }
    return $item;
}
function hs_stock_row($row) {
    foreach (array('id','price_cents','qty','min_qty','archived') as $key) { $row[$key] = (int) $row[$key]; }
    return $row;
}
function hs_stock_permission() { return current_user_can('manage_options'); }
function hs_stock_save($request) {
    global $wpdb; $table = hs_stock_table(); $id = (int) $request->get_param('id');
    $item = hs_stock_validate($request->get_json_params()); if (is_wp_error($item)) { return $item; }
    if ($id && !$wpdb->get_var($wpdb->prepare("SELECT id FROM $table WHERE id=%d AND archived=0", $id))) { return hs_stock_error('Товар не знайдено.', 404); }
    if ($wpdb->get_var($wpdb->prepare("SELECT id FROM $table WHERE sku=%s AND id<>%d", $item['sku'], $id))) { return hs_stock_error('Артикул уже використовується, можливо, в архіві.', 409); }
    $result = $id ? $wpdb->update($table, $item, array('id'=>$id)) : $wpdb->insert($table, $item);
    if ($result === false) { return hs_stock_error('Не вдалося зберегти товар. Перевірте унікальність артикулу.', 409); }
    $id = $id ?: (int) $wpdb->insert_id;
    return hs_stock_row($wpdb->get_row($wpdb->prepare("SELECT * FROM $table WHERE id=%d", $id), ARRAY_A));
}
function hs_stock_import($request) {
    global $wpdb; $raw = $request->get_json_params(); $items = $raw['items'] ?? null;
    if (!is_array($items) || !count($items) || count($items)>500) { return hs_stock_error('Потрібно від 1 до 500 товарів.'); }
    $valid = array(); $seen = array();
    foreach ($items as $raw_item) {
        $item=hs_stock_validate($raw_item); if (is_wp_error($item)) { return $item; }
        if (isset($seen[$item['sku']])) { return hs_stock_error('Дублікат артикулу: ' . $item['sku']); }
        $seen[$item['sku']] = true; $valid[] = $item;
    }
    $table=hs_stock_table(); $wpdb->query('START TRANSACTION');
    $previous=$wpdb->suppress_errors(true);
    foreach ($valid as $item) {
        if ($wpdb->insert($table,$item) === false) {
            $wpdb->query('ROLLBACK'); $wpdb->suppress_errors($previous);
            return hs_stock_error('Імпорт скасовано. Перевірте артикул: ' . $item['sku'],409);
        }
    }
    $committed=$wpdb->query('COMMIT'); $wpdb->suppress_errors($previous);
    if ($committed===false) { return hs_stock_error('Не вдалося завершити імпорт.',500); }
    return array('imported'=>count($valid));
}
add_action('rest_api_init',function(){
    register_rest_route('heskuchai-stock/v1','/products',array(
        array('methods'=>'GET','permission_callback'=>'hs_stock_permission','callback'=>function(){global $wpdb;return array_map('hs_stock_row',$wpdb->get_results('SELECT * FROM '.hs_stock_table().' ORDER BY id',ARRAY_A));}),
        array('methods'=>'POST','permission_callback'=>'hs_stock_permission','callback'=>'hs_stock_save')
    ));
    register_rest_route('heskuchai-stock/v1','/products/(?P<id>\d+)',array('methods'=>'PUT','permission_callback'=>'hs_stock_permission','callback'=>'hs_stock_save'));
    register_rest_route('heskuchai-stock/v1','/products/import',array('methods'=>'POST','permission_callback'=>'hs_stock_permission','callback'=>'hs_stock_import'));
    register_rest_route('heskuchai-stock/v1','/products/(?P<id>\d+)/archive',array('methods'=>'POST','permission_callback'=>'hs_stock_permission','callback'=>function($request){
        global $wpdb; $raw=$request->get_json_params();$archive=$raw['archived']??null;
        if (!is_int($archive)||!in_array($archive,array(0,1),true)) { return hs_stock_error('Неправильний стан архіву.'); }
        $id=(int)$request['id'];$table=hs_stock_table();
        if (!$wpdb->get_var($wpdb->prepare("SELECT id FROM $table WHERE id=%d",$id))) { return hs_stock_error('Товар не знайдено.',404); }
        if ($wpdb->update($table,array('archived'=>$archive),array('id'=>$id))===false) { return hs_stock_error('Не вдалося змінити стан.',500); }
        return array('id'=>$id,'archived'=>$archive);
    }));
});
function hs_stock_assets() {
    wp_enqueue_style('hs-stockroom',plugins_url('assets/style.css',__FILE__),array(),'1.0.0');
    wp_enqueue_script('hs-stock-core',plugins_url('assets/core.js',__FILE__),array(),'1.0.0',true);
    wp_enqueue_script('hs-stockroom',plugins_url('assets/app.js',__FILE__),array('hs-stock-core'),'1.0.0',true);
    wp_localize_script('hs-stockroom','StockroomConfig',array('api'=>esc_url_raw(rest_url('heskuchai-stock/v1/products')),'nonce'=>wp_create_nonce('wp_rest')));
}
function hs_stock_view() {
    if (!current_user_can('manage_options')) { return '<p>Для доступу до складу <a href="'.esc_url(wp_login_url(get_permalink())).'">увійдіть як адміністратор</a>.</p>'; }
    hs_stock_assets(); return file_get_contents(__DIR__.'/view.html');
}
add_shortcode('heskuchai_stockroom','hs_stock_view');
add_action('admin_menu',function(){add_menu_page('Stockroom','Stockroom','manage_options','hs-stockroom',function(){echo hs_stock_view();},'dashicons-archive',26);});
add_action('admin_enqueue_scripts',function($hook){if($hook==='toplevel_page_hs-stockroom'){hs_stock_assets();}});
add_filter('template_include',function($template){if(is_singular()&&has_shortcode(get_post()->post_content,'heskuchai_stockroom')){return __DIR__.'/canvas.php';}return $template;});
