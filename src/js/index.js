import Search from './models/Search';
import Recipe from './models/Recipe';
import { elements, renderLoader, clearLoader } from './views/base';
import * as searchView from './views/searchView';

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
    //create a new recipe object
    state.recipe = new Recipe(id);

    //get recipe info
    await state.recipe.getRecipe();

    //calc servings/time
    state.recipe.calcTime();
    state.recipe.calcServings();

    //render results
    console.log(state.recipe);
  }
};

//recipe listeners
window.addEventListener('hashchange', controlRecipe);
