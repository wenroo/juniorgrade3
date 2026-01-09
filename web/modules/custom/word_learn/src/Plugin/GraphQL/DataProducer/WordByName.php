<?php

namespace Drupal\word_learn\Plugin\GraphQL\DataProducer;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\graphql\Plugin\GraphQL\DataProducer\DataProducerPluginBase;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Load a word by exact name match.
 *
 * @DataProducer(
 *   id = "word_by_name",
 *   name = @Translation("Word By Name"),
 *   description = @Translation("Load a word by exact name match."),
 *   produces = @ContextDefinition("entity:node",
 *     label = @Translation("Word")
 *   ),
 *   consumes = {
 *     "name" = @ContextDefinition("string",
 *       label = @Translation("Word name")
 *     )
 *   }
 * )
 */
class WordByName extends DataProducerPluginBase implements ContainerFactoryPluginInterface {

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
   * Resolve the word by name.
   */
  public function resolve($name) {
    $nodes = $this->entityTypeManager->getStorage('node')->loadByProperties([
      'type' => 'word',
      'title' => $name,
      'status' => 1,
    ]);

    if (!empty($nodes)) {
      return reset($nodes);
    }

    return NULL;
  }

}
