import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import { elements, renderLoader, clearLoader } from './views/base';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';

//app state
const state = {};

//search controller
const controlSearch = async () => {
  //get query from view
  const query = searchView.getInput();

  if (query) {
    //new search object and add to state
    state.search = new Search(query);

    //prepare UI for results
    searchView.clearInput();
    searchView.clearResults();
    renderLoader(elements.searchRes);

    //search for recipes
    await state.search.getResults();

    //render results to UI
    searchView.renderResults(state.search.result);
    clearLoader();
  }
};
//search listeners
elements.searchForm.addEventListener('submit', e => {
  e.preventDefault();
  controlSearch();
});

elements.searchResPages.addEventListener('click', e => {
  e.preventDefault();
  const btn = e.target.closest('.btn-inline');
  if (btn) {
    const goToPage = parseInt(btn.dataset.goto, 10);
    searchView.clearResults();
    searchView.renderResults(state.search.result, goToPage);
  }
});

//recipe controller
const controlRecipe = async () => {
  //get id from view
  const id = window.location.hash.replace('#', '');

  //prepare UI for results
  if (id) {
    recipeView.clearRecipe();
    renderLoader(elements.recipe);

    //highlighet selected
    if (state.search) searchView.highlightSelected(id);

    //create a new recipe object
    state.recipe = new Recipe(id);

    try {
      //get recipe info
      await state.recipe.getRecipe();

      state.recipe.parseIngredients();

      //calc servings/time
      state.recipe.calcTime();
      state.recipe.calcServings();

      clearLoader();
      //render results
      recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));
    } catch (e) {
      alert(e);
    }
  }
};

const controlList = () => {
  //create a new list
  if (!state.list) state.list = new List();

  //add ingredients to list
  state.recipe.ingredients.forEach(el => {
    const item = state.list.addItem(el.count, el.unit, el.ingredient);
    listView.renderItem(item);
  });
};

const controlLike = id => {
  if (!state.likes) state.likes = new Likes();

  const currentId = state.recipe.id;

  if (!state.likes.isLiked(currentId)) {
    const newLike = state.likes.addLike(
      currentId,
      state.recipe.title,
      state.recipe.author,
      state.recipe.img
    );
    //toggle like button
    likesView.toggleLikeBtn(true);
    likesView.renderLike(newLike);
  } else {
    state.likes.deleteLike(currentId);
    likesView.toggleLikeBtn(false);
    likesView.deleteLike(currentId);
  }
  likesView.toggleLikeMenu(state.likes.getNumLikes());
};

elements.shopping.addEventListener('click', e => {
  const id = e.target.closest('.shopping__item').dataset.itemid;

  if (e.target.matches('.shopping__delete, .shopping__delete *')) {
    state.list.deleteItem(id);
    listView.deleteItem(id);
  } else if (e.target.matches('.shopping__count-value')) {
    const val = parseFloat(e.target.value);

    state.list.updateCount(id, val);
  }
});
//recipe listeners
window.addEventListener('hashchange', controlRecipe);

window.addEventListener('load', () => {
  state.likes = new Likes();
  state.likes.readStorage();
  likesView.toggleLikeMenu(state.likes.getNumLikes());
  state.likes.likes.forEach(like => likesView.renderLike(like));
});

//recipe button clicks
elements.recipe.addEventListener('click', e => {
  if (e.target.matches('.btn-decrease, .btn-decrease *')) {
    if (state.recipe.servings > 1) {
      state.recipe.updateServings('dec');
      recipeView.updateServingsIngredients(state.recipe);
    }
  } else if (e.target.matches('.btn-increase, .btn-increase *')) {
    state.recipe.updateServings();
    recipeView.updateServingsIngredients(state.recipe);
  } else if (e.target.matches('.recipe__btn, .recipe__btn *')) {
    controlList();
  } else if (e.target.matches('.recipe__love, .recipe__love *')) {
    controlLike();
  }
});
