<?php

namespace Drupal\word_learn\Plugin\GraphQL\Schema;

use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql\GraphQL\ResolverRegistry;
use Drupal\graphql\Plugin\GraphQL\Schema\SdlSchemaPluginBase;
use Drupal\word_learn\GraphQL\Resolver\WordResolver;

/**
 * @Schema(
 *   id = "word_learn",
 *   name = "Word Learn Schema"
 * )
 */
class WordLearnSchema extends SdlSchemaPluginBase {

  /**
   * {@inheritdoc}
   */
  public function getResolverRegistry(): ResolverRegistry {
    $builder = new ResolverBuilder();
    $registry = new ResolverRegistry();

    $this->addQueryFields($registry, $builder);
    $this->addWordFields($registry, $builder);
    $this->addTranslationFields($registry, $builder);
    $this->addExampleFields($registry, $builder);
    $this->addPhraseFields($registry, $builder);
    $this->addInfoItemFields($registry, $builder);
    $this->addIrregularVerbFields($registry, $builder);

    return $registry;
  }

  /**
   * Add Query fields.
   */
  protected function addQueryFields(ResolverRegistry $registry, ResolverBuilder $builder): void {
    // word(id: ID!): Word
    $registry->addFieldResolver('Query', 'word',
      $builder->produce('word_load')
        ->map('id', $builder->fromArgument('id'))
    );

    // wordByName(name: String!): Word
    $registry->addFieldResolver('Query', 'wordByName',
      $builder->produce('word_by_name')
        ->map('name', $builder->fromArgument('name'))
    );

    // searchWords(keyword: String!, limit: Int): [Word!]!
    $registry->addFieldResolver('Query', 'searchWords',
      $builder->produce('word_search')
        ->map('keyword', $builder->fromArgument('keyword'))
        ->map('limit', $builder->fromArgument('limit'))
    );

    // words(limit: Int, offset: Int, important: Boolean): [Word!]!
    $registry->addFieldResolver('Query', 'words',
      $builder->produce('word_list')
        ->map('limit', $builder->fromArgument('limit'))
        ->map('offset', $builder->fromArgument('offset'))
        ->map('important', $builder->fromArgument('important'))
    );

    // randomWords(count: Int!): [Word!]!
    $registry->addFieldResolver('Query', 'randomWords',
      $builder->produce('word_random')
        ->map('count', $builder->fromArgument('count'))
    );

    // wordsCount(important: Boolean): Int!
    $registry->addFieldResolver('Query', 'wordsCount',
      $builder->produce('word_count')
        ->map('important', $builder->fromArgument('important'))
    );
  }

  /**
   * Add Word type fields.
   */
  protected function addWordFields(ResolverRegistry $registry, ResolverBuilder $builder): void {
    $registry->addFieldResolver('Word', 'id',
      $builder->produce('entity_id')
        ->map('entity', $builder->fromParent())
    );

    $registry->addFieldResolver('Word', 'word',
      $builder->produce('entity_label')
        ->map('entity', $builder->fromParent())
    );

    $registry->addFieldResolver('Word', 'phonetic',
      $builder->produce('property_path')
        ->map('type', $builder->fromValue('entity:node'))
        ->map('value', $builder->fromParent())
        ->map('path', $builder->fromValue('field_phonetic.value'))
    );

    $registry->addFieldResolver('Word', 'important',
      $builder->produce('property_path')
        ->map('type', $builder->fromValue('entity:node'))
        ->map('value', $builder->fromParent())
        ->map('path', $builder->fromValue('field_important.value'))
    );

    $registry->addFieldResolver('Word', 'antonym',
      $builder->produce('property_path')
        ->map('type', $builder->fromValue('entity:node'))
        ->map('value', $builder->fromParent())
        ->map('path', $builder->fromValue('field_antonym.value'))
    );

    $registry->addFieldResolver('Word', 'expand',
      $builder->callback(function ($entity) {
        $values = [];
        foreach ($entity->get('field_expand') as $item) {
          $values[] = $item->value;
        }
        return $values;
      })
    );

    $registry->addFieldResolver('Word', 'infoBody',
      $builder->produce('property_path')
        ->map('type', $builder->fromValue('entity:node'))
        ->map('value', $builder->fromParent())
        ->map('path', $builder->fromValue('field_info_body.value'))
    );

    $registry->addFieldResolver('Word', 'translations',
      $builder->produce('entity_reference_revisions')
        ->map('entity', $builder->fromParent())
        ->map('field', $builder->fromValue('field_translations'))
    );

    $registry->addFieldResolver('Word', 'examples',
      $builder->produce('entity_reference_revisions')
        ->map('entity', $builder->fromParent())
        ->map('field', $builder->fromValue('field_examples'))
    );

    $registry->addFieldResolver('Word', 'phrases',
      $builder->produce('entity_reference_revisions')
        ->map('entity', $builder->fromParent())
        ->map('field', $builder->fromValue('field_phrases'))
    );

    $registry->addFieldResolver('Word', 'infoItems',
      $builder->produce('entity_reference_revisions')
        ->map('entity', $builder->fromParent())
        ->map('field', $builder->fromValue('field_info_items'))
    );

    $registry->addFieldResolver('Word', 'irregularVerb',
      $builder->callback(function ($entity) {
        $field = $entity->get('field_irregular_verb');
        if (!$field->isEmpty()) {
          return $field->entity;
        }
        return NULL;
      })
    );
  }

