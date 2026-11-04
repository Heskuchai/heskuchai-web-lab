<?php if (!defined('ABSPATH')) { exit; } ?>
<!doctype html>
<html <?php language_attributes(); ?>>
<head><meta charset="<?php bloginfo('charset'); ?>"><meta name="viewport" content="width=device-width, initial-scale=1"><?php wp_head(); ?></head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<a class="skip" href="#main">Перейти до вмісту</a>
<header class="header wrap">
 <a class="brand" href="<?php echo esc_url(home_url('/')); ?>" aria-label="На головну"><span class="brand-icon">h.</span><span><?php echo esc_html(get_theme_mod('cocoa_name', 'Heskuchai')); ?><span class="brand-dot">.</span></span></a>
 <button class="menu-toggle" aria-expanded="false" aria-controls="navigation" aria-label="Відкрити меню"><span></span><span></span></button>
 <nav id="navigation" aria-label="Головна навігація"><a href="<?php echo esc_url(home_url('/#about')); ?>">Про мене</a><a href="<?php echo esc_url(home_url('/#projects')); ?>">Проєкти</a><a href="<?php echo esc_url(home_url('/#skills')); ?>">Навички</a></nav>
 <a class="header-contact" href="<?php echo esc_url(get_theme_mod('cocoa_telegram', 'https://t.me/Heskuchai')); ?>" target="_blank" rel="noopener noreferrer">Поговорімо <span>↗</span></a>
</header>
