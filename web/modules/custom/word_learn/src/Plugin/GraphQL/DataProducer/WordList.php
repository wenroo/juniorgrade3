<?php

namespace Drupal\word_learn\Plugin\GraphQL\DataProducer;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\graphql\Plugin\GraphQL\DataProducer\DataProducerPluginBase;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Load a list of words.
 *
 * @DataProducer(
 *   id = "word_list",
 *   name = @Translation("Word List"),
 *   description = @Translation("Load a list of words."),
 *   produces = @ContextDefinition("any",
 *     label = @Translation("Words")
 *   ),
 *   consumes = {
 *     "limit" = @ContextDefinition("integer",
 *       label = @Translation("Limit"),
 *       required = FALSE
 *     ),
 *     "offset" = @ContextDefinition("integer",
 *       label = @Translation("Offset"),
 *       required = FALSE
 *     ),
 *     "important" = @ContextDefinition("boolean",
 *       label = @Translation("Important only"),
 *       required = FALSE
 *     )
 *   }
 * )
 */
class WordList extends DataProducerPluginBase implements ContainerFactoryPluginInterface {

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
   * Resolve the word list.
   */
  public function resolve($limit = 20, $offset = 0, $important = NULL) {
    $query = $this->entityTypeManager->getStorage('node')->getQuery()
      ->condition('type', 'word')
      ->condition('status', 1)
      ->accessCheck(TRUE)
      ->sort('title', 'ASC');

    if ($important !== NULL) {
      $query->condition('field_important', $important ? 1 : 0);
    }

    if ($limit) {
      $query->range($offset ?? 0, $limit);
    }

    $nids = $query->execute();
    return $this->entityTypeManager->getStorage('node')->loadMultiple($nids);
  }

}
