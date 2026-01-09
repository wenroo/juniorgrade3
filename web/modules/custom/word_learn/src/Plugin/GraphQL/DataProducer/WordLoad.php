<?php

namespace Drupal\word_learn\Plugin\GraphQL\DataProducer;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\graphql\Plugin\GraphQL\DataProducer\DataProducerPluginBase;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Load a single word by ID.
 *
 * @DataProducer(
 *   id = "word_load",
 *   name = @Translation("Load Word"),
 *   description = @Translation("Load a single word by ID."),
 *   produces = @ContextDefinition("entity:node",
 *     label = @Translation("Word")
 *   ),
 *   consumes = {
 *     "id" = @ContextDefinition("string",
 *       label = @Translation("Word ID")
 *     )
 *   }
 * )
 */
class WordLoad extends DataProducerPluginBase implements ContainerFactoryPluginInterface {

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
   * Resolve the word.
   */
  public function resolve($id) {
    $node = $this->entityTypeManager->getStorage('node')->load($id);
    if ($node && $node->bundle() === 'word') {
      return $node;
    }
    return NULL;
  }

}
