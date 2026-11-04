<?php
if (!defined('ABSPATH')) { exit; }
get_header();
?>
<main id="main" class="content-page">
<?php if (have_posts()) : while (have_posts()) : the_post(); ?>
<article><h1><?php the_title(); ?></h1><?php the_content(); ?></article>
<?php endwhile; the_posts_pagination(); else : ?>
<h1>Поки що тут тихо</h1><p>Нові записи незабаром з’являться.</p>
<?php endif; ?>
</main>
<?php get_footer(); ?>
