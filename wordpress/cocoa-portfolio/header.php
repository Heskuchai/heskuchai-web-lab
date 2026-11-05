<?php if (!defined('ABSPATH')) { exit; } ?>
<!doctype html>
<html <?php language_attributes(); ?>>
<head><meta charset="<?php bloginfo('charset'); ?>"><meta name="viewport" content="width=device-width, initial-scale=1"><?php wp_head(); ?></head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<a class="skip" href="#main">Перейти до вмісту</a>
<div class="reading-progress" aria-hidden="true"><span></span></div>
<header class="header wrap">
 <a class="brand" href="<?php echo esc_url(home_url('/')); ?>" aria-label="На головну"><?php echo esc_html(get_theme_mod('cocoa_name', 'Heskuchai')); ?><span> / </span>портфоліо</a>
 <button class="menu-toggle" aria-expanded="false" aria-controls="navigation" aria-label="Відкрити меню"><span></span><span></span></button>
 <nav id="navigation" aria-label="Головна навігація"><a href="#projects">Роботи <sup>05</sup></a><a href="#about">Про мене</a><a href="#contact">Контакти</a></nav>
 <a class="header-github" href="https://github.com/Heskuchai" target="_blank" rel="noopener noreferrer">GitHub ↗</a>
</header>
