(function () {
  'use strict';

  const GRAPHQL_ENDPOINT = '/graphql/words';

  // GraphQL query helper
  async function graphqlQuery(query, variables = {}) {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    });
    const result = await response.json();
    if (result.errors) {
      console.error('GraphQL errors:', result.errors);
      throw new Error(result.errors[0].message);
    }
    return result.data;
  }

  // Render a single word card
  function renderWordCard(word) {
    const translations = word.translations
      .map(t => `<div class="word-card__translation"><span class="word-card__type">${t.type}</span>${t.translation}</div>`)
      .join('');

    return `
      <div class="word-card" data-id="${word.id}">
        <div class="word-card__title">${word.word}</div>
        <div class="word-card__phonetic">${word.phonetic || ''}</div>
        <div class="word-card__translations">${translations}</div>
      </div>
    `;
  }

  // Load words
  async function loadWords(keyword = '') {
    const container = document.getElementById('word-cards');
    const loading = document.getElementById('loading');

    loading.style.display = 'block';
    container.innerHTML = '';

    try {
      let data;
      if (keyword) {
        data = await graphqlQuery(`
          query SearchWords($keyword: String!) {
            searchWords(keyword: $keyword, limit: 50) {
              id
              word
              phonetic
              translations {
                type
                translation
              }
            }
          }
        `, { keyword });
        container.innerHTML = data.searchWords.map(renderWordCard).join('');
      } else {
        data = await graphqlQuery(`
          query GetWords {
            words(limit: 50) {
              id
              word
              phonetic
              translations {
                type
                translation
              }
            }
          }
        `);
        container.innerHTML = data.words.map(renderWordCard).join('');
      }
    } catch (error) {
      container.innerHTML = `<div class="error">加载失败: ${error.message}</div>`;
    } finally {
      loading.style.display = 'none';
    }
  }

  // Initialize
  document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('word-search');

    // Load initial words
    loadWords();

    // Search with debounce
    let debounceTimer;
    searchInput.addEventListener('input', function (e) {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        loadWords(e.target.value.trim());
      }, 300);
    });
  });

})();
