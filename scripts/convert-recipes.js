// scripts/convert-recipes.js
// Run with: node scripts/convert-recipes.js
// Converts recipes.csv → public/recipes-db.json in the app's recipe schema

import { createReadStream } from 'fs';
import { writeFileSync, mkdirSync } from 'fs';
import { createInterface } from 'readline';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CSV_PATH = join(__dirname, '../../recipes/recipes.csv');
const OUT_PATH = join(__dirname, '../public/recipes-db.json');

// ── helpers ────────────────────────────────────────────────────────────────

function parseTime(str) {
  if (!str) return null;
  const h = str.match(/(\d+)\s*h/i);
  const m = str.match(/(\d+)\s*m/i);
  return (h ? parseInt(h[1]) * 60 : 0) + (m ? parseInt(m[1]) : 0) || null;
}

function parseMealType(cuisinePath) {
  if (!cuisinePath) return 'dinner';
  const p = cuisinePath.toLowerCase();
  if (p.includes('breakfast') || p.includes('brunch')) return 'breakfast';
  if (p.includes('lunch') || p.includes('salad') || p.includes('sandwich') ||
      p.includes('soup') || p.includes('appetizer') || p.includes('side')) return 'lunch';
  return 'dinner';
}

function parseTags(cuisinePath) {
  if (!cuisinePath) return [];
  return cuisinePath
    .split('/')
    .map(s => s.trim().toLowerCase())
    .filter(s => s.length > 0 && s !== 'recipes');
}

function parseIngredients(raw) {
  if (!raw) return [];
  // Split on ", " followed by a digit or capital letter (rough heuristic for ingredient boundaries)
  const parts = raw.split(/,\s+(?=\d|[A-Z])/);
  return parts
    .map(s => s.trim())
    .filter(s => s.length > 2)
    .map(s => {
      // Try to separate amount from ingredient name
      const m = s.match(/^([\d\/\.\s¼½¾⅓⅔⅛⅜⅝⅞][\w\s\-]*(?:tablespoon|teaspoon|cup|ounce|pound|gram|kg|ml|liter|pinch|dash|clove|slice|sprig|bunch|can|package|oz|lb|g|tbsp|tsp)[s]?\.?\s*)?(.+)/i);
      if (m && m[1]) {
        return { item: m[2].trim(), amount: m[1].trim(), aisle: 'Pantry' };
      }
      return { item: s, amount: '', aisle: 'Pantry' };
    })
    .slice(0, 20); // cap at 20 ingredients
}

function parseSteps(raw) {
  if (!raw) return [];
  return raw
    .split(/\n+/)
    .map(s => s.replace(/^\d+\.\s*/, '').trim())
    .filter(s => s.length > 10)
    .slice(0, 20);
}

function parseNutrition(raw) {
  if (!raw) return { calories: null, protein: null, carbs: null, fat: null };
  const num = (pattern) => {
    const m = raw.match(pattern);
    return m ? parseFloat(m[1]) : null;
  };
  return {
    calories: num(/Calories[:\s]+(\d+)/i) || num(/(\d+)\s*Cal/i),
    protein:  num(/Protein[:\s]+([\d.]+)/i),
    carbs:    num(/(?:Total )?Carbohydrate[:\s]+([\d.]+)/i),
    fat:      num(/Total Fat[:\s]+([\d.]+)/i),
  };
}

function inferNutritionLabel(cuisinePath, nutrition) {
  if (!cuisinePath) return 'Balanced';
  const p = cuisinePath.toLowerCase();
  if (p.includes('vegetarian') || p.includes('vegan')) return 'Plant-Based';
  if (p.includes('healthy') || p.includes('low-calorie') || p.includes('diet')) return 'Light';
  if (p.includes('dessert') || p.includes('cake') || p.includes('cookie')) return 'Indulgent';
  if (p.includes('seafood') || p.includes('fish')) return 'High Protein';
  if (p.includes('chicken') || p.includes('beef') || p.includes('pork')) return 'High Protein';
  if (nutrition.calories && nutrition.calories < 300) return 'Light';
  if (nutrition.protein && nutrition.protein > 25) return 'High Protein';
  return 'Balanced';
}

