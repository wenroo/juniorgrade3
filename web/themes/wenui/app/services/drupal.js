const GRAPHQL_ENDPOINT = '/graphql/words';

/**
 * Service to interact with Drupal GraphQL
 */
export async function graphqlQuery(query, variables = {}) {
    // Check if graphqlQuery is available globally (provided by Drupal)
    if (typeof window.graphqlQuery === 'function') {
        return await window.graphqlQuery(query, variables);
    }

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
