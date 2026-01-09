<?php

namespace Drupal\word_learn\Drush\Commands;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\paragraphs\Entity\Paragraph;
use Drush\Attributes as CLI;
use Drush\Commands\AutowireTrait;
use Drush\Commands\DrushCommands;

/**
 * Drush commands for importing words.
 */
final class WordImportCommands extends DrushCommands {

  use AutowireTrait;

  /**
   * Constructs a WordImportCommands object.
   */
  public function __construct(
    protected EntityTypeManagerInterface $entityTypeManager,
  ) {
    parent::__construct();
  }

  /**
   * Import words from JSON file.
   */
  #[CLI\Command(name: 'word:import')]
  #[CLI\Argument(name: 'file', description: 'Path to the words JSON file.')]
  #[CLI\Option(name: 'irregular', description: 'Path to the irregular verbs JSON file.')]
  #[CLI\Option(name: 'limit', description: 'Limit the number of words to import.')]
  #[CLI\Usage(name: 'word:import /path/to/words.json', description: 'Import words from JSON file.')]
  #[CLI\Usage(name: 'word:import /path/to/words.json --irregular=/path/to/irregular.json', description: 'Import words and merge irregular verbs.')]
  public function import(string $file, array $options = ['irregular' => NULL, 'limit' => NULL]) {
    if (!file_exists($file)) {
      $this->logger()->error("File not found: $file");
      return;
    }

    $words_data = json_decode(file_get_contents($file), TRUE);
    if (json_last_error() !== JSON_ERROR_NONE) {
      $this->logger()->error("Invalid JSON in file: $file");
      return;
    }

    // Load irregular verbs if provided.
    $irregular_map = [];
    if ($options['irregular'] && file_exists($options['irregular'])) {
      $irregular_data = json_decode(file_get_contents($options['irregular']), TRUE);
      if (json_last_error() === JSON_ERROR_NONE) {
        foreach ($irregular_data as $item) {
          $irregular_map[$item['word']] = $item;
        }
        $this->logger()->notice("Loaded " . count($irregular_map) . " irregular verbs.");
      }
    }

    $limit = $options['limit'] ? (int) $options['limit'] : NULL;
    $count = 0;
    $skipped = 0;

    $node_storage = $this->entityTypeManager->getStorage('node');

    foreach ($words_data as $word_data) {
      if ($limit && $count >= $limit) {
        break;
      }

      $word = $word_data['word'];

      // Check if word already exists.
      $existing = $node_storage->loadByProperties([
        'type' => 'word',
        'title' => $word,
      ]);

      if (!empty($existing)) {
        $skipped++;
        continue;
      }

      $this->createWordNode($word_data, $irregular_map);
      $count++;

      if ($count % 100 === 0) {
        $this->logger()->notice("Imported $count words...");
      }
    }

    $this->logger()->success("Import complete. Created: $count, Skipped: $skipped");
  }

