import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

/**
 * Performs a complete search operation using LLMs to generate queries and then executing the search.
 * Returns organized and raw results as a structured text for further processing.
 * @param userRequest - The user's initial request or topic.
 * @returns A structured textual summary of all queries and their results.
 */
export async function completeSearch(userRequest: string): Promise<string> {
  // Define the schema for the queries
  const querySchema = z.object({
    queries: z.array(z.string()),
  });

  // Nouveau schéma pour refléter la structure souhaitée : une liste d'objets
  // avec Titre, Source et Content.
  const organizedResultSchema = z.object({
    organizedResults: z.array(z.object({
      Titre: z.string(),
      Source: z.string(),
      Content: z.string(),
    }))
  });

  const prompt = `Générez 3 requêtes diverses pour le sujet : ${userRequest}`;

  // Generate structured data using generateObject
  const result = await generateObject({
    model: openai('gpt-4-turbo'),
    schema: querySchema,
    prompt: prompt,
  });

  // Validate the generated object
  const parsedResponse = querySchema.safeParse(result.object);
  if (!parsedResponse.success) {
    throw new Error('Invalid response format from LLM');
  }

  // Extract the queries from the validated response
  const queries = parsedResponse.data.queries;

  let structuredText = `Résultats de recherche pour le sujet : "${userRequest}"\n\n`;

  for (const query of queries) {
    structuredText += `Requête : "${query}"\n`;

    // Perform the search using Tavily API
    const searchResults = await performSearch(query);

    // Inclure le contenu brut
    structuredText += `Résultats bruts :\n${JSON.stringify(searchResults, null, 2)}\n`;

    // Organize the results using the LLM
    const organizationPrompt = `
Organisez les résultats de recherche suivants dans un format JSON structuré.
Veuillez renvoyer un objet JSON avec une propriété "organizedResults" qui est un tableau d'objets.
Chaque objet doit avoir :
- "Titre" (le titre du résultat de recherche),
- "Source" (l'URL ou la référence de la source),
- "Contenu" (un résumé synthétisé du contenu brut).

Résultats de recherche bruts :
${JSON.stringify(searchResults)}
    `.trim();

    const organizedResult = await generateObject({
      model: openai('gpt-4-turbo'),
      schema: organizedResultSchema,
      prompt: organizationPrompt,
    });

    // Validate the organized result
    const parsedOrganizedResult = organizedResultSchema.safeParse(organizedResult.object);
    if (!parsedOrganizedResult.success) {
      console.error('Invalid organized result format from LLM:', organizedResult);
      throw new Error('Invalid organized result format from LLM');
    }

    // Ensure organizedResults is defined and is an array
    const organizedResults = parsedOrganizedResult.data.organizedResults || []; // Default to an empty array if undefined

    if (!Array.isArray(organizedResults)) {
      console.error('Expected organizedResults to be an array, but got:', organizedResults);
      throw new Error('Invalid organized result format from LLM');
    }

    // Check if organizedResults is empty
    if (organizedResults.length === 0) {
      console.error('Aucun résultat de recherche trouvé pour la requête :', query);
      structuredText += `\nAucun résultat de recherche trouvé pour la requête : ${query}\n`;
    } else {
      // Now you can safely iterate over organizedResults
      for (const { Titre, Source, Content } of organizedResults) {
        // Check if required properties are present
        if (!Titre || !Source || !Content) {
          console.error('Invalid organized result format: missing required properties', { Titre, Source, Content });
          throw new Error('Invalid organized result format: missing required properties');
        }
        // Check if properties have expected types
        if (typeof Titre !== 'string' || typeof Source !== 'string' || typeof Content !== 'string') {
          console.error('Invalid organized result format: unexpected property types', { Titre, Source, Content });
          throw new Error('Invalid organized result format: unexpected property types');
        }
        structuredText += `\nTitre : ${Titre}\nSource : ${Source}\nContenu : ${Content}\n`;
      }
    }

    structuredText += `\n`;
  }

  return structuredText;
}

/**
 * Performs a search using Tavily API.
 * @param query - The query to search for.
 * @param options - Optional parameters for the search.
 * @returns A promise that resolves to search results.
 */
async function performSearch(query: string, options: Record<string, any> = {}): Promise<any> {
  const apiKey = process.env.TAVILY_API_KEY; 
  const tavilyUrl = 'https://api.tavily.com/search';

  try {
    console.log(`Recherche en cours pour la requête : ${query}`);

    const requestBody = {
      query,
      include_answer: true,
      include_raw_content: true,
      search_depth: "advanced",
      ...options,
    };

    const response = await fetch(tavilyUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const responseData = await response.json();
    console.log('Résultats de recherche de l\'API :', responseData); 
    if (!response.ok) {
      console.error('Réponse API :', responseData); 
      throw new Error(`Recherche échouée : ${responseData.message || 'Aucun message d\'erreur fourni'}`);
    }

    // Check if search results are empty
    if (!responseData || !responseData.results || responseData.results.length === 0) {
      console.error('Aucun résultat de recherche trouvé pour la requête :', query);
      throw new Error('Aucun résultat de recherche trouvé');
    }

    return responseData; 
  } catch (error) {
    console.error('Erreur lors de la recherche :', error);
    throw error; 
  }
}

export default completeSearch;