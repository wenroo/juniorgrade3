<?php

namespace Drupal\word_learn\Plugin\GraphQL\DataProducer;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\graphql\Plugin\GraphQL\DataProducer\DataProducerPluginBase;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Count words.
 *
 * @DataProducer(
 *   id = "word_count",
 *   name = @Translation("Word Count"),
 *   description = @Translation("Count total words."),
 *   produces = @ContextDefinition("integer",
 *     label = @Translation("Count")
 *   ),
 *   consumes = {
 *     "important" = @ContextDefinition("boolean",
 *       label = @Translation("Important only"),
 *       required = FALSE
 *     )
 *   }
 * )
 */
class WordCount extends DataProducerPluginBase implements ContainerFactoryPluginInterface {

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
   * Resolve word count.
   */
  public function resolve($important = NULL) {
    $query = $this->entityTypeManager->getStorage('node')->getQuery()
      ->condition('type', 'word')
      ->condition('status', 1)
      ->accessCheck(TRUE)
      ->count();

    if ($important !== NULL) {
      $query->condition('field_important', $important ? 1 : 0);
    }

    return (int) $query->execute();
  }

}
