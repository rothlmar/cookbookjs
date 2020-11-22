const recipes = {};
const frac_dict = {"0.00": "", "0.25": "1/4", "0.33": "1/3", "0.50": "1/2", "0.66": "2/3",
		   "0.67": "2/3", "0.75": "3/4", "0.13": "1/8", "0.38": "3/8", "0.63": "5/8",
		   "0.88": "7/8"};
const cat_slugs = {"main": "Main Dish", "dsrt": "Dessert", "brd": "Bread", "bkfst": "Breakfast",
			"side": "Side Dish", "oth": "Other", "snack": "Snack", "salad": "Salad"};
const cat_recipes = {"Main Dish": [], "Salad": [], "Side Dish": [], "Bread": [], "Dessert": [],
			     "Breakfast": [], "Snack": [], "Other": []}

function contentify(item) {
  return `<li><a href="#${item.slug}">${item.name}</a></li>`;
}

function generate_toc(cat_map) {
  let output = '';
  for (slug in cat_slugs) {
    const cat = cat_slugs[slug];
    output += `<div class="card">
      <div class="card-header" id="cat-${slug}">
        <h4>
          <button class="btn" type="button" data-toggle="collapse" data-target="#collapse-${slug}">
            ${cat}
          </button>
        </h4>
      </div>
      <div id="collapse-${slug}" class="collapse" data-parent="#toc">
        <div class="card-body">
          <ul>${cat_map[cat].map(contentify).join('\n')}</ul>
        </div>
      </div>
    </div>`;
  }
  return output;
}

function normalize_unit(unit) {
  return  ['itm', 'oth'].includes(unit) ? '' : unit;
}

function format_origin(origin) {
  return origin.trim() ? `<h4><small class="text-muted">From ${origin}</small></h4>` : '';
}

function normalize_amount(amount) {
  const val = Number.parseFloat(amount);
  const decimal_part = val % 1;
  const int_part = Number.parseInt(val);
  const frac_part = frac_dict[decimal_part.toFixed(2)] || decimal_part;
  return `${int_part > 0 ? int_part : ""} ${frac_part == 0 ? '' : frac_part}`.trim();
}

function ingredient_list(ingredients) {
  return ingredients.map(
    i => `<li>${normalize_amount(i.amount)} ${normalize_unit(i.unit)} ${i.name}</li>`).join('\n');
}

function instruction_list(instructions) {
  return instructions.map(i => `<li>${i}</li>`).join('\n');
}

function detail(recipe) {
  return `<h3>${recipe.name}</h3>
    ${format_origin(recipe.origin)}
    <div><i>Cooking time: ${recipe.cooking_time} minutes, Serves ${recipe.servings}</i></div>
    <ul>${ingredient_list(recipe.ingredients)}</ul>
    <ol>${instruction_list(recipe.instructions)}</ol>` 
}

function loadRecipe() {
  const slug = document.location.hash.substring(1);
  if (recipes.hasOwnProperty(slug)) {
    document.getElementById('detail').innerHTML = detail(recipes[slug]);
  }
}  

document.addEventListener('DOMContentLoaded', function() {
  firebase.database().ref('/recipes').on('value', snapshot => {
    snapshot.val().forEach(i => {recipes[i.slug] = i;
				 cat_recipes[cat_slugs[i.dish]].push(i)
				});
    document.getElementById('toc').innerHTML = generate_toc(cat_recipes);
    loadRecipe();
  });
});

window.addEventListener("hashchange", loadRecipe, false);