  /**
   * Add Translation type fields.
   */
  protected function addTranslationFields(ResolverRegistry $registry, ResolverBuilder $builder): void {
    $registry->addFieldResolver('Translation', 'type',
      $builder->produce('property_path')
        ->map('type', $builder->fromValue('entity:paragraph'))
        ->map('value', $builder->fromParent())
        ->map('path', $builder->fromValue('field_word_type.value'))
    );

    $registry->addFieldResolver('Translation', 'translation',
      $builder->produce('property_path')
        ->map('type', $builder->fromValue('entity:paragraph'))
        ->map('value', $builder->fromParent())
        ->map('path', $builder->fromValue('field_translation.value'))
    );
  }

  /**
   * Add Example type fields.
   */
  protected function addExampleFields(ResolverRegistry $registry, ResolverBuilder $builder): void {
    $registry->addFieldResolver('Example', 'en',
      $builder->produce('property_path')
        ->map('type', $builder->fromValue('entity:paragraph'))
        ->map('value', $builder->fromParent())
        ->map('path', $builder->fromValue('field_example_en.value'))
    );

    $registry->addFieldResolver('Example', 'cn',
      $builder->produce('property_path')
        ->map('type', $builder->fromValue('entity:paragraph'))
        ->map('value', $builder->fromParent())
        ->map('path', $builder->fromValue('field_example_cn.value'))
    );
  }

  /**
   * Add Phrase type fields.
   */
  protected function addPhraseFields(ResolverRegistry $registry, ResolverBuilder $builder): void {
    $registry->addFieldResolver('Phrase', 'en',
      $builder->produce('property_path')
        ->map('type', $builder->fromValue('entity:paragraph'))
        ->map('value', $builder->fromParent())
        ->map('path', $builder->fromValue('field_phrase_en.value'))
    );

    $registry->addFieldResolver('Phrase', 'cn',
      $builder->produce('property_path')
        ->map('type', $builder->fromValue('entity:paragraph'))
        ->map('value', $builder->fromParent())
        ->map('path', $builder->fromValue('field_phrase_cn.value'))
    );
  }

  /**
   * Add InfoItem type fields.
   */
  protected function addInfoItemFields(ResolverRegistry $registry, ResolverBuilder $builder): void {
    $registry->addFieldResolver('InfoItem', 'word',
      $builder->produce('property_path')
        ->map('type', $builder->fromValue('entity:paragraph'))
        ->map('value', $builder->fromParent())
        ->map('path', $builder->fromValue('field_item_word.value'))
    );

    $registry->addFieldResolver('InfoItem', 'content',
      $builder->produce('property_path')
        ->map('type', $builder->fromValue('entity:paragraph'))
        ->map('value', $builder->fromParent())
        ->map('path', $builder->fromValue('field_item_content.value'))
    );
  }

  /**
   * Add IrregularVerb type fields.
   */
  protected function addIrregularVerbFields(ResolverRegistry $registry, ResolverBuilder $builder): void {
    $registry->addFieldResolver('IrregularVerb', 'pastTense',
      $builder->produce('property_path')
        ->map('type', $builder->fromValue('entity:paragraph'))
        ->map('value', $builder->fromParent())
        ->map('path', $builder->fromValue('field_past_tense.value'))
    );

    $registry->addFieldResolver('IrregularVerb', 'pastTensePhonetic',
      $builder->produce('property_path')
        ->map('type', $builder->fromValue('entity:paragraph'))
        ->map('value', $builder->fromParent())
        ->map('path', $builder->fromValue('field_past_tense_phonetic.value'))
    );

    $registry->addFieldResolver('IrregularVerb', 'pastParticiple',
      $builder->produce('property_path')
        ->map('type', $builder->fromValue('entity:paragraph'))
        ->map('value', $builder->fromParent())
        ->map('path', $builder->fromValue('field_past_participle.value'))
    );

    $registry->addFieldResolver('IrregularVerb', 'pastParticiplePhonetic',
      $builder->produce('property_path')
        ->map('type', $builder->fromValue('entity:paragraph'))
        ->map('value', $builder->fromParent())
        ->map('path', $builder->fromValue('field_past_participle_phonetic.value'))
    );

    $registry->addFieldResolver('IrregularVerb', 'category',
      $builder->produce('property_path')
        ->map('type', $builder->fromValue('entity:paragraph'))
        ->map('value', $builder->fromParent())
        ->map('path', $builder->fromValue('field_verb_category.value'))
    );
  }

}
