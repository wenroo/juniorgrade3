<?php

namespace Drupal\word_learn\Plugin\GraphQL\DataProducer;

use Drupal\Core\Entity\EntityInterface;
use Drupal\graphql\Plugin\GraphQL\DataProducer\DataProducerPluginBase;

/**
 * Get entity reference revisions field values.
 *
 * @DataProducer(
 *   id = "entity_reference_revisions",
 *   name = @Translation("Entity Reference Revisions"),
 *   description = @Translation("Get paragraph entities from a field."),
 *   produces = @ContextDefinition("any",
 *     label = @Translation("Paragraphs")
 *   ),
 *   consumes = {
 *     "entity" = @ContextDefinition("entity",
 *       label = @Translation("Entity")
 *     ),
 *     "field" = @ContextDefinition("string",
 *       label = @Translation("Field name")
 *     )
 *   }
 * )
 */
class EntityReferenceRevisions extends DataProducerPluginBase {

  /**
   * Resolve the paragraphs.
   */
  public function resolve(EntityInterface $entity, string $field) {
    if (!$entity->hasField($field)) {
      return [];
    }

    $field_value = $entity->get($field);
    if ($field_value->isEmpty()) {
      return [];
    }

    return $field_value->referencedEntities();
  }

}
