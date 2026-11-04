<?php
/**
 * Plugin Name: OPORA Studio by Heskuchai
 * Description: Інтерактивний демосайт будівельної студії. Шорткод [opora_studio]. Локальний проєкт.
 * Version: 2.1.0
 * Author: Heskuchai
 * Requires PHP: 8.0
 * License: GPL-2.0-or-later
 */
if (!defined('ABSPATH')) { exit; }
function hopora_assets() {
    wp_enqueue_style('heskuchai-opora',plugins_url('assets/style.css',__FILE__),array(),filemtime(__DIR__.'/assets/style.css'));
    wp_enqueue_style('heskuchai-opora-experience',plugins_url('assets/experience.css',__FILE__),array('heskuchai-opora'),filemtime(__DIR__.'/assets/experience.css'));
    wp_enqueue_script('heskuchai-opora-core',plugins_url('assets/core.js',__FILE__),array(),filemtime(__DIR__.'/assets/core.js'),true);
    wp_enqueue_script('heskuchai-opora-motion',plugins_url('assets/motion.js',__FILE__),array('heskuchai-opora-core'),filemtime(__DIR__.'/assets/motion.js'),true);
    wp_enqueue_script('heskuchai-opora',plugins_url('assets/app.js',__FILE__),array('heskuchai-opora-motion'),filemtime(__DIR__.'/assets/app.js'),true);
    wp_enqueue_script('heskuchai-opora-experience',plugins_url('assets/experience.js',__FILE__),array('heskuchai-opora'),filemtime(__DIR__.'/assets/experience.js'),true);
}
add_shortcode('opora_studio',function(){hopora_assets();return file_get_contents(__DIR__.'/view.html');});
add_filter('template_include',function($template){if(is_singular()&&get_post()&&has_shortcode(get_post()->post_content,'opora_studio'))return __DIR__.'/canvas.php';return $template;});
add_filter('document_title',function($title){
    if(is_singular()&&get_post()&&has_shortcode(get_post()->post_content,'opora_studio')){
        return str_replace(array("\u{2013}","\u{2014}",'&#8211;','&#8212;','&ndash;','&mdash;'),'-',$title);
    }
    return $title;
},99);
