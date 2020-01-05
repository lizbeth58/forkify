import axios from 'axios';

//model
export default class Recipe {
  constructor(id) {
    this.id = id;
  }

  async getRecipe() {
    try {
      //ajax call
      const res = await axios(
        `https://forkify-api.herokuapp.com/api/get?rId=${this.id}`
      );
      console.log(res);
      //populate model
      this.title = res.data.recipe.title;
      this.author = res.data.recipe.publisher;
      this.img = res.data.recipe.image_url;
      this.url = res.data.recipe.source_url;
      this.ingredients = res.data.recipe.ingredients;
    } catch (error) {
      alert(error);
    }
  }

  calcTime() {
    const numIng = this.ingredients.length;
    const periods = Math.ceil(numIng / 3);
    this.time = periods * 15;
  }

  calcServings() {
    this.servings = 4;
  }

  parseIngredients() {
    const unitsLong = [
      'tablespoons',
      'tablespoon',
      'ounce',
      'ounces',
      'teaspoon',
      'teaspoons',
      'cups',
      'pounds'
    ];
    const unitShort = [
      'tbsp',
      'tbsp',
      'oz',
      'oz',
      'tsp',
      'tsp',
      'cup',
      'pound'
    ];

    const units = [...unitShort, 'kg', 'g'];

    const newIngredients = this.ingredients.map(el => {
      //uniform units
      let ingredient = el.toLowerCase();

      unitsLong.forEach((unit, i) => {
        ingredient = ingredient.replace(unit, unitShort[i]);
      });

      //remove parenthesis
      ingredient = ingredient.replace(/ *\([^)]*\) */g, ' ');

      //parse ingredients into count, unit and ingredient
      const arrIng = ingredient.split(' ');
      const unitIndex = arrIng.findIndex(el2 => unitShort.includes(el2));

      let objIng;
      if (unitIndex > -1) {
        const arrCount = arrIng.slice(0, unitIndex);

        let count;
        if (arrCount.length === 1) {
          count = eval(arrIng[0].replace('-', '+'));
        } else {
          count = eval(arrIng.slice(0, unitIndex).join('+'));
        }

        objIng = {
          count,
          unit: arrIng[unitIndex],
          ingredient: arrIng.slice(unitIndex + 1).join(' ')
        };
      } else if (parseInt(arrIng[0], 10)) {
        objIng = {
          count: parseInt(arrIng[0], 10),
          unit: '',
          ingredient: arrIng.slice(1).join(' ')
        };
      } else if (unitIndex === -1) {
        objIng = {
          count: 1,
          unit: '',
          ingredient
        };
      }

      return objIng;
    });

    this.ingredients = newIngredients;
  }

  updateServings(type) {
    //servings
    const newServings = type === 'dec' ? this.servings - 1 : this.servings + 1;

    //ingredients
    this.ingredients.forEach(ing => (ing.count *= newServings / this.servings));

    this.servings = newServings;
  }
}