// ── CSV parser ──────────────────────────────────────────────────────────────
// Handles RFC 4180 quoted fields

function parseCsvLine(line) {
  const fields = [];
  let i = 0;
  while (i < line.length) {
    if (line[i] === '"') {
      let j = i + 1;
      let val = '';
      while (j < line.length) {
        if (line[j] === '"' && line[j + 1] === '"') { val += '"'; j += 2; }
        else if (line[j] === '"') { j++; break; }
        else { val += line[j]; j++; }
      }
      fields.push(val);
      i = j;
      if (line[i] === ',') i++;
    } else {
      let j = i;
      while (j < line.length && line[j] !== ',') j++;
      fields.push(line.slice(i, j));
      i = j + 1;
    }
  }
  return fields;
}

// ── full-file CSV tokenizer ─────────────────────────────────────────────────
// Properly handles multi-line quoted fields by tokenizing character by character

function* tokenizeCSV(text) {
  let i = 0;
  while (i <= text.length) {
    const record = [];
    // parse one record
    while (i <= text.length) {
      if (i >= text.length || text[i] === '\n') {
        // bare newline ends record (only if we're not inside a field)
        i++;
        break;
      }
      if (text[i] === '\r' && text[i+1] === '\n') { i += 2; break; }

      // parse one field
      let field = '';
      if (text[i] === '"') {
        i++; // opening quote
        while (i < text.length) {
          if (text[i] === '"' && text[i+1] === '"') { field += '"'; i += 2; }
          else if (text[i] === '"') { i++; break; } // closing quote
          else { field += text[i++]; }
        }
        // skip comma after field
        if (text[i] === ',') i++;
      } else {
        while (i < text.length && text[i] !== ',' && text[i] !== '\n' && text[i] !== '\r') {
          field += text[i++];
        }
        if (text[i] === ',') i++;
      }
      record.push(field);
    }
    if (record.length > 1 || (record.length === 1 && record[0] !== '')) {
      yield record;
    }
  }
}

// ── main ───────────────────────────────────────────────────────────────────

import { readFileSync } from 'fs';

async function main() {
  console.log('Reading CSV...');
  const text = readFileSync(CSV_PATH, 'utf8');

  const db = { breakfast: [], lunch: [], dinner: [] };
  let rowNum = 0;
  let skipped = 0;

  for (const fields of tokenizeCSV(text)) {
    rowNum++;
    if (rowNum === 1) continue; // skip header

    if (fields.length < 9) { skipped++; continue; }

    const name = fields[1]?.trim();
    if (!name) { skipped++; continue; }

    const nutrition = parseNutrition(fields[12]);
    const cuisinePath = fields[11] || '';
    const mealType = parseMealType(cuisinePath);
    const prepTime = parseTime(fields[2]) || parseTime(fields[4]) || 30;
    const servings = parseInt(fields[5]) || 2;
    const rating = parseFloat(fields[9]) || null;
    const id = `csv_${fields[0] || rowNum}`;

    const recipe = {
      id,
      name,
      image: '🍽️',
      prepTime,
      servings,
      summary: `${cuisinePath.split('/').filter(Boolean).slice(-2).join(' › ')} recipe.`,
      nutritionLabel: inferNutritionLabel(cuisinePath, nutrition),
      calories: nutrition.calories || 400,
      protein: nutrition.protein || 20,
      carbs: nutrition.carbs || 40,
      fat: nutrition.fat || 15,
      rating,
      tags: parseTags(cuisinePath),
      ingredients: parseIngredients(fields[7]),
      steps: parseSteps(fields[8]),
      source_url: fields[10] || '',
      img_src: fields[14]?.trim() || '',
      meal_type: mealType,
      skipped: false,
    };

    db[mealType].push(recipe);
  }

  mkdirSync(join(__dirname, '../public'), { recursive: true });
  writeFileSync(OUT_PATH, JSON.stringify(db));

  const total = db.breakfast.length + db.lunch.length + db.dinner.length;
  console.log(`✓ Done. ${total} recipes (${db.breakfast.length} breakfast, ${db.lunch.length} lunch, ${db.dinner.length} dinner). Skipped: ${skipped}`);
  console.log(`✓ Output: ${OUT_PATH}`);
}

main().catch(console.error);
