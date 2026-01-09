<?php

namespace Drupal\word_learn\Plugin\GraphQL\DataProducer;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\graphql\Plugin\GraphQL\DataProducer\DataProducerPluginBase;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Search words by keyword.
 *
 * @DataProducer(
 *   id = "word_search",
 *   name = @Translation("Search Words"),
 *   description = @Translation("Search words by keyword (fuzzy match)."),
 *   produces = @ContextDefinition("any",
 *     label = @Translation("Words")
 *   ),
 *   consumes = {
 *     "keyword" = @ContextDefinition("string",
 *       label = @Translation("Search keyword")
 *     ),
 *     "limit" = @ContextDefinition("integer",
 *       label = @Translation("Limit"),
 *       required = FALSE
 *     )
 *   }
 * )
 */
class WordSearch extends DataProducerPluginBase implements ContainerFactoryPluginInterface {

  /**
   * The entity type manager.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    $instance = new static($configuration, $plugin_id, $plugin_definition);
    $instance->entityTypeManager = $container->get('entity_type.manager');
    return $instance;
  }

  /**
   * Resolve search.
   */
  public function resolve($keyword, $limit = 20) {
    $query = $this->entityTypeManager->getStorage('node')->getQuery()
      ->condition('type', 'word')
      ->condition('status', 1)
      ->condition('title', $keyword, 'CONTAINS')
      ->accessCheck(TRUE)
      ->sort('title', 'ASC')
      ->range(0, $limit);

    $nids = $query->execute();

    if (empty($nids)) {
      return [];
    }

    return $this->entityTypeManager->getStorage('node')->loadMultiple($nids);
  }

}