  /**
   * Create a word node from data.
   */
  protected function createWordNode(array $word_data, array $irregular_map): void {
    $node_storage = $this->entityTypeManager->getStorage('node');

    $node_values = [
      'type' => 'word',
      'title' => $word_data['word'],
      'status' => 1,
      'field_phonetic' => $word_data['phonetic'] ?? '',
      'field_important' => !empty($word_data['important']),
      'field_antonym' => $word_data['antonym'] ?? '',
    ];

    // Add expand words.
    if (!empty($word_data['expand'])) {
      $node_values['field_expand'] = [];
      foreach ($word_data['expand'] as $expand) {
        $node_values['field_expand'][] = ['value' => $expand];
      }
    }

    // Add info body.
    if (!empty($word_data['info']['body'])) {
      $node_values['field_info_body'] = [
        'value' => $word_data['info']['body'],
        'format' => 'basic_html',
      ];
    }

    // Create node first.
    $node = $node_storage->create($node_values);

    // Add translations paragraphs.
    if (!empty($word_data['translations'])) {
      $translations = [];
      foreach ($word_data['translations'] as $trans) {
        $paragraph = Paragraph::create([
          'type' => 'translation',
          'field_word_type' => $trans['type'] ?? '',
          'field_translation' => $trans['translation'] ?? '',
        ]);
        $paragraph->save();
        $translations[] = [
          'target_id' => $paragraph->id(),
          'target_revision_id' => $paragraph->getRevisionId(),
        ];
      }
      $node->set('field_translations', $translations);
    }

    // Add examples paragraphs.
    if (!empty($word_data['examples'])) {
      $examples = [];
      foreach ($word_data['examples'] as $example) {
        $paragraph = Paragraph::create([
          'type' => 'example',
          'field_example_en' => $example['en'] ?? '',
          'field_example_cn' => $example['cn'] ?? '',
        ]);
        $paragraph->save();
        $examples[] = [
          'target_id' => $paragraph->id(),
          'target_revision_id' => $paragraph->getRevisionId(),
        ];
      }
      $node->set('field_examples', $examples);
    }

    // Add phrases paragraphs.
    if (!empty($word_data['phrase'])) {
      $phrases = [];
      foreach ($word_data['phrase'] as $phrase) {
        $paragraph = Paragraph::create([
          'type' => 'phrase',
          'field_phrase_en' => $phrase['en'] ?? '',
          'field_phrase_cn' => $phrase['cn'] ?? '',
        ]);
        $paragraph->save();
        $phrases[] = [
          'target_id' => $paragraph->id(),
          'target_revision_id' => $paragraph->getRevisionId(),
        ];
      }
      $node->set('field_phrases', $phrases);
    }

    // Add info items paragraphs.
    if (!empty($word_data['info']['items'])) {
      $info_items = [];
      foreach ($word_data['info']['items'] as $item) {
        $paragraph = Paragraph::create([
          'type' => 'info_item',
          'field_item_word' => $item['word'] ?? '',
          'field_item_content' => [
            'value' => $item['content'] ?? '',
            'format' => 'basic_html',
          ],
        ]);
        $paragraph->save();
        $info_items[] = [
          'target_id' => $paragraph->id(),
          'target_revision_id' => $paragraph->getRevisionId(),
        ];
      }
      $node->set('field_info_items', $info_items);
    }

    // Add irregular verb paragraph if applicable.
    $word = $word_data['word'];
    if (isset($irregular_map[$word])) {
      $irregular = $irregular_map[$word];
      $paragraph = Paragraph::create([
        'type' => 'irregular_verb',
        'field_past_tense' => $irregular['pasttense']['word'] ?? '',
        'field_past_tense_phonetic' => $irregular['pasttense']['phonetic'] ?? '',
        'field_past_participle' => $irregular['pastparticiple']['word'] ?? '',
        'field_past_participle_phonetic' => $irregular['pastparticiple']['phonetic'] ?? '',
        'field_verb_category' => $irregular['category'] ?? '',
      ]);
      $paragraph->save();
      $node->set('field_irregular_verb', [
        'target_id' => $paragraph->id(),
        'target_revision_id' => $paragraph->getRevisionId(),
      ]);
    }

    $node->save();
  }

  /**
   * Delete all word nodes.
   */
  #[CLI\Command(name: 'word:delete-all')]
  #[CLI\Usage(name: 'word:delete-all', description: 'Delete all word nodes.')]
  public function deleteAll(): void {
    $node_storage = $this->entityTypeManager->getStorage('node');
    $nids = $node_storage->getQuery()
      ->condition('type', 'word')
      ->accessCheck(FALSE)
      ->execute();

    if (empty($nids)) {
      $this->logger()->notice("No word nodes found.");
      return;
    }

    $count = count($nids);
    if (!$this->io()->confirm("Are you sure you want to delete $count word nodes?")) {
      $this->logger()->notice("Cancelled.");
      return;
    }

    // Delete in batches to avoid memory issues.
    $batch_size = 50;
    $batches = array_chunk($nids, $batch_size);
    $deleted = 0;

    foreach ($batches as $batch_nids) {
      $nodes = $node_storage->loadMultiple($batch_nids);
      $node_storage->delete($nodes);
      $deleted += count($batch_nids);
      $this->logger()->notice("Deleted $deleted / $count...");
    }

    $this->logger()->success("Deleted $count word nodes.");
  }

}
