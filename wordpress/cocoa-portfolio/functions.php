<?php
/** Cocoa Portfolio theme. */
if (!defined('ABSPATH')) { exit; }
add_action('after_setup_theme', function () {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('html5', array('search-form', 'gallery', 'caption', 'style', 'script'));
});
add_action('wp_enqueue_scripts', function () {
    wp_enqueue_style('cocoa', get_stylesheet_uri(), array(), '1.3.0');
    wp_enqueue_script('cocoa', get_template_directory_uri() . '/script.js', array(), '1.3.0', true);
    wp_localize_script('cocoa', 'CocoaProjects', array('base' => 'https://heskuchai.github.io/heskuchai-web-lab/'));
});
add_action('customize_register', function ($customizer) {
    $customizer->add_section('cocoa_profile', array('title' => 'Портфоліо Heskuchai', 'priority' => 30));
    $fields = array(
        'name' => array('Ім’я / псевдонім', 'Heskuchai', 'sanitize_text_field'),
        'specialty' => array('Спеціальність', 'Computer Science 122', 'sanitize_text_field'),
        'intro' => array('Опис на першому екрані', 'Від ідеї до коду. Вивчаю комп’ютерні науки та створюю цифрові речі з увагою до деталей.', 'sanitize_textarea_field'),
        'telegram' => array('Посилання Telegram', 'https://t.me/Heskuchai', 'esc_url_raw'),
    );
    foreach ($fields as $key => $field) {
        $customizer->add_setting('cocoa_' . $key, array('default' => $field[1], 'sanitize_callback' => $field[2]));
        $customizer->add_control('cocoa_' . $key, array('section' => 'cocoa_profile', 'label' => $field[0], 'type' => $key === 'intro' ? 'textarea' : ($key === 'telegram' ? 'url' : 'text')));
    }
});
