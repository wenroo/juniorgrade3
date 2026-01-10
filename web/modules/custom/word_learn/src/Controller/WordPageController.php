<?php

namespace Drupal\word_learn\Controller;

use Drupal\Core\Controller\ControllerBase;

/**
 * Controller for word pages.
 */
class WordPageController extends ControllerBase {

  /**
   * Words list page.
   *
   * @return array
   *   A render array.
   */
  public function wordsPage(): array {
    return [
      '#theme' => 'word_learn_words_page',
      '#attached' => [
        'library' => [
          'word_learn/words_page',
        ],
      ],
    ];
  }

}
