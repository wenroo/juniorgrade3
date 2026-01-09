<?php

namespace Drupal\word_learn\Plugin\GraphQL\DataProducer;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\graphql\Plugin\GraphQL\DataProducer\DataProducerPluginBase;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Load random words.
 *
 * @DataProducer(
 *   id = "word_random",
 *   name = @Translation("Random Words"),
 *   description = @Translation("Load random words for practice."),
 *   produces = @ContextDefinition("any",
 *     label = @Translation("Words")
 *   ),
 *   consumes = {
 *     "count" = @ContextDefinition("integer",
 *       label = @Translation("Count"),
 *       required = FALSE
 *     )
 *   }
 * )
 */
class WordRandom extends DataProducerPluginBase implements ContainerFactoryPluginInterface {

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
   * Resolve random words.
   */
  public function resolve($count = 10) {
    // Get all word IDs first.
    $query = $this->entityTypeManager->getStorage('node')->getQuery()
      ->condition('type', 'word')
      ->condition('status', 1)
      ->accessCheck(TRUE);

    $nids = $query->execute();

    if (empty($nids)) {
      return [];
    }

    // Shuffle and pick random ones.
    $nids = array_values($nids);
    shuffle($nids);
    $random_nids = array_slice($nids, 0, $count);

    return $this->entityTypeManager->getStorage('node')->loadMultiple($random_nids);
  }

}
