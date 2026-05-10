import { base44 } from './base44Client';

const MODEL = 'gemini_3_flash';
const LLM = (prompt, opts = {}) =>
  base44.integrations.Core.InvokeLLM({ prompt, model: MODEL, ...opts });

// ─── Shared schemas ────────────────────────────────────────────────────────────
const PRODUCTS_SCHEMA = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      category: { type: 'string' },
      product_name: { type: 'string' },
      brand: { type: 'string' },
      shade: { type: 'string' },
      application_tip: { type: 'string' },
    },
  },
};

const LOOK_SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    occasion: { type: 'string' },
    look_details: { type: 'string' },
    products: PRODUCTS_SCHEMA,
  },
};

// ─── MakeupLook entity CRUD ────────────────────────────────────────────────────
const ENTITY = 'MakeupLook';
export const getLooks    = ()          => base44.entities[ENTITY].list();
export const createLook  = (data)      => base44.entities[ENTITY].create(data);
export const updateLook  = (id, patch) => base44.entities[ENTITY].update(id, patch);
export const deleteLook  = (id)        => base44.entities[ENTITY].delete(id);
export const toggleFav   = (id, curr)  => base44.entities[ENTITY].update(id, { is_favorite: !curr });
export const uploadImage = (file)      => base44.integrations.Core.UploadFile({ file });

// ─── Artist chat ───────────────────────────────────────────────────────────────
export async function artistChat({ artist, history, userMessage, context = {} }) {
  const ctxStr = Object.entries(context).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join(', ');
  const hist = history.map(m => `${m.role === 'user' ? 'User' : artist.name}: ${m.content}`).join('\n');
  return LLM(
    `You are ${artist.name}, world-renowned makeup artist from ${artist.origin}, specialising in ${artist.specialty}. Be warm, expert, and specific.\n\n${ctxStr ? `Context: ${ctxStr}\n\n` : ''}${hist}\nUser: ${userMessage}\n${artist.name}:`
  );
}

// ─── Generate full structured look ────────────────────────────────────────────
export async function generateFullLook({ artist, occasion, skinTone, eyeColor, outfitColor, hasPhoto }) {
  return LLM(
    `You are ${artist.name} (${artist.specialty}, ${artist.origin}). Create a complete makeup look:\n- Occasion: ${occasion || 'everyday'}\n- Skin tone: ${skinTone || 'medium'}\n- Eye color: ${eyeColor || 'brown'}\n- Outfit: ${outfitColor}\n${hasPhoto ? '- User uploaded a reference photo.\n' : ''}Include step-by-step instructions and 5-6 specific product recommendations.`,
    { response_json_schema: LOOK_SCHEMA }
  );
}

// ─── Skin analysis ─────────────────────────────────────────────────────────────
export async function analyseSkin({ hasPhoto, description }) {
  return LLM(
    `You are a world-leading dermatologist and AI beauty expert. ${hasPhoto ? 'User uploaded a facial photo.' : ''} ${description ? `Context: ${description}` : ''}\nProvide a comprehensive skin analysis.`,
    {
      response_json_schema: {
        type: 'object',
        properties: {
          skin_type: { type: 'string' },
          hydration_level: { type: 'string' },
          pore_size: { type: 'string' },
          texture: { type: 'string' },
          skin_score: { type: 'number' },
          concerns: { type: 'array', items: { type: 'string' } },
          positive_attributes: { type: 'array', items: { type: 'string' } },
          treatments: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                concern: { type: 'string' },
                recommendation: { type: 'string' },
                key_ingredients: { type: 'array', items: { type: 'string' } },
                product_suggestion: { type: 'string' },
              },
            },
          },
          makeup_tips: { type: 'array', items: { type: 'string' } },
        },
      },
    }
  );
}

// ─── Virtual try-on ────────────────────────────────────────────────────────────
export async function virtualTryOn({ lookName, lookDesc, hasPhoto }) {
  return LLM(
    `You are a visual AI makeup artist. The user${hasPhoto ? ' uploaded their selfie and' : ''} wants to virtually try "${lookName}" (${lookDesc}). Describe vividly how the look appears on their face, which products are applied, final impression, and 2 personalisation tweaks. Write as if they are looking in a mirror.`
  );
}

// ─── Seasonal AI tips ──────────────────────────────────────────────────────────
export async function getSeasonalTips({ seasonName }) {
  return LLM(
    `Give 3 deeply expert makeup tips for the ${seasonName} season. Include textures, finishing techniques, layering secrets, and 2 real product recommendations per tip.`
  );
}

// ─── Aria voice agent ─────────────────────────────────────────────────────────
export const ARIA_SYSTEM = `You are Aria, a world-class AI beauty expert. Skills: skin type detection, face analysis, makeup artistry, product expertise, beauty trends. Keep voice responses SHORT (2-4 sentences). Be warm, encouraging, expert. Respond in the same language as the user.`;

export async function ariaChat({ history, userMessage, lang = 'en' }) {
  const hist = [...history, { role: 'user', content: userMessage }]
    .map(m => `${m.role === 'user' ? 'User' : 'Aria'}: ${m.content}`).join('\n');
  return LLM(`${ARIA_SYSTEM}\n\nConversation:\n${hist}\n\nRespond as Aria (2-4 sentences, in ${lang}):`);
}

export async function extractLookFromAria({ userMessage, ariaReply }) {
  return LLM(
    `Extract a structured look if one was recommended. Return has_look=false if no specific look was described.\nUser: ${userMessage}\nAria: ${ariaReply}`,
    {
      response_json_schema: {
        type: 'object',
        properties: {
          has_look: { type: 'boolean' },
          ...LOOK_SCHEMA.properties,
        },
      },
    }
  );
}

// ─── Trending / news feed ─────────────────────────────────────────────────────
export async function fetchTrendingCategory({ categoryLabel, query }) {
  return LLM(
    `Search for the latest ${categoryLabel} in the makeup and beauty world for 2025. Return 4 items with: title (short punchy headline), description (1 sentence), source (e.g. Vogue Beauty, Allure), url (real URL to vogue.com/allure.com/harpersbazaar.com), tag (one keyword e.g. "Lip", "Skin", "Celebrity").`,
    {
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                source: { type: 'string' },
                url: { type: 'string' },
                tag: { type: 'string' },
              },
            },
          },
        },
      },
    }
  );
}

// ─── Products page ─────────────────────────────────────────────────────────────
export async function fetchProducts({ category = 'All', search = '' }) {
  return LLM(
    `List 8 real, currently available beauty products${category !== 'All' ? ` in the category: ${category}` : ''}${search ? ` matching: "${search}"` : ''}. Include brand, product name, price range, shade options, skin type suitability, and a one-line benefit.`,
    {
      response_json_schema: {
        type: 'object',
        properties: {
          products: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                category: { type: 'string' },
                product_name: { type: 'string' },
                brand: { type: 'string' },
                price_range: { type: 'string' },
                shades: { type: 'string' },
                skin_type: { type: 'string' },
                benefit: { type: 'string' },
                emoji: { type: 'string' },
              },
            },
          },
        },
      },
    }
  );
}
